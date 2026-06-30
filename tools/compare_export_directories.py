#!/usr/bin/env python3
"""Compare a captured legacy export directory with a modern supported export."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import tempfile
from typing import Sequence


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.core import compare_numeric_sequences
from ecgsim.io import export_case_directory, read_geometry, read_matrix, read_vector
from tools.summarize_legacy_export import classify_export_file


DEFAULT_ABS_TOLERANCE = 1e-6
DEFAULT_REL_TOLERANCE = 1e-6


def compare_export_directories(
    legacy_dir: Path,
    modern_dir: Path,
    *,
    abs_tolerance: float = DEFAULT_ABS_TOLERANCE,
    rel_tolerance: float = DEFAULT_REL_TOLERANCE,
) -> dict[str, object]:
    """Compare files that exist in the modern supported export directory."""

    legacy_files = {path.relative_to(legacy_dir).as_posix(): path for path in legacy_dir.rglob("*") if path.is_file()}
    modern_files = {path.relative_to(modern_dir).as_posix(): path for path in modern_dir.rglob("*") if path.is_file()}

    comparisons = []
    for relative_path, modern_path in sorted(modern_files.items()):
        if relative_path == "metadata.json":
            continue
        legacy_path = legacy_files.get(relative_path)
        if legacy_path is None:
            comparisons.append(
                {
                    "path": relative_path,
                    "status": "missing-in-legacy",
                    "message": "Modern supported export file has no matching legacy export path.",
                }
            )
            continue
        comparisons.append(
            compare_export_file(
                legacy_path,
                modern_path,
                relative_path,
                abs_tolerance=abs_tolerance,
                rel_tolerance=rel_tolerance,
            )
        )

    extra_legacy_paths = sorted(path for path in legacy_files if path not in modern_files)
    failed = [item for item in comparisons if item["status"] != "passed"]
    return {
        "schema": "org.ecgsim.export-directory-comparison",
        "version": 1,
        "legacyDir": legacy_dir.as_posix(),
        "modernDir": modern_dir.as_posix(),
        "absTolerance": abs_tolerance,
        "relTolerance": rel_tolerance,
        "status": "passed" if not failed else "failed",
        "comparedCount": sum(1 for item in comparisons if item["status"] == "passed"),
        "failedCount": len(failed),
        "extraLegacyFiles": extra_legacy_paths,
        "comparisons": comparisons,
    }


def compare_export_file(
    legacy_path: Path,
    modern_path: Path,
    relative_path: str,
    *,
    abs_tolerance: float,
    rel_tolerance: float,
) -> dict[str, object]:
    classification = classify_export_file(modern_path)
    try:
        if classification == "geometry-triangulation":
            legacy_geometry = read_geometry(legacy_path)
            modern_geometry = read_geometry(modern_path)
            if legacy_geometry.point_count != modern_geometry.point_count:
                return failed(relative_path, f"point count differs ({legacy_geometry.point_count} != {modern_geometry.point_count})")
            if legacy_geometry.triangle_count != modern_geometry.triangle_count:
                return failed(
                    relative_path,
                    f"triangle count differs ({legacy_geometry.triangle_count} != {modern_geometry.triangle_count})",
                )
            if legacy_geometry.triangles != modern_geometry.triangles:
                return failed(relative_path, "triangle indices differ")
            comparison = compare_numeric_sequences(
                flatten_points(legacy_geometry.points),
                flatten_points(modern_geometry.points),
                abs_tolerance=abs_tolerance,
                rel_tolerance=rel_tolerance,
            )
            return comparison_result(relative_path, classification, comparison)

        if classification == "source-parameter-vector":
            legacy_vector = read_vector(legacy_path)
            modern_vector = read_vector(modern_path)
            comparison = compare_numeric_sequences(
                legacy_vector.values,
                modern_vector.values,
                abs_tolerance=abs_tolerance,
                rel_tolerance=rel_tolerance,
            )
            return comparison_result(relative_path, classification, comparison)

        if classification.endswith("matrix") or classification == "matrix":
            legacy_matrix = read_matrix(legacy_path)
            modern_matrix = read_matrix(modern_path)
            if (legacy_matrix.rows, legacy_matrix.columns) != (modern_matrix.rows, modern_matrix.columns):
                return failed(
                    relative_path,
                    (
                        "matrix shape differs "
                        f"({legacy_matrix.rows}x{legacy_matrix.columns} != "
                        f"{modern_matrix.rows}x{modern_matrix.columns})"
                    ),
                )
            comparison = compare_numeric_sequences(
                flatten_rows(legacy_matrix.values),
                flatten_rows(modern_matrix.values),
                abs_tolerance=abs_tolerance,
                rel_tolerance=rel_tolerance,
            )
            return comparison_result(relative_path, classification, comparison)

        return {
            "path": relative_path,
            "classification": classification,
            "status": "skipped",
            "message": "No numerical comparison is defined for this file type.",
        }
    except Exception as exc:
        return failed(relative_path, str(exc), classification=classification)


def comparison_result(relative_path: str, classification: str, comparison: object) -> dict[str, object]:
    return {
        "path": relative_path,
        "classification": classification,
        "status": "passed" if comparison.passed else "failed",
        "comparedCount": comparison.compared_count,
        "message": comparison.diagnostic(relative_path),
    }


def failed(relative_path: str, message: str, *, classification: str | None = None) -> dict[str, object]:
    result = {
        "path": relative_path,
        "status": "failed",
        "message": message,
    }
    if classification is not None:
        result["classification"] = classification
    return result


def flatten_points(points: Sequence[Sequence[float]]) -> tuple[float, ...]:
    return tuple(coordinate for point in points for coordinate in point)


def flatten_rows(rows: Sequence[Sequence[float]]) -> tuple[float, ...]:
    return tuple(value for row in rows for value in row)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("legacy_export_dir", type=Path)
    parser.add_argument(
        "--modern-export-dir",
        type=Path,
        help="Existing modern export directory to compare against.",
    )
    parser.add_argument(
        "--case",
        type=Path,
        help="Case file used to generate a temporary modern supported export when --modern-export-dir is omitted.",
    )
    parser.add_argument("--abs-tolerance", type=float, default=DEFAULT_ABS_TOLERANCE)
    parser.add_argument("--rel-tolerance", type=float, default=DEFAULT_REL_TOLERANCE)
    parser.add_argument("--output", type=Path, help="Optional JSON output path.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not args.legacy_export_dir.is_dir():
        raise SystemExit(f"{args.legacy_export_dir} is not a directory")
    if args.modern_export_dir is None and args.case is None:
        raise SystemExit("pass --modern-export-dir or --case")

    if args.modern_export_dir is not None:
        report = compare_export_directories(
            args.legacy_export_dir,
            args.modern_export_dir,
            abs_tolerance=args.abs_tolerance,
            rel_tolerance=args.rel_tolerance,
        )
    else:
        with tempfile.TemporaryDirectory() as tmp:
            modern_dir = Path(tmp) / "modern-export"
            export_case_directory(args.case, modern_dir)
            report = compare_export_directories(
                args.legacy_export_dir,
                modern_dir,
                abs_tolerance=args.abs_tolerance,
                rel_tolerance=args.rel_tolerance,
            )

    text = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
