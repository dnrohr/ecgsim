#!/usr/bin/env python3
"""Export small viewer fixtures from archived ECGSIM source data."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.core import generate_tmp_waveform_from_vectors
from ecgsim.io import (
    load_case,
    read_ecgsimcase_matrix,
)


SIGNAL_SOURCE = ROOT / "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"
SUPPORTED_CASE_SOURCES = (
    ROOT / "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase",
    ROOT / "research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase",
)
HEART_TARGET = ROOT / "app/viewer/public/fixtures/heart.json"
THORAX_TARGET = ROOT / "app/viewer/public/fixtures/thorax.json"
ECG_SIGNAL_TARGET = ROOT / "app/viewer/public/fixtures/ecg-signals.json"
TMP_TARGET = ROOT / "app/viewer/public/fixtures/tmp-waveforms.json"
CASE_METADATA_TARGET = ROOT / "app/viewer/public/fixtures/case-metadata.json"
CASE_BUNDLE_DIR = ROOT / "app/viewer/public/fixtures/cases"
CASE_MANIFEST_TARGET = CASE_BUNDLE_DIR / "manifest.json"
SURFACE_MAP_SAMPLE_COUNT = 576


def case_path_text(case_path: Path) -> str:
    return str(case_path.relative_to(ROOT)).replace("\\", "/")


def case_geometry_payload(case, case_path: Path, name: str) -> dict[str, object]:
    geometry_object = next(
        geometry for geometry in case.geometries if geometry.name == name
    )
    geometry = geometry_object.geometry
    return {
        "source": case_path_text(case_path),
        "sourceGeometryOffset": geometry_object.marker_offset,
        "sourceGeometryName": geometry_object.name,
        "units": "m",
        "pointCount": geometry.point_count,
        "triangleCount": geometry.triangle_count,
        "points": tuple(
            (point[0] / 1000, point[1] / 1000, point[2] / 1000)
            for point in geometry.points
        ),
        "triangles": geometry.triangles,
    }


def nearest_point_index(points: tuple[tuple[float, float, float], ...], target: tuple[float, float, float]) -> int:
    nearest = 0
    nearest_distance = float("inf")
    for index, point in enumerate(points):
        dx = point[0] - target[0]
        dy = point[1] - target[1]
        dz = point[2] - target[2]
        distance = dx * dx + dy * dy + dz * dz
        if distance < nearest_distance:
            nearest = index
            nearest_distance = distance
    return nearest


def ecg_signal_payload(case, case_path: Path) -> dict[str, object]:
    signal = case.signal_metadata
    matrix = read_ecgsimcase_matrix(case_path, signal.matrix_offset)
    if matrix.rows > 250:
        selected_rows = (0, 50, 100, 150, 200, 250)
    else:
        selected_rows = tuple(range(matrix.rows))
    surface_map_sample_count = min(matrix.columns, SURFACE_MAP_SAMPLE_COUNT)
    surface_map_values = tuple(
        tuple(round(matrix.values[row][column], 6) for column in range(surface_map_sample_count))
        for row in range(matrix.rows)
    )
    surface_map_min = min(min(row) for row in surface_map_values)
    surface_map_max = max(max(row) for row in surface_map_values)
    return {
        "source": case_path_text(case_path),
        "sourceMatrixOffset": signal.matrix_offset,
        "signalKind": signal.signal_kind,
        "sampleRateHz": signal.sample_rate_hz,
        "sampleRateSource": "ECGSIM manual 12-lead ECG and surface-potential export formats",
        "rows": matrix.rows,
        "columns": matrix.columns,
        "units": signal.units,
        "unsupportedFields": signal.unsupported_fields,
        "surfaceMap": {
            "kind": "measured",
            "nodeCount": matrix.rows,
            "sampleCount": surface_map_sample_count,
            "sampleRateHz": signal.sample_rate_hz,
            "units": signal.units,
            "valueRange": {
                "min": surface_map_min,
                "max": surface_map_max,
            },
            "valuesByNode": surface_map_values,
        },
        "traces": [
            {
                "name": f"Node {row + 1}",
                "sourceRow": row,
                "values": matrix.values[row],
            }
            for row in selected_rows
        ],
    }


def tmp_waveform_payload(case, case_path: Path) -> dict[str, object]:
    ventricles = next(source for source in case.sources if source.kind == "ventricles")
    beat = ventricles.beats[0]
    parameter_vectors = {
        parameter.name: {
            "initial": parameter.initial,
            "adapted": parameter.adapted,
        }
        for parameter in beat.parameters
        if parameter.initial is not None and parameter.adapted is not None and parameter.initial.length > 0
    }
    parameter_value_vectors = {
        name: {
            "initial": vectors["initial"].values,
            "adapted": vectors["adapted"].values,
        }
        for name, vectors in parameter_vectors.items()
    }
    node_count = parameter_vectors["depolarizationMs"]["initial"].length
    if node_count >= 576:
        selected_nodes = (0, 143, 287, 431, 575)
    else:
        selected_nodes = tuple(round(index * (node_count - 1) / 4) for index in range(5))
    sample_count = 576

    return {
        "source": case_path_text(case_path),
        "signalKind": "parameter-derived TMP preview",
        "sampleRateHz": 1000,
        "sampleCount": sample_count,
        "nodeCount": node_count,
        "units": "legacy TMP parameter units",
        "generationNote": (
            "Preview waveform generated from stored source parameter vectors; "
            "exact legacy TMP generation remains a later parity task."
        ),
        "parameterVectors": {
            name: vectors
            for name, vectors in parameter_value_vectors.items()
        },
        "nodes": [
            {
                "name": f"Heart node {node + 1}",
                "sourceNode": node,
                "parameters": {
                    name: {
                        "initial": vectors["initial"].values[node],
                        "adapted": vectors["adapted"].values[node],
                    }
                    for name, vectors in parameter_vectors.items()
                },
                "initial": generate_tmp_waveform_from_vectors(
                    parameter_value_vectors, node, "initial", sample_count
                ),
                "adapted": generate_tmp_waveform_from_vectors(
                    parameter_value_vectors, node, "adapted", sample_count
                ),
            }
            for node in selected_nodes
        ],
    }


def activation_sample_entries(activation) -> list[dict[str, object]]:
    if not activation or not activation.entries:
        return []
    indexes = (0,) if len(activation.entries) == 1 else (0, len(activation.entries) - 1)
    return [
        {
            "index": index,
            "integerField": activation.entries[index].integer_field,
            "floatField1": round(activation.entries[index].float_field_1, 6),
            "floatField2": round(activation.entries[index].float_field_2, 6),
        }
        for index in indexes
    ]


def case_metadata_payload(case, case_path: Path) -> dict[str, object]:
    metadata = case.metadata
    lead_systems = case.lead_systems
    thorax_points = next(geometry for geometry in case.geometries if geometry.name == "thorax").geometry.points
    wall_mapping_reason = (
        "Endocardial/epicardial and transmural node pairing is unavailable because "
        "PGraphGeometry payload semantics have not been confirmed for this case."
    )
    return {
        "source": case_path_text(case_path),
        "fileName": case_path.name,
        "byteSize": metadata.byte_size,
        "sha256": metadata.sha256,
        "rootSignature": metadata.root_signature,
        "wallMapping": {
            "status": "unavailable",
            "supportsEndocardialEpicardialSwitch": False,
            "supportsTransmuralSelection": False,
            "pairCount": 0,
            "reason": wall_mapping_reason,
            "requiredPayloads": ("PGraphGeometry",),
        },
        "activationConstructions": [
            {
                "sourceId": source.id,
                "sourceKind": source.kind,
                "sourceOffset": source.activation.source_offset if source.activation else None,
                "version": source.activation.version if source.activation else None,
                "entryCount": source.activation.entry_count if source.activation else 0,
                "storageFormat": source.activation.storage_format if source.activation else None,
                "interpretation": source.activation.interpretation if source.activation else None,
                "sampleEntries": activation_sample_entries(source.activation),
            }
            for source in case.sources
        ],
        "leadSystems": tuple(system.name for system in lead_systems),
        "leadSystemDetails": [
            {
                "id": system.id,
                "name": system.name,
                "electrodeCount": len(system.electrodes),
                "leadCount": len(system.lead_labels),
                "shownLeadCount": len(system.shown_lead_labels),
                "referenceCount": len(system.reference_labels),
                "electrodes": [
                    {
                        "id": electrode.id,
                        "label": electrode.label,
                        "position": tuple(value / 1000 for value in electrode.position),
                        "thoraxNodeIndex": nearest_point_index(thorax_points, electrode.position),
                    }
                    for electrode in system.electrodes
                ],
                "unsupportedFields": system.unsupported_fields,
            }
            for system in lead_systems
        ],
        "markerCounts": metadata.marker_counts,
        "unsupportedPayloads": metadata.unsupported_payloads,
        "loadedFixtures": {
            "heart": "heart.json",
            "thorax": "thorax.json",
            "ecgSignals": "ecg-signals.json",
            "tmpWaveforms": "tmp-waveforms.json",
        },
    }


def case_bundle(case_path: Path) -> dict[str, object]:
    case = load_case(case_path)
    return {
        "caseMetadata": case_metadata_payload(case, case_path),
        "heart": case_geometry_payload(case, case_path, "heart"),
        "thorax": {
            "meshes": {
                "thorax": case_geometry_payload(case, case_path, "thorax"),
                "leftLung": case_geometry_payload(case, case_path, "left_lung"),
                "rightLung": case_geometry_payload(case, case_path, "right_lung"),
            }
        },
        "ecgSignals": ecg_signal_payload(case, case_path),
        "tmpWaveforms": tmp_waveform_payload(case, case_path),
    }


def write_json(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> int:
    normal_bundle = case_bundle(SIGNAL_SOURCE)
    write_json(HEART_TARGET, normal_bundle["heart"])
    write_json(THORAX_TARGET, normal_bundle["thorax"])
    write_json(ECG_SIGNAL_TARGET, normal_bundle["ecgSignals"])
    write_json(TMP_TARGET, normal_bundle["tmpWaveforms"])
    write_json(CASE_METADATA_TARGET, normal_bundle["caseMetadata"])

    manifest = {"cases": []}
    for case_path in SUPPORTED_CASE_SOURCES:
        bundle = case_bundle(case_path)
        metadata = bundle["caseMetadata"]
        bundle_name = f"{metadata['sha256']}.json"
        write_json(CASE_BUNDLE_DIR / bundle_name, bundle)
        manifest["cases"].append(
            {
                "fileName": metadata["fileName"],
                "byteSize": metadata["byteSize"],
                "sha256": metadata["sha256"],
                "bundle": bundle_name,
            }
        )
    write_json(CASE_MANIFEST_TARGET, manifest)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
