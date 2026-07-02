"""Write a supported ECGSIM-style export directory from parsed case data."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Iterable, Sequence

from ecgsim.io.ecgsimcase import (
    ECGsimCase,
    ECGsimCaseGeometry,
    ECGsimCaseSource,
    load_case,
    read_ecgsimcase_matrix,
)
from ecgsim.io.geometry import GeometryData


SOURCE_PARAMETER_EXPORT_NAMES = {
    "depolarizationMs": "user.dep",
    "repolarizationMs": "user.rep",
    "amplitude": "user.ampl",
    "restingPotential": "user.rest",
    "depolarizationSlope": "user.depslope",
    "repolarizationSlope": "user.repslope",
    "plateauSlope": "user.platslope",
}

GEOMETRY_EXPORT_NAMES = {
    "heart": "ventricle.tri",
    "thorax": "thorax.tri",
    "right_lung": "rlung.tri",
    "left_lung": "llung.tri",
}


@dataclass(frozen=True)
class ExportDirectoryResult:
    """Summary of files written by :func:`export_case_directory`."""

    output_dir: Path
    written_files: tuple[Path, ...]
    unsupported_members: tuple[str, ...]
    metadata_path: Path


def export_case_directory(case_or_path: ECGsimCase | str | Path, output_dir: str | Path) -> ExportDirectoryResult:
    """Write supported ECGSIM export-directory files.

    The writer intentionally emits the legacy ASCII matrix/vector/triangulation
    formats where the parser has confirmed source data. It does not claim to be
    a complete replacement for legacy File -> Export until raw legacy export
    directories are available for comparison.
    """

    case = load_case(case_or_path) if isinstance(case_or_path, (str, Path)) else case_or_path
    output_root = Path(output_dir)
    output_root.mkdir(parents=True, exist_ok=True)

    written: list[Path] = []
    unsupported: list[str] = []

    written.extend(_write_geometries(case.geometries, output_root, unsupported))
    written.extend(_write_sources(case.sources, output_root, unsupported, sample_count=case.signal_metadata.columns))
    written.extend(_write_signal_matrix(case, output_root))

    metadata_path = output_root / "metadata.json"
    metadata = {
        "format": "org.ecgsim.export-directory",
        "version": 1,
        "sourceCase": {
            "path": str(case.metadata.source_path),
            "fileName": case.metadata.source_path.name,
            "sha256": case.metadata.sha256,
        },
        "writtenFiles": sorted(_relative_posix(path, output_root) for path in written),
        "unsupportedMembers": tuple(unsupported) + _known_unsupported_members(case),
        "notes": (
            "Modern supported subset using legacy ASCII matrix, vector, and .tri formats; "
            "not yet a byte-for-byte legacy File -> Export clone."
        ),
    }
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    written.append(metadata_path)

    return ExportDirectoryResult(
        output_dir=output_root,
        written_files=tuple(written),
        unsupported_members=tuple(metadata["unsupportedMembers"]),
        metadata_path=metadata_path,
    )


def write_ascii_matrix(path: str | Path, rows: Sequence[Sequence[float]]) -> Path:
    """Write an ECGSIM ASCII matrix readable by :func:`ecgsim.io.read_matrix`."""

    target = Path(path)
    if not rows:
        raise ValueError("matrix must contain at least one row")
    column_count = len(rows[0])
    if column_count == 0:
        raise ValueError("matrix must contain at least one column")
    for row in rows:
        if len(row) != column_count:
            raise ValueError("all matrix rows must have the same column count")

    target.parent.mkdir(parents=True, exist_ok=True)
    lines = [f"{len(rows)} {column_count}"]
    lines.extend(" ".join(_format_float(value) for value in row) for row in rows)
    target.write_text("\n".join(lines) + "\n", encoding="ascii")
    return target


def write_ascii_vector(path: str | Path, values: Sequence[float]) -> Path:
    """Write a one-column ECGSIM ASCII vector file."""

    if not values:
        raise ValueError("vector must contain at least one value")
    return write_ascii_matrix(path, tuple((value,) for value in values))


def write_ascii_tri(path: str | Path, geometry: GeometryData, *, scale_to_meters: float = 1.0) -> Path:
    """Write an ASCII ECGSIM ``.tri`` file with one-based triangle indices."""

    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    lines = [str(geometry.point_count)]
    for index, point in enumerate(geometry.points, start=1):
        x, y, z = (coordinate * scale_to_meters for coordinate in point)
        lines.append(f"{index} {_format_float(x)} {_format_float(y)} {_format_float(z)}")
    lines.append(str(geometry.triangle_count))
    for index, triangle in enumerate(geometry.triangles, start=1):
        a, b, c = (point_index + 1 for point_index in triangle)
        lines.append(f"{index} {a} {b} {c}")
    target.write_text("\n".join(lines) + "\n", encoding="ascii")
    return target


def _write_geometries(
    geometries: Iterable[ECGsimCaseGeometry], output_root: Path, unsupported: list[str]
) -> list[Path]:
    written: list[Path] = []
    by_name = {geometry.name: geometry for geometry in geometries}
    for geometry_name, file_name in GEOMETRY_EXPORT_NAMES.items():
        case_geometry = by_name.get(geometry_name)
        if case_geometry is None or case_geometry.point_count == 0:
            unsupported.append(f"model/{file_name}: geometry not present")
            continue
        scale = 0.001 if case_geometry.geometry.units == "case-coordinate-units" else 1.0
        written.append(write_ascii_tri(output_root / "model" / file_name, case_geometry.geometry, scale_to_meters=scale))

    for geometry in geometries:
        if geometry.name not in GEOMETRY_EXPORT_NAMES and geometry.point_count > 0:
            unsupported.append(f"model/{geometry.name}: no confirmed legacy export filename")
    return written


def _write_sources(
    sources: Iterable[ECGsimCaseSource],
    output_root: Path,
    unsupported: list[str],
    *,
    sample_count: int,
) -> list[Path]:
    written: list[Path] = []
    for source in sources:
        if source.kind == "atria":
            source_dir = output_root / "atrial_beats" / "beat1"
        elif source.kind == "ventricles":
            source_dir = output_root / "ventricular_beats" / "beat1"
        else:
            unsupported.append(f"{source.id}: unknown source kind {source.kind!r}")
            continue

        for beat in source.beats:
            if beat.id != "beat1":
                unsupported.append(f"{source.kind}/{beat.id}: only beat1 export is implemented")
                continue
            for parameter in beat.parameters:
                export_name = SOURCE_PARAMETER_EXPORT_NAMES.get(parameter.name)
                if export_name is None:
                    unsupported.append(f"{source.kind}/{beat.id}/{parameter.name}: no export extension mapping")
                    continue
                vector = parameter.adapted or parameter.initial
                if vector is None or vector.length == 0:
                    unsupported.append(f"{source.kind}/{beat.id}/{export_name}: empty or missing vector")
                    continue
                written.append(write_ascii_vector(source_dir / export_name, vector.values))
            tmp_matrix = _tmp_matrix_for_beat(source, beat.id, sample_count)
            if tmp_matrix:
                written.append(write_ascii_matrix(source_dir / "user.source", tmp_matrix))
            else:
                unsupported.append(f"{source.kind}/{beat.id}/user.source: missing TMP parameters")

        if source.activation is not None:
            unsupported.append(f"{source.kind}/activation: parsed but no confirmed legacy export filename")
        if source.unknown_vectors:
            unsupported.append(f"{source.kind}/unknownVectors: {len(source.unknown_vectors)} vector(s) not exported")
    return written


def _tmp_matrix_for_beat(
    source: ECGsimCaseSource, beat_id: str, sample_count: int
) -> tuple[tuple[float, ...], ...]:
    from ecgsim.core.tmp import generate_tmp_matrix_from_vectors

    beat = next((candidate for candidate in source.beats if candidate.id == beat_id), None)
    if beat is None:
        return ()
    parameter_vectors = {
        parameter.name: {
            "initial": parameter.initial.values if parameter.initial else (),
            "adapted": parameter.adapted.values if parameter.adapted else (),
        }
        for parameter in beat.parameters
    }
    required = (
        "depolarizationMs",
        "repolarizationMs",
        "restingPotential",
        "amplitude",
        "plateauSlope",
        "depolarizationSlope",
        "repolarizationSlope",
    )
    if any(not parameter_vectors.get(name, {}).get("adapted") for name in required):
        return ()
    return generate_tmp_matrix_from_vectors(parameter_vectors, "adapted", sample_count, 1000.0)


def _write_signal_matrix(case: ECGsimCase, output_root: Path) -> list[Path]:
    matrix = read_ecgsimcase_matrix(case.metadata.source_path, case.signal_metadata.matrix_offset)
    target = output_root / "ecgs" / "thorax.refECG"
    return [write_ascii_matrix(target, matrix.values)]


def _known_unsupported_members(case: ECGsimCase) -> tuple[str, ...]:
    members = [
        "model adjacency, distance, anisotropy, transfer, and lead transfer matrices",
        "electrode .elec files",
        "adapted ECG recomputation output",
        "raw legacy display/layout state",
    ]
    members.extend(case.metadata.unsupported_payloads)
    members.extend(case.signal_metadata.unsupported_fields)
    for lead_system in case.lead_systems:
        members.extend(f"{lead_system.name}: {field}" for field in lead_system.unsupported_fields)
    return tuple(dict.fromkeys(members))


def _format_float(value: float) -> str:
    return format(float(value), ".17g")


def _relative_posix(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()
