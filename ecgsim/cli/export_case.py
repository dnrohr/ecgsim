"""Export supported ECGSIM case data to a legacy-style directory."""

from __future__ import annotations

import argparse
from pathlib import Path

from ecgsim.io import export_case_directory


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_file", type=Path)
    parser.add_argument("output_dir", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    result = export_case_directory(args.case_file, args.output_dir)
    print(f"exported: {result.output_dir}")
    print(f"files: {len(result.written_files)}")
    print(f"metadata: {result.metadata_path}")
    if result.unsupported_members:
        print("unsupported_members:")
        for member in result.unsupported_members:
            print(f"  - {member}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
