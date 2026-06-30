"""Profile supported ECGSIM modern workflows.

This script is intentionally lightweight and writes no repo artifacts unless
`--json-output` is supplied. It gives agents a repeatable way to compare parser
and export changes against the current supported cases.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import tempfile
import time
from typing import Callable, Any


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import export_case_directory, load_case, read_ecgsimcase_matrix

CASE_ROOT = ROOT / "research/source/www.ecgsim.org/downloads/cases"
DEFAULT_CASES = (
    CASE_ROOT / "normal_male2.ECGsimcase",
    CASE_ROOT / "WPW_Bundleonly.ECGsimcase",
    CASE_ROOT / "WPW_ectopicbeat.ECGsimcase",
    CASE_ROOT / "WPW_fusionbeat.ECGsimcase",
)


def timed(label: str, fn: Callable[[], Any]) -> dict[str, Any]:
    start = time.perf_counter()
    result = fn()
    elapsed_ms = (time.perf_counter() - start) * 1000
    return {"label": label, "elapsedMs": round(elapsed_ms, 1), "result": result}


def profile_case(case_path: Path, *, include_export: bool) -> dict[str, Any]:
    case_record: dict[str, Any] = {"case": case_path.name, "workflows": []}

    loaded_case = None

    def load() -> dict[str, Any]:
        nonlocal loaded_case
        loaded_case = load_case(case_path)
        return {
            "geometries": len(loaded_case.geometries),
            "sources": len(loaded_case.sources),
            "leadSystems": len(loaded_case.lead_systems),
            "signalShape": [loaded_case.signal_metadata.rows, loaded_case.signal_metadata.columns],
        }

    case_record["workflows"].append(timed("load_case", load))

    def read_signal() -> dict[str, Any]:
        assert loaded_case is not None
        matrix = read_ecgsimcase_matrix(case_path, loaded_case.signal_metadata.matrix_offset)
        return {"rows": matrix.rows, "columns": matrix.columns}

    case_record["workflows"].append(timed("read_signal_matrix", read_signal))

    if include_export:
        with tempfile.TemporaryDirectory() as tmp:
            output_dir = Path(tmp) / case_path.stem

            def export() -> dict[str, Any]:
                assert loaded_case is not None
                result = export_case_directory(loaded_case, output_dir)
                return {
                    "files": len(result.written_files),
                    "unsupportedMembers": len(result.unsupported_members),
                }

            case_record["workflows"].append(timed("export_directory", export))

    return case_record


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--case",
        dest="cases",
        type=Path,
        action="append",
        help="Case file to profile. May be passed more than once. Defaults to supported archived cases.",
    )
    parser.add_argument("--skip-export", action="store_true", help="Skip export-directory profiling.")
    parser.add_argument("--json-output", type=Path, help="Optional path for machine-readable JSON results.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    cases = tuple(args.cases) if args.cases else DEFAULT_CASES
    report = {
        "schema": "org.ecgsim.performance-profile",
        "version": 1,
        "cases": [profile_case(case_path, include_export=not args.skip_export) for case_path in cases],
    }
    text = json.dumps(report, indent=2) + "\n"
    if args.json_output:
        args.json_output.parent.mkdir(parents=True, exist_ok=True)
        args.json_output.write_text(text, encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
