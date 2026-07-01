"""ECG and body-surface signal coupling/filtering helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Literal, Sequence

from ecgsim.io import MatrixData


FilteringMode = Literal["baseline", "ac", "dc"]
BaselineWindowSource = Literal["fiducials", "signal-ends", "inferred-legacy-zeros"]


@dataclass(frozen=True)
class BaselineWindow:
    """Sample window used for baseline coupling."""

    start_index: int
    end_index: int
    source: BaselineWindowSource


def baseline_window_for_signal(
    sample_count: int,
    *,
    baseline_start_index: int | None = None,
    baseline_end_index: int | None = None,
) -> BaselineWindow:
    """Resolve baseline fiducials or the documented fallback window."""

    if sample_count <= 0:
        raise ValueError("signal must contain at least one sample")
    source: BaselineWindowSource = (
        "fiducials" if baseline_start_index is not None and baseline_end_index is not None else "signal-ends"
    )
    start = 0 if baseline_start_index is None else baseline_start_index
    end = sample_count - 1 if baseline_end_index is None else baseline_end_index
    if start < 0 or start >= sample_count:
        raise ValueError("baseline_start_index is outside the signal")
    if end < 0 or end >= sample_count:
        raise ValueError("baseline_end_index is outside the signal")
    return BaselineWindow(start_index=start, end_index=end, source=source)


def infer_baseline_window_from_zero_runs(
    matrix: MatrixData,
    *,
    tolerance: float = 1e-5,
    min_run: int = 3,
) -> BaselineWindow:
    """Infer legacy baseline samples from shared near-zero runs in all rows.

    ECGSIM's manual defines baseline correction by the P-wave start and T-wave
    termination samples. Those fields are still not located in `.ECGsimcase`,
    but captured `.adaptECG` exports expose the post-correction samples as
    shared near-zero runs at the start and end of each lead trace.
    """

    if matrix.rows <= 0 or matrix.columns <= 0:
        raise ValueError("matrix must contain at least one row and column")
    if tolerance < 0.0:
        raise ValueError("tolerance must be non-negative")
    if min_run <= 0:
        raise ValueError("min_run must be positive")

    zero_columns = [
        all(abs(float(row[column])) <= tolerance for row in matrix.values)
        for column in range(matrix.columns)
    ]
    leading = _count_leading_true(zero_columns)
    trailing = _count_leading_true(reversed(zero_columns))
    if leading < min_run or trailing < min_run:
        raise ValueError(
            "matrix does not contain shared leading and trailing near-zero runs"
        )

    start = leading - 1
    end = matrix.columns - trailing
    if start >= end:
        raise ValueError("inferred baseline window is empty or reversed")
    return BaselineWindow(
        start_index=start,
        end_index=end,
        source="inferred-legacy-zeros",
    )


def filter_signal(
    values: Sequence[float],
    mode: FilteringMode,
    *,
    baseline_start_index: int | None = None,
    baseline_end_index: int | None = None,
) -> tuple[float, ...]:
    """Filter one ECG/body-surface trace using an ECGSIM coupling mode."""

    if mode == "dc":
        return tuple(float(value) for value in values)
    if mode == "ac":
        return _ac_coupled(values)
    if mode == "baseline":
        return _baseline_corrected(values, baseline_start_index, baseline_end_index)
    raise ValueError(f"unsupported filtering mode {mode!r}")


def filter_matrix(
    matrix: MatrixData,
    mode: FilteringMode,
    *,
    baseline_start_index: int | None = None,
    baseline_end_index: int | None = None,
) -> MatrixData:
    """Apply a coupling/filtering mode independently to each matrix row."""

    filtered = tuple(
        filter_signal(
            row,
            mode,
            baseline_start_index=baseline_start_index,
            baseline_end_index=baseline_end_index,
        )
        for row in matrix.values
    )
    return MatrixData(
        rows=matrix.rows,
        columns=matrix.columns,
        values=filtered,
        source_path=matrix.source_path,
        storage_format=f"{matrix.storage_format}+{mode}-coupled",
    )


def _ac_coupled(values: Sequence[float]) -> tuple[float, ...]:
    if not values:
        raise ValueError("signal must contain at least one sample")
    mean = sum(float(value) for value in values) / len(values)
    return tuple(float(value) - mean for value in values)


def _count_leading_true(values: Iterable[bool]) -> int:
    count = 0
    for value in values:
        if not value:
            break
        count += 1
    return count


def _baseline_corrected(
    values: Sequence[float],
    baseline_start_index: int | None,
    baseline_end_index: int | None,
) -> tuple[float, ...]:
    window = baseline_window_for_signal(
        len(values),
        baseline_start_index=baseline_start_index,
        baseline_end_index=baseline_end_index,
    )
    start = window.start_index
    end = window.end_index
    if start == end:
        offset = float(values[start])
        return tuple(float(value) - offset for value in values)

    start_value = float(values[start])
    end_value = float(values[end])
    slope = (end_value - start_value) / (end - start)
    return tuple(
        float(value) - (start_value + slope * (index - start))
        for index, value in enumerate(values)
    )
