"""Readers for legacy ECGSIM matrix and vector files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import struct
from typing import Sequence


class MatrixFormatError(ValueError):
    """Raised when a matrix/vector file cannot be parsed."""


@dataclass(frozen=True)
class MatrixData:
    """A parsed matrix in row-major order."""

    rows: int
    columns: int
    values: tuple[tuple[float, ...], ...]
    source_path: Path | None = None
    storage_format: str = "unknown"


@dataclass(frozen=True)
class VectorData:
    """A parsed one-column vector."""

    length: int
    values: tuple[float, ...]
    source_path: Path | None = None
    storage_format: str = "unknown"


def read_matrix(path: str | Path) -> MatrixData:
    """Read an ECGSIM matrix file.

    Supports the ASCII matrix format used by archived examples, plus the raw
    float32 and ``;;mbfmat`` float64 binary variants described by `loadmat.m`.
    Binary files are interpreted as little-endian, matching the Windows legacy
    environment. Keep this assumption visible until binary fixtures prove more.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    if not data:
        raise MatrixFormatError(f"{source_path} is empty")

    if data.startswith(b";;mbfmat"):
        return _read_mbfmat(data, source_path)

    try:
        return _read_ascii_matrix(data, source_path)
    except MatrixFormatError as ascii_error:
        try:
            return _read_raw_binary_matrix(data, source_path)
        except MatrixFormatError as binary_error:
            raise MatrixFormatError(
                f"{source_path} is not a supported ECGSIM matrix: "
                f"ascii=({ascii_error}); binary=({binary_error})"
            ) from binary_error


def read_vector(path: str | Path) -> VectorData:
    """Read an ECGSIM one-column vector file."""

    matrix = read_matrix(path)
    if matrix.columns != 1:
        raise MatrixFormatError(
            f"{matrix.source_path} has {matrix.columns} columns; expected one-column vector"
        )
    return VectorData(
        length=matrix.rows,
        values=tuple(row[0] for row in matrix.values),
        source_path=matrix.source_path,
        storage_format=matrix.storage_format,
    )


def read_legacy_row_major_matrix(path: str | Path) -> MatrixData:
    """Read a raw float32 ECGSIM export whose payload is stored by rows.

    Most raw matrix payloads handled by `read_matrix()` use column-major
    ordering, but captured ECG/TMP exports such as `.adaptECG`, `.refECG`, and
    `.user.source` store each trace or source node contiguously after the
    `int32 rows, int32 columns` header.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    if len(data) < 8:
        raise MatrixFormatError(f"{source_path} is too short for a row-major matrix")

    rows, columns = struct.unpack_from("<ii", data, 0)
    _validate_shape(rows, columns)
    expected_bytes = 8 + rows * columns * 4
    if len(data) != expected_bytes:
        raise MatrixFormatError(
            f"{source_path} expected {expected_bytes} bytes for {rows}x{columns} row-major matrix, "
            f"found {len(data)}"
        )

    flat = struct.unpack_from(f"<{rows * columns}f", data, 8)
    return MatrixData(
        rows=rows,
        columns=columns,
        values=_rows_from_row_major(flat, rows, columns),
        source_path=source_path,
        storage_format="binary-float32-row-major",
    )


def _read_ascii_matrix(data: bytes, source_path: Path) -> MatrixData:
    try:
        text = data.decode("ascii")
    except UnicodeDecodeError as exc:
        raise MatrixFormatError("not ASCII text") from exc

    tokens = text.split()
    if len(tokens) < 2:
        raise MatrixFormatError("missing row/column header")

    try:
        rows = int(tokens[0])
        columns = int(tokens[1])
    except ValueError as exc:
        raise MatrixFormatError("row/column header is not integer") from exc

    _validate_shape(rows, columns)
    expected = rows * columns
    raw_values = tokens[2:]
    if len(raw_values) != expected:
        raise MatrixFormatError(f"expected {expected} values, found {len(raw_values)}")

    try:
        flat = [float(value) for value in raw_values]
    except ValueError as exc:
        raise MatrixFormatError("matrix contains a non-numeric value") from exc

    return MatrixData(
        rows=rows,
        columns=columns,
        values=_rows_from_row_major(flat, rows, columns),
        source_path=source_path,
        storage_format="ascii",
    )


def _read_raw_binary_matrix(data: bytes, source_path: Path) -> MatrixData:
    if len(data) < 8:
        raise MatrixFormatError("too short for binary row/column header")

    rows, columns = struct.unpack_from("<ii", data, 0)
    _validate_shape(rows, columns)
    expected_bytes = 8 + rows * columns * 4
    if len(data) != expected_bytes:
        raise MatrixFormatError(f"expected {expected_bytes} bytes, found {len(data)}")

    flat_column_major = struct.unpack_from(f"<{rows * columns}f", data, 8)
    return MatrixData(
        rows=rows,
        columns=columns,
        values=_rows_from_column_major(flat_column_major, rows, columns),
        source_path=source_path,
        storage_format="binary-float32",
    )


def _read_mbfmat(data: bytes, source_path: Path) -> MatrixData:
    if len(data) < 27:
        raise MatrixFormatError("too short for ;;mbfmat header")

    offset = 8
    offset += 1
    _header_size = struct.unpack_from("<i", data, offset)[0]
    offset += 4
    offset += 3
    rows, columns = struct.unpack_from("<ii", data, offset)
    offset += 8
    _validate_shape(rows, columns)
    expected_bytes = offset + rows * columns * 8
    if len(data) != expected_bytes:
        raise MatrixFormatError(f"expected {expected_bytes} bytes, found {len(data)}")

    flat_column_major = struct.unpack_from(f"<{rows * columns}d", data, offset)
    return MatrixData(
        rows=rows,
        columns=columns,
        values=_rows_from_column_major(flat_column_major, rows, columns),
        source_path=source_path,
        storage_format="mbfmat-float64",
    )


def _validate_shape(rows: int, columns: int) -> None:
    if rows <= 0 or columns <= 0:
        raise MatrixFormatError(f"invalid matrix shape {rows}x{columns}")


def _rows_from_row_major(
    flat: Sequence[float], rows: int, columns: int
) -> tuple[tuple[float, ...], ...]:
    return tuple(
        tuple(float(flat[row * columns + column]) for column in range(columns))
        for row in range(rows)
    )


def _rows_from_column_major(
    flat: Sequence[float], rows: int, columns: int
) -> tuple[tuple[float, ...], ...]:
    return tuple(
        tuple(float(flat[column * rows + row]) for column in range(columns))
        for row in range(rows)
    )
