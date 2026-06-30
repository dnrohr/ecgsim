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


def _is_worse(candidate: NumericMismatch, current: NumericMismatch) -> bool:
    return (candidate.absolute_error, candidate.relative_error) > (
        current.absolute_error,
        current.relative_error,
    )
