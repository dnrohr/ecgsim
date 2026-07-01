"""Numerical parity comparison helpers with diagnostic failures."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Sequence


@dataclass(frozen=True)
class NumericMismatch:
    """Largest observed mismatch between two numeric sequences."""

    index: int
    actual: float
    expected: float
    absolute_error: float
    relative_error: float


@dataclass(frozen=True)
class NumericComparison:
    """Result of a tolerance-based numeric comparison."""

    passed: bool
    compared_count: int
    abs_tolerance: float
    rel_tolerance: float
    worst_mismatch: NumericMismatch | None

    def diagnostic(self, label: str = "numeric sequence") -> str:
        if self.passed:
            return f"{label}: {self.compared_count} values within tolerance"
        mismatch = self.worst_mismatch
        if mismatch is None:
            return f"{label}: comparison failed before value comparison"
        return (
            f"{label}: mismatch at index {mismatch.index}; "
            f"actual={mismatch.actual!r}, expected={mismatch.expected!r}, "
            f"abs_error={mismatch.absolute_error:.6g} > {self.abs_tolerance:.6g} or "
            f"rel_error={mismatch.relative_error:.6g} > {self.rel_tolerance:.6g}"
        )


@dataclass(frozen=True)
class NumericMatrixComparison:
    """Result of a tolerance-based matrix comparison."""

    passed: bool
    rows: int
    columns: int
    compared_count: int
    max_abs_tolerance: float
    rms_tolerance: float
    max_abs_error: float
    rms_error: float
    worst_mismatch: NumericMismatch | None
    shape_message: str | None = None

    def diagnostic(self, label: str = "numeric matrix") -> str:
        if self.shape_message is not None:
            return f"{label}: {self.shape_message}"
        if self.passed:
            return (
                f"{label}: {self.rows}x{self.columns} matrix within tolerance; "
                f"max_abs_error={self.max_abs_error:.6g}, rms_error={self.rms_error:.6g}"
            )
        mismatch = self.worst_mismatch
        if mismatch is None:
            return f"{label}: comparison failed before value comparison"
        row = mismatch.index // self.columns if self.columns else 0
        column = mismatch.index % self.columns if self.columns else mismatch.index
        return (
            f"{label}: mismatch at row {row}, column {column}, index {mismatch.index}; "
            f"actual={mismatch.actual!r}, expected={mismatch.expected!r}, "
            f"abs_error={mismatch.absolute_error:.6g}; "
            f"max_abs_error={self.max_abs_error:.6g} > {self.max_abs_tolerance:.6g} or "
            f"rms_error={self.rms_error:.6g} > {self.rms_tolerance:.6g}"
        )


def compare_numeric_sequences(
    actual: Sequence[float],
    expected: Sequence[float],
    *,
    abs_tolerance: float,
    rel_tolerance: float,
) -> NumericComparison:
    """Compare equal-length numeric sequences using absolute or relative tolerance."""

    if len(actual) != len(expected):
        raise ValueError(f"sequence lengths differ ({len(actual)} != {len(expected)})")
    if abs_tolerance < 0 or rel_tolerance < 0:
        raise ValueError("tolerances must be non-negative")

    worst: NumericMismatch | None = None
    passed = True
    for index, (actual_value, expected_value) in enumerate(zip(actual, expected)):
        actual_float = float(actual_value)
        expected_float = float(expected_value)
        absolute_error = abs(actual_float - expected_float)
        denominator = max(abs(expected_float), 1.0)
        relative_error = absolute_error / denominator
        mismatch = NumericMismatch(
            index=index,
            actual=actual_float,
            expected=expected_float,
            absolute_error=absolute_error,
            relative_error=relative_error,
        )
        if worst is None or _is_worse(mismatch, worst):
            worst = mismatch
        if not math.isfinite(actual_float) or not math.isfinite(expected_float):
            passed = False
        elif absolute_error > abs_tolerance and relative_error > rel_tolerance:
            passed = False

    return NumericComparison(
        passed=passed,
        compared_count=len(actual),
        abs_tolerance=abs_tolerance,
        rel_tolerance=rel_tolerance,
        worst_mismatch=worst,
    )


def compare_numeric_matrices(
    actual: Sequence[Sequence[float]],
    expected: Sequence[Sequence[float]],
    *,
    max_abs_tolerance: float,
    rms_tolerance: float,
) -> NumericMatrixComparison:
    """Compare same-shaped numeric matrices using max absolute and RMS errors."""

    if max_abs_tolerance < 0 or rms_tolerance < 0:
        raise ValueError("tolerances must be non-negative")
    actual_shape = _matrix_shape(actual)
    expected_shape = _matrix_shape(expected)
    rows, columns = actual_shape
    if actual_shape != expected_shape:
        return NumericMatrixComparison(
            passed=False,
            rows=rows,
            columns=columns,
            compared_count=0,
            max_abs_tolerance=max_abs_tolerance,
            rms_tolerance=rms_tolerance,
            max_abs_error=math.inf,
            rms_error=math.inf,
            worst_mismatch=None,
            shape_message=(
                f"matrix shape differs ({actual_shape[0]}x{actual_shape[1]} != "
                f"{expected_shape[0]}x{expected_shape[1]})"
            ),
        )

    worst: NumericMismatch | None = None
    max_abs_error = 0.0
    squared_error = 0.0
    compared_count = 0
    passed = True
    for row_index, (actual_row, expected_row) in enumerate(zip(actual, expected)):
        for column_index, (actual_value, expected_value) in enumerate(zip(actual_row, expected_row)):
            actual_float = float(actual_value)
            expected_float = float(expected_value)
            absolute_error = abs(actual_float - expected_float)
            denominator = max(abs(expected_float), 1.0)
            relative_error = absolute_error / denominator
            mismatch = NumericMismatch(
                index=row_index * columns + column_index,
                actual=actual_float,
                expected=expected_float,
                absolute_error=absolute_error,
                relative_error=relative_error,
            )
            if worst is None or _is_worse(mismatch, worst):
                worst = mismatch
            if not math.isfinite(actual_float) or not math.isfinite(expected_float):
                passed = False
            max_abs_error = max(max_abs_error, absolute_error)
            squared_error += absolute_error * absolute_error
            compared_count += 1

    rms_error = math.sqrt(squared_error / compared_count) if compared_count else 0.0
    if max_abs_error > max_abs_tolerance or rms_error > rms_tolerance:
        passed = False
    return NumericMatrixComparison(
        passed=passed,
        rows=rows,
        columns=columns,
        compared_count=compared_count,
        max_abs_tolerance=max_abs_tolerance,
        rms_tolerance=rms_tolerance,
        max_abs_error=max_abs_error,
        rms_error=rms_error,
        worst_mismatch=worst,
    )


def assert_numeric_sequences_close(
    actual: Sequence[float],
    expected: Sequence[float],
    *,
    abs_tolerance: float,
    rel_tolerance: float,
    label: str,
) -> None:
    """Raise ``AssertionError`` with a parity diagnostic when values differ."""

    comparison = compare_numeric_sequences(
        actual,
        expected,
        abs_tolerance=abs_tolerance,
        rel_tolerance=rel_tolerance,
    )
    if not comparison.passed:
        raise AssertionError(comparison.diagnostic(label))


def assert_numeric_matrices_close(
    actual: Sequence[Sequence[float]],
    expected: Sequence[Sequence[float]],
    *,
    max_abs_tolerance: float,
    rms_tolerance: float,
    label: str,
) -> None:
    """Raise ``AssertionError`` with matrix-level parity diagnostics."""

    comparison = compare_numeric_matrices(
        actual,
        expected,
        max_abs_tolerance=max_abs_tolerance,
        rms_tolerance=rms_tolerance,
    )
    if not comparison.passed:
        raise AssertionError(comparison.diagnostic(label))


def _matrix_shape(matrix: Sequence[Sequence[float]]) -> tuple[int, int]:
    rows = len(matrix)
    columns = len(matrix[0]) if rows else 0
    for row_index, row in enumerate(matrix):
        if len(row) != columns:
            raise ValueError(f"matrix row {row_index} has length {len(row)}; expected {columns}")
    return rows, columns


def _is_worse(candidate: NumericMismatch, current: NumericMismatch) -> bool:
    return (candidate.absolute_error, candidate.relative_error) > (
        current.absolute_error,
        current.relative_error,
    )
