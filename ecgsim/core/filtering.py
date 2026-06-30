"""ECG and body-surface signal coupling/filtering helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

from ecgsim.io import MatrixData


FilteringMode = Literal["baseline", "ac", "dc"]


@dataclass(frozen=True)
class BaselineWindow:
    """Sample window used for baseline coupling."""

    start_index: int
    end_index: int
    source: Literal["fiducials", "signal-ends"]


def baseline_window_for_signal(
    sample_count: int,
    *,
    baseline_start_index: int | None = None,
    baseline_end_index: int | None = None,
) -> BaselineWindow:
    """Resolve baseline fiducials or the documented fallback window."""

    if sample_count <= 0:
        raise ValueError("signal must contain at least one sample")
    source: Literal["fiducials", "signal-ends"] = (
        "fiducials" if baseline_start_index is not None and baseline_end_index is not None else "signal-ends"
    )
    start = 0 if baseline_start_index is None else baseline_start_index
    end = sample_count - 1 if baseline_end_index is None else baseline_end_index
    if start < 0 or start >= sample_count:
        raise ValueError("baseline_start_index is outside the signal")
    if end < 0 or end >= sample_count:
        raise ValueError("baseline_end_index is outside the signal")
    return BaselineWindow(start_index=start, end_index=end, source=source)


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
