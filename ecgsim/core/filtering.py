"""ECG and body-surface signal coupling/filtering helpers."""

from __future__ import annotations

from typing import Literal, Sequence

from ecgsim.io import MatrixData


FilteringMode = Literal["baseline", "ac", "dc"]


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
    if not values:
        raise ValueError("signal must contain at least one sample")
    start = 0 if baseline_start_index is None else baseline_start_index
    end = len(values) - 1 if baseline_end_index is None else baseline_end_index
    if start < 0 or start >= len(values):
        raise ValueError("baseline_start_index is outside the signal")
    if end < 0 or end >= len(values):
        raise ValueError("baseline_end_index is outside the signal")
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
