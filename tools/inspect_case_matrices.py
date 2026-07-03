#!/usr/bin/env python3
"""Inspect PMatrix inventories in ECGSIM case files."""

from __future__ import annotations

import argparse
from dataclasses import asdict
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import read_ecgsimcase_matrix_inventory, read_ecgsimcase_metadata


def inspect_case(path: Path) -> dict[str, object]:
    metadata = read_ecgsimcase_metadata(path)
    return {
        "case": path.as_posix(),
        "sha256": metadata.sha256,
        "matrixCount": metadata.marker_counts.get("PMatrix", 0),
        "matrices": [asdict(entry) for entry in read_ecgsimcase_matrix_inventory(path)],
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
