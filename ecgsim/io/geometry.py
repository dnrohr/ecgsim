"""Readers for legacy ECGSIM triangulated geometry files."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import struct
from typing import Sequence


class GeometryFormatError(ValueError):
    """Raised when a geometry file cannot be parsed."""


@dataclass(frozen=True)
class GeometryData:
    """Triangulated geometry using zero-based triangle indices."""

    points: tuple[tuple[float, float, float], ...]
    triangles: tuple[tuple[int, int, int], ...]
    units: str
    source_index_base: int
    source_path: Path | None = None
    storage_format: str = "unknown"

    @property
    def point_count(self) -> int:
        return len(self.points)

    @property
    def triangle_count(self) -> int:
        return len(self.triangles)


def read_geometry(path: str | Path) -> GeometryData:
    """Read an ECGSIM ``.tri`` geometry file.

    Returned triangle indices are normalized to zero-based indexing for Python
    and rendering code. `source_index_base` records the on-disk convention.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    if not data:
        raise GeometryFormatError(f"{source_path} is empty")
    if data.startswith(b";;mbftri"):
        return _read_mbftri(data, source_path)
    return _read_ascii_tri(data, source_path)


def _read_ascii_tri(data: bytes, source_path: Path) -> GeometryData:
    try:
        text = data.decode("ascii")
    except UnicodeDecodeError as exc:
        raise GeometryFormatError("not ASCII text and not ;;mbftri") from exc

    tokens = text.split()
    if not tokens:
        raise GeometryFormatError("missing point count")

    cursor = 0
    try:
        point_count = int(tokens[cursor])
    except ValueError as exc:
        raise GeometryFormatError("point count is not integer") from exc
    cursor += 1
    _validate_count("point", point_count)

    expected_point_tokens = point_count * 4
    if len(tokens) < cursor + expected_point_tokens:
        raise GeometryFormatError("not enough point rows")

    points: list[tuple[float, float, float]] = []
    for _ in range(point_count):
        _index = _parse_int(tokens[cursor], "point index")
        x = _parse_float(tokens[cursor + 1], "x")
        y = _parse_float(tokens[cursor + 2], "y")
        z = _parse_float(tokens[cursor + 3], "z")
        points.append((x, y, z))
        cursor += 4

    triangles: list[tuple[int, int, int]] = []
    if cursor < len(tokens):
        triangle_count = _parse_int(tokens[cursor], "triangle count")
        cursor += 1
        _validate_count("triangle", triangle_count)
        expected_triangle_tokens = triangle_count * 4
        if len(tokens) < cursor + expected_triangle_tokens:
            raise GeometryFormatError(
                f"expected {expected_triangle_tokens} triangle tokens, "
                f"found {len(tokens) - cursor}"
            )
        for _ in range(triangle_count):
            _index = _parse_int(tokens[cursor], "triangle index")
            a = _parse_int(tokens[cursor + 1], "triangle node") - 1
            b = _parse_int(tokens[cursor + 2], "triangle node") - 1
            c = _parse_int(tokens[cursor + 3], "triangle node") - 1
            triangles.append((a, b, c))
            cursor += 4

    _validate_triangles(triangles, len(points))
    return GeometryData(
        points=tuple(points),
        triangles=tuple(triangles),
        units="m",
        source_index_base=1,
        source_path=source_path,
        storage_format="ascii-tri",
    )


def _read_mbftri(data: bytes, source_path: Path) -> GeometryData:
    if len(data) < 34:
        raise GeometryFormatError("too short for ;;mbftri header")

    offset = 8
    offset += 1
    _header_size = struct.unpack_from("<i", data, offset)[0]
    offset += 4
    offset += 3
    point_count, coordinate_columns = struct.unpack_from("<ii", data, offset)
    offset += 8
    offset += 1
    triangle_count, triangle_columns = struct.unpack_from("<ii", data, offset)
    offset += 8

    _validate_count("point", point_count)
    _validate_count("triangle", triangle_count)
    if coordinate_columns < 3:
        raise GeometryFormatError(f"expected at least 3 coordinate columns, found {coordinate_columns}")
    if triangle_columns < 3:
        raise GeometryFormatError(f"expected at least 3 triangle columns, found {triangle_columns}")

    point_value_count = point_count * coordinate_columns
    triangle_value_count = triangle_count * triangle_columns
    expected_bytes = offset + point_value_count * 8 + triangle_value_count * 4
    if len(data) != expected_bytes:
        raise GeometryFormatError(f"expected {expected_bytes} bytes, found {len(data)}")

    flat_points = struct.unpack_from(f"<{point_value_count}d", data, offset)
    offset += point_value_count * 8
    flat_triangles = struct.unpack_from(f"<{triangle_value_count}i", data, offset)

    points = tuple(
        tuple(float(flat_points[column * point_count + row]) for column in range(3))
        for row in range(point_count)
    )
    triangles = tuple(
        tuple(int(flat_triangles[column * triangle_count + row]) for column in range(3))
        for row in range(triangle_count)
    )
    _validate_triangles(triangles, len(points))
    return GeometryData(
        points=points,
        triangles=triangles,
        units="m",
        source_index_base=0,
        source_path=source_path,
        storage_format="mbftri",
    )


def _parse_int(value: str, label: str) -> int:
    try:
        return int(value)
    except ValueError as exc:
        raise GeometryFormatError(f"{label} is not integer: {value!r}") from exc


def _parse_float(value: str, label: str) -> float:
    try:
        return float(value)
    except ValueError as exc:
        raise GeometryFormatError(f"{label} is not numeric: {value!r}") from exc


def _validate_count(label: str, count: int) -> None:
    if count < 0:
        raise GeometryFormatError(f"invalid {label} count {count}")


def _validate_triangles(triangles: Sequence[tuple[int, int, int]], point_count: int) -> None:
    for triangle in triangles:
        for index in triangle:
            if index < 0 or index >= point_count:
                raise GeometryFormatError(
                    f"triangle index {index} outside point range 0..{point_count - 1}"
                )
