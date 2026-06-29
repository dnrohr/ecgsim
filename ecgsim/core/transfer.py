"""Transfer-function application for ECGSIM source matrices."""

from __future__ import annotations

from collections.abc import Sequence

from ecgsim.io import MatrixData


NumberMatrix = Sequence[Sequence[float]]


def apply_transfer_function(
    transfer: MatrixData | NumberMatrix,
    source: MatrixData | NumberMatrix,
) -> MatrixData:
    """Apply an observation-by-source transfer matrix to source-by-time data."""

    transfer_values = _matrix_values(transfer)
    source_values = _matrix_values(source)
    transfer_rows, transfer_columns = _shape(transfer_values, "transfer")
    source_rows, source_columns = _shape(source_values, "source")
    if transfer_columns != source_rows:
        raise ValueError(
            "transfer columns must match source rows "
            f"({transfer_columns} != {source_rows})"
        )

    output_values: list[tuple[float, ...]] = []
    for transfer_row in transfer_values:
        output_row: list[float] = []
        for source_column in range(source_columns):
            value = 0.0
            for source_row, coefficient in enumerate(transfer_row):
                value += float(coefficient) * float(
                    source_values[source_row][source_column]
                )
            output_row.append(value)
        output_values.append(tuple(output_row))

    return MatrixData(
        rows=transfer_rows,
        columns=source_columns,
        values=tuple(output_values),
        storage_format="computed-transfer",
    )


def apply_wct_reference(
    transfer: MatrixData | NumberMatrix,
    wct_rows: Sequence[int],
) -> MatrixData:
    """Subtract the Wilson central terminal average row from a transfer matrix."""

    transfer_values = _matrix_values(transfer)
    rows, columns = _shape(transfer_values, "transfer")
    if not wct_rows:
        raise ValueError("wct_rows must not be empty")
    for row in wct_rows:
        if row < 0 or row >= rows:
            raise ValueError(f"WCT row {row} is outside transfer matrix")

    average = tuple(
        sum(float(transfer_values[row][column]) for row in wct_rows) / len(wct_rows)
        for column in range(columns)
    )
    referenced = tuple(
        tuple(float(value) - average[column] for column, value in enumerate(row_values))
        for row_values in transfer_values
    )
    return MatrixData(
        rows=rows,
        columns=columns,
        values=referenced,
        storage_format="computed-wct-reference",
    )


def _matrix_values(matrix: MatrixData | NumberMatrix) -> NumberMatrix:
    return matrix.values if isinstance(matrix, MatrixData) else matrix


def _shape(values: NumberMatrix, name: str) -> tuple[int, int]:
    rows = len(values)
    if rows == 0:
        raise ValueError(f"{name} matrix must have at least one row")
    columns = len(values[0])
    if columns == 0:
        raise ValueError(f"{name} matrix must have at least one column")
    for row in values:
        if len(row) != columns:
            raise ValueError(f"{name} matrix rows must all have the same length")
    return rows, columns
