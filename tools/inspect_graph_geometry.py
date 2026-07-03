#!/usr/bin/env python3
"""Inspect PGraphGeometry payload inventories in ECGSIM case files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import read_ecgsimcase_graph_geometries, read_ecgsimcase_metadata


def inspect_case(path: Path) -> dict[str, object]:
    metadata = read_ecgsimcase_metadata(path)
    return {
        "case": path.as_posix(),
        "sha256": metadata.sha256,
        "graphGeometryCount": metadata.marker_counts.get("PGraphGeometry", 0),
        "graphGeometries": [
            {
                "id": graph.id,
                "markerOffset": graph.marker_offset,
                "valuesOffset": graph.values_offset,
                "endOffset": graph.end_offset,
                "storageFormat": graph.storage_format,
                "version": graph.version,
                "headerInts": list(graph.header_ints),
                "headerFloats": [round(value, 6) for value in graph.header_floats],
                "candidateNodeCount": graph.candidate_node_count,
                "payloadBytes": graph.payload_bytes,
                "nestedMatrixOffsets": list(graph.nested_matrix_offsets),
                "interpretation": graph.interpretation,
            }
            for graph in read_ecgsimcase_graph_geometries(path)
        ],
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cases", type=Path, nargs="+")
    parser.add_argument("--output", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = {"cases": [inspect_case(path) for path in args.cases]}
    text = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
