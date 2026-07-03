#!/usr/bin/env python3
"""Inspect PLead, PLeadReference, and PShowLead inventories in ECGSIM cases."""

from __future__ import annotations

import argparse
from dataclasses import asdict
import json
from math import isfinite
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import read_ecgsimcase_lead_object_inventory, read_ecgsimcase_metadata


def inspect_case(path: Path) -> dict[str, object]:
    metadata = read_ecgsimcase_metadata(path)
    return {
        "case": path.as_posix(),
        "sha256": metadata.sha256,
        "objectCounts": {
            "PLead": metadata.marker_counts.get("PLead", 0),
            "PLeadReference": metadata.marker_counts.get("PLeadReference", 0),
            "PShowLead": metadata.marker_counts.get("PShowLead", 0),
        },
        "objects": [_json_entry(entry) for entry in read_ecgsimcase_lead_object_inventory(path)],
    }


def _json_entry(entry) -> dict[str, object]:
    payload = asdict(entry)
    payload["trailing_float32"] = [
        round(value, 6) if isfinite(value) else str(value)
        for value in entry.trailing_float32
    ]
    return payload


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
