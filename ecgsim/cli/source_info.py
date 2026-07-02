"""CLI for exporting modern ECGSIM source-info interchange files."""

from __future__ import annotations

import argparse
from pathlib import Path

from ecgsim.io import SourceInfoError, export_case_source_info


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Export modern ECGSIM source-info JSON.")
    parser.add_argument("case_file", type=Path, help="Input .ECGsimcase file")
    parser.add_argument("output_file", type=Path, help="Output .ECGsimsource.json file")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        payload = export_case_source_info(args.case_file, args.output_file)
    except SourceInfoError as error:
        parser.error(str(error))
    print(
        f"wrote {args.output_file} with {len(payload['sources'])} sources "
        f"for {payload['case']['fileName']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
