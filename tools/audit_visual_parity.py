#!/usr/bin/env python3
"""Audit the visualization feature-parity matrix."""

from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
from typing import Any


ACCEPTED_STATUSES = {
    "supported",
    "parity-tested",
    "modern-equivalent",
    "deferred-with-reason",
    "blocked-on-evidence",
}


def audit_matrix(path: Path) -> dict[str, Any]:
    rows = parse_matrix_rows(path)
    status_counts = Counter(row["status"] for row in rows)
    invalid = [row for row in rows if row["status"] not in ACCEPTED_STATUSES]
    blockers = [row for row in rows if row["status"] == "blocked-on-evidence"]
    incomplete_evidence = [
        row
        for row in rows
        if row["status"] in {"supported", "modern-equivalent", "parity-tested"} and row["nextTask"] not in {"complete", "`0101`", "`0102`"}
    ]
    return {
        "status": "passed" if not invalid else "failed",
        "matrix": path.as_posix(),
        "rowCount": len(rows),
        "statusCounts": dict(sorted(status_counts.items())),
        "invalidRows": invalid,
        "blockedOnEvidence": blockers,
        "supportedRowsNeedingEvidenceUpdate": incomplete_evidence,
        "completionSummary": (
            "matrix has accepted statuses; full visualization goal still has evidence blockers"
            if blockers and not invalid
            else "matrix has accepted statuses and no evidence blockers"
            if not invalid
            else "matrix contains unsupported statuses"
        ),
    }


def parse_matrix_rows(path: Path) -> list[dict[str, str]]:
    rows = []
    in_table = False
    for line in path.read_text(encoding="utf-8").splitlines():
      if line.startswith("| Area | Legacy visual mode or interaction |"):
          in_table = True
          continue
      if not in_table:
          continue
      if not line.startswith("|"):
          if rows:
              break
          continue
      cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
      if len(cells) != 6 or cells[0] == "---":
          continue
      rows.append(
          {
              "area": cells[0],
              "mode": cells[1],
              "target": cells[2],
              "status": cells[3],
              "evidence": cells[4],
              "nextTask": cells[5],
          }
      )
    return rows


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("matrix", type=Path, nargs="?", default=Path("docs/feature-parity/visualization-matrix.md"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--require-complete", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = audit_matrix(args.matrix)
    if args.require_complete and report["blockedOnEvidence"]:
        report["status"] = "failed"
        report["message"] = "visualization parity still has evidence blockers"
    text = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
