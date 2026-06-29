#!/usr/bin/env python3
"""Export small viewer fixtures from archived ECGSIM source data."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import (
    read_ecgsimcase_matrix,
    read_ecgsimcase_metadata,
    read_ecgsimcase_vector,
    read_geometry,
)


GEOMETRY_SOURCE_DIR = ROOT / "research/source/www.ecgsim.org/downloads/other13/geometry"
HEART_SOURCE = GEOMETRY_SOURCE_DIR / "heart.tri"
SIGNAL_SOURCE = ROOT / "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"
SIGNAL_MATRIX_OFFSET = 54
HEART_TARGET = ROOT / "app/viewer/public/fixtures/heart.json"
THORAX_TARGET = ROOT / "app/viewer/public/fixtures/thorax.json"
ECG_SIGNAL_TARGET = ROOT / "app/viewer/public/fixtures/ecg-signals.json"
TMP_TARGET = ROOT / "app/viewer/public/fixtures/tmp-waveforms.json"
CASE_METADATA_TARGET = ROOT / "app/viewer/public/fixtures/case-metadata.json"
TMP_PARAMETER_OFFSETS = {
    "depolarizationMs": (11272300, 11274630),
    "repolarizationMs": (11277000, 11279330),
    "plateauSlope": (11281700, 11284030),
    "restingPotential": (11286400, 11288730),
    "amplitude": (11291100, 11293430),
    "depolarizationSlope": (11295800, 11298130),
    "repolarizationSlope": (11300500, 11302830),
}


def geometry_payload(source: Path) -> dict[str, object]:
    geometry = read_geometry(source)
    return {
        "source": str(source.relative_to(ROOT)).replace("\\", "/"),
        "units": geometry.units,
        "pointCount": geometry.point_count,
        "triangleCount": geometry.triangle_count,
        "points": geometry.points,
        "triangles": geometry.triangles,
    }


def ecg_signal_payload() -> dict[str, object]:
    matrix = read_ecgsimcase_matrix(SIGNAL_SOURCE, SIGNAL_MATRIX_OFFSET)
    selected_rows = (0, 50, 100, 150, 200, 250)
    return {
        "source": str(SIGNAL_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "sourceMatrixOffset": SIGNAL_MATRIX_OFFSET,
        "signalKind": "thorax-node surface potentials",
        "sampleRateHz": 1000,
        "sampleRateSource": "ECGSIM manual 12-lead ECG and surface-potential export formats",
        "rows": matrix.rows,
        "columns": matrix.columns,
        "units": "mV",
        "traces": [
            {
                "name": f"Node {row + 1}",
                "sourceRow": row,
                "values": matrix.values[row],
            }
            for row in selected_rows
        ],
    }


def tmp_waveform_payload() -> dict[str, object]:
    parameter_vectors = {
        name: {
            "initial": read_ecgsimcase_vector(SIGNAL_SOURCE, offsets[0]),
            "adapted": read_ecgsimcase_vector(SIGNAL_SOURCE, offsets[1]),
        }
        for name, offsets in TMP_PARAMETER_OFFSETS.items()
    }
    selected_nodes = (0, 143, 287, 431, 575)
    sample_count = 576

    return {
        "source": str(SIGNAL_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "signalKind": "parameter-derived TMP preview",
        "sampleRateHz": 1000,
        "sampleCount": sample_count,
        "nodeCount": parameter_vectors["depolarizationMs"]["initial"].length,
        "units": "legacy TMP parameter units",
        "generationNote": (
            "Preview waveform generated from stored source parameter vectors; "
            "exact legacy TMP generation remains a later parity task."
        ),
        "parameterVectors": {
            name: {
                "initial": vectors["initial"].values,
                "adapted": vectors["adapted"].values,
            }
            for name, vectors in parameter_vectors.items()
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
                "initial": generate_tmp_preview(parameter_vectors, node, "initial", sample_count),
                "adapted": generate_tmp_preview(parameter_vectors, node, "adapted", sample_count),
            }
            for node in selected_nodes
        ],
    }


def generate_tmp_preview(
    parameter_vectors: dict[str, dict[str, object]], node: int, state: str, sample_count: int
) -> list[float]:
    dep = parameter_vectors["depolarizationMs"][state].values[node]
    rep = parameter_vectors["repolarizationMs"][state].values[node]
    rest = parameter_vectors["restingPotential"][state].values[node]
    amplitude = parameter_vectors["amplitude"][state].values[node]
    dep_slope = parameter_vectors["depolarizationSlope"][state].values[node]
    rep_slope = parameter_vectors["repolarizationSlope"][state].values[node]
    plateau_slope = parameter_vectors["plateauSlope"][state].values[node]
    dep_width = max(dep_slope * 1000.0, 1.0)
    rep_width = max(rep_slope * 1000.0, 1.0)

    values: list[float] = []
    for sample in range(sample_count):
        upstroke = sigmoid((sample - dep) / dep_width)
        recovery = sigmoid((sample - rep) / rep_width)
        plateau_decay = max(0.0, sample - dep) * plateau_slope / 1000.0
        value = rest + max(0.0, amplitude - plateau_decay) * upstroke * (1.0 - recovery)
        values.append(round(value, 6))
    return values


def sigmoid(value: float) -> float:
    if value < -60.0:
        return 0.0
    if value > 60.0:
        return 1.0
    return 1.0 / (1.0 + pow(2.718281828459045, -value))


def case_metadata_payload() -> dict[str, object]:
    metadata = read_ecgsimcase_metadata(SIGNAL_SOURCE)
    return {
        "source": str(SIGNAL_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "fileName": SIGNAL_SOURCE.name,
        "byteSize": metadata.byte_size,
        "sha256": metadata.sha256,
        "rootSignature": metadata.root_signature,
        "leadSystems": metadata.lead_systems,
        "markerCounts": metadata.marker_counts,
        "unsupportedPayloads": metadata.unsupported_payloads,
        "loadedFixtures": {
            "heart": "heart.json",
            "thorax": "thorax.json",
            "ecgSignals": "ecg-signals.json",
            "tmpWaveforms": "tmp-waveforms.json",
        },
    }


def main() -> int:
    HEART_TARGET.parent.mkdir(parents=True, exist_ok=True)
    HEART_TARGET.write_text(
        json.dumps(geometry_payload(HEART_SOURCE), separators=(",", ":"))
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {HEART_TARGET.relative_to(ROOT)}")
    THORAX_TARGET.write_text(
        json.dumps(
            {
                "meshes": {
                    "thorax": geometry_payload(GEOMETRY_SOURCE_DIR / "thorax.tri"),
                    "leftLung": geometry_payload(GEOMETRY_SOURCE_DIR / "llung.tri"),
                    "rightLung": geometry_payload(GEOMETRY_SOURCE_DIR / "rlung.tri"),
                }
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {THORAX_TARGET.relative_to(ROOT)}")
    ECG_SIGNAL_TARGET.write_text(
        json.dumps(ecg_signal_payload(), separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {ECG_SIGNAL_TARGET.relative_to(ROOT)}")
    TMP_TARGET.write_text(
        json.dumps(tmp_waveform_payload(), separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {TMP_TARGET.relative_to(ROOT)}")
    CASE_METADATA_TARGET.write_text(
        json.dumps(case_metadata_payload(), separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {CASE_METADATA_TARGET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
