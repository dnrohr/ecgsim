#!/usr/bin/env python3
"""Classify source-square PMatrix payloads that may affect EGM parity."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import (  # noqa: E402
    read_ecgsimcase_matrix,
    read_ecgsimcase_matrix_inventory,
    read_ecgsimcase_sources,
)


def ventricular_source_node_count(path: Path) -> int:
    for source in read_ecgsimcase_sources(path):
        if source.kind != "ventricles":
            continue
        for beat in source.beats:
            for parameter in beat.parameters:
                if parameter.initial is not None and parameter.initial.length > 0:
                    return parameter.initial.length
    return 0


def matrix_stats(matrix) -> dict[str, object]:
    rows = matrix.rows
    columns = matrix.columns
    total = rows * columns
    minimum = float("inf")
    maximum = float("-inf")
    total_value = 0.0
    absolute_total = 0.0
    zero_count = 0
    negative_count = 0
    positive_count = 0
    integer_like_count = 0
    diagonal_zero_count = 0
    max_abs_asymmetry = 0.0

    for row_index, row in enumerate(matrix.values):
        diagonal_value = row[row_index]
        if abs(diagonal_value) <= 1e-9:
            diagonal_zero_count += 1
        for column_index, value in enumerate(row):
            minimum = min(minimum, value)
            maximum = max(maximum, value)
            total_value += value
            absolute_total += abs(value)
            if abs(value) <= 1e-9:
                zero_count += 1
            if value < -1e-9:
                negative_count += 1
            elif value > 1e-9:
                positive_count += 1
            if abs(value - round(value)) <= 1e-6:
                integer_like_count += 1
            if column_index > row_index:
                max_abs_asymmetry = max(max_abs_asymmetry, abs(value - matrix.values[column_index][row_index]))

    return {
        "min": round(minimum, 6),
        "max": round(maximum, 6),
        "mean": round(total_value / total, 6),
        "meanAbs": round(absolute_total / total, 6),
        "zeroFraction": round(zero_count / total, 6),
        "negativeFraction": round(negative_count / total, 6),
        "positiveFraction": round(positive_count / total, 6),
        "integerLikeFraction": round(integer_like_count / total, 6),
        "diagonalZeroFraction": round(diagonal_zero_count / rows, 6),
        "maxAbsAsymmetry": round(max_abs_asymmetry, 6),
        "firstRowPreview": [round(value, 6) for value in matrix.values[0][:8]],
    }


def classify_source_square(stats: dict[str, object]) -> str:
    if stats["negativeFraction"] > 0.01 and stats["zeroFraction"] < 0.05:
        return "dense signed source-to-source transfer candidate"
    if stats["zeroFraction"] > 0.8 and stats["integerLikeFraction"] > 0.8:
        return "sparse graph adjacency/distance candidate"
    if stats["maxAbsAsymmetry"] <= 1e-6 and stats["negativeFraction"] == 0:
        return "dense nonnegative source-distance candidate"
    return "unclassified source-square matrix"


def inspect_case(path: Path) -> dict[str, object]:
    node_count = ventricular_source_node_count(path)
    matrices = []
    for entry in read_ecgsimcase_matrix_inventory(path):
        if entry.status != "parsed" or entry.rows != node_count or entry.columns != node_count:
            continue
        matrix = read_ecgsimcase_matrix(path, entry.offset)
        stats = matrix_stats(matrix)
        matrices.append(
            {
                "index": entry.index,
                "offset": entry.offset,
                "rows": entry.rows,
                "columns": entry.columns,
                "roleHint": entry.role_hint,
                "classification": classify_source_square(stats),
                "stats": stats,
            }
        )
    return {
        "case": path.as_posix(),
        "sourceNodeCount": node_count,
        "sourceSquareMatrixCount": len(matrices),
        "transferCandidateCount": sum(
            1 for matrix in matrices
            if matrix["classification"] == "dense signed source-to-source transfer candidate"
        ),
        "matrices": matrices,
    }


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cases", type=Path, nargs="+")
    parser.add_argument("--output", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    report = {
        "interpretation": (
            "Source-square matrices are classified by numeric shape only. Dense signed candidates may support "
            "computed heart-surface electrogram previews, but EGM parity still requires mapping the matrix role "
            "to legacy VENTR.VENTRICLES semantics and validating the output against ECGSIM."
        ),
        "cases": [inspect_case(path) for path in args.cases],
    }
    text = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
