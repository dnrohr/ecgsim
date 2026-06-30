#!/usr/bin/env python3
"""Create a checksum manifest for a legacy ECGSIM export directory."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import GeometryFormatError, MatrixFormatError, read_geometry, read_matrix, read_vector


MATRIX_EXTENSIONS = {
    ".adjanis",
    ".adj2d",
    ".adj3d",
    ".adaptECG",
    ".dstanis",
    ".dst2d",
    ".dst3d",
    ".int",
    ".mat",
    ".refECG",
    ".source",
    ".tra",
}
VECTOR_SUFFIXES = (
    ".user.ampl",
    ".user.dep",
    ".user.depslope",
    ".user.platslope",
    ".user.rep",
    ".user.repslope",
    ".user.rest",
)
REQUIRED_PARITY_ARTIFACTS = {
    "tmpSource": lambda path: has_legacy_suffix(path.name, (".user.source",)),
    "adaptedEcg": lambda path: path.name.endswith(".adaptECG"),
    "referenceEcg": lambda path: path.name.endswith(".refECG"),
}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(root: Path) -> dict[str, object]:
    files = []
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        relative = path.relative_to(root).as_posix()
        files.append(
            {
                "path": relative,
                "bytes": path.stat().st_size,
                "sha256": file_sha256(path),
                "classification": classify_export_file(path),
                "numericSummary": numeric_summary(path),
            }
        )
    parity_artifacts = parity_artifact_coverage(Path(file["path"]) for file in files)
    return {
        "exportRoot": root.as_posix(),
        "fileCount": len(files),
        "totalBytes": sum(file["bytes"] for file in files),
        "parityArtifacts": parity_artifacts,
        "readyForNumericalParity": all(item["present"] for item in parity_artifacts.values()),
        "files": files,
    }


def classify_export_file(path: Path) -> str:
    name = path.name
    if has_legacy_suffix(name, VECTOR_SUFFIXES):
        return "source-parameter-vector"
    if has_legacy_suffix(name, (".user.source",)):
        return "tmp-source-matrix"
    if name.endswith(".refECG"):
        return "reference-ecg-matrix"
    if name.endswith(".adaptECG"):
        return "adapted-ecg-matrix"
    if path.suffix == ".tri":
        return "geometry-triangulation"
    if path.suffix == ".elec":
        return "electrodes"
    if path.suffix in MATRIX_EXTENSIONS:
        return "matrix"
    return "unknown"


def numeric_summary(path: Path) -> dict[str, object] | None:
    classification = classify_export_file(path)
    try:
        if classification == "geometry-triangulation":
            geometry = read_geometry(path)
            return {
                "format": geometry.storage_format,
                "points": geometry.point_count,
                "triangles": geometry.triangle_count,
                "units": geometry.units,
                "sourceIndexBase": geometry.source_index_base,
            }
        if classification == "source-parameter-vector":
            vector = read_vector(path)
            return {
                "format": vector.storage_format,
                "length": vector.length,
            }
        if classification.endswith("matrix") or classification == "matrix":
            matrix = read_matrix(path)
            return {
                "format": matrix.storage_format,
                "rows": matrix.rows,
                "columns": matrix.columns,
            }
    except (GeometryFormatError, MatrixFormatError, ValueError) as exc:
        return {
            "error": str(exc),
        }
    return None


def parity_artifact_coverage(paths: object) -> dict[str, dict[str, object]]:
    path_tuple = tuple(paths)
    coverage: dict[str, dict[str, object]] = {}
    for name, matcher in REQUIRED_PARITY_ARTIFACTS.items():
        matches = sorted(path.as_posix() for path in path_tuple if matcher(path))
        coverage[name] = {
            "present": bool(matches),
            "paths": matches,
        }
    return coverage


def has_legacy_suffix(name: str, suffixes: tuple[str, ...]) -> bool:
    return any(name.endswith(suffix) or name == suffix.lstrip(".") for suffix in suffixes)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export_dir", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        help="Write the manifest as UTF-8 JSON instead of printing to stdout.",
    )
    args = parser.parse_args()
    export_dir = args.export_dir
    if not export_dir.is_dir():
        parser.error(f"{export_dir} is not a directory")
    manifest = json.dumps(build_manifest(export_dir), indent=2) + "\n"
    if args.output:
        args.output.write_text(manifest, encoding="utf-8")
    else:
        print(manifest, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
