"""Metadata-only reader for legacy ECGSIM .ECGsimcase files."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import hashlib
import math
from pathlib import Path
import struct

from ecgsim.io.geometry import GeometryData
from ecgsim.io.matrix import MatrixData, VectorData


ROOT_SIGNATURE = "PECGsimData"
PMATRIX_SIGNATURE = "PMatrix"
PGEOMETRY_SIGNATURE = "PGeometry"
PRINTABLE_MIN = 0x20
PRINTABLE_MAX = 0x7E
GEOMETRY_NAMES_BY_INDEX = (
    "thorax",
    "heart",
    "empty_geometry_1",
    "empty_geometry_2",
    "right_lung",
    "left_lung",
    "auxiliary_geometry_1",
    "auxiliary_geometry_2",
)


class ECGsimCaseFormatError(ValueError):
    """Raised when an ECGsimcase file does not match the known container shape."""


@dataclass(frozen=True)
class StringEntry:
    """A length-prefixed UTF-16LE string found in a case file."""

    offset: int
    byte_length: int
    text: str


@dataclass(frozen=True)
class ECGsimCaseMetadata:
    """Metadata and object-marker inventory for an ECGsimcase file."""

    source_path: Path
    byte_size: int
    sha256: str
    entropy_bits_per_byte: float
    root_signature: str
    strings: tuple[StringEntry, ...]
    marker_counts: dict[str, int]
    marker_offsets: dict[str, tuple[int, ...]]
    lead_systems: tuple[str, ...]
    unsupported_payloads: tuple[str, ...]


@dataclass(frozen=True)
class ECGsimCaseGeometry:
    """A named ``PGeometry`` payload parsed from an ECGsimcase file."""

    name: str
    marker_offset: int
    geometry: GeometryData

    @property
    def point_count(self) -> int:
        return self.geometry.point_count

    @property
    def triangle_count(self) -> int:
        return self.geometry.triangle_count


def read_ecgsimcase_metadata(path: str | Path) -> ECGsimCaseMetadata:
    """Read metadata and object markers without parsing numeric payloads."""

    source_path = Path(path)
    data = source_path.read_bytes()
    if not data:
        raise ECGsimCaseFormatError(f"{source_path} is empty")

    strings = tuple(find_length_prefixed_utf16le(data, min_chars=2))
    if not strings or strings[0].offset != 0 or strings[0].text != ROOT_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} does not start with {ROOT_SIGNATURE!r}")

    marker_offsets: dict[str, list[int]] = {}
    for entry in strings:
        if entry.text.startswith("P"):
            marker_offsets.setdefault(entry.text, []).append(entry.offset)

    lead_systems: list[str] = []
    for index, entry in enumerate(strings):
        if entry.text == "PLeadSystem" and index + 1 < len(strings):
            lead_systems.append(strings[index + 1].text)

    frozen_offsets = {name: tuple(offsets) for name, offsets in marker_offsets.items()}
    marker_counts = dict(Counter({name: len(offsets) for name, offsets in frozen_offsets.items()}))

    return ECGsimCaseMetadata(
        source_path=source_path,
        byte_size=len(data),
        sha256=hashlib.sha256(data).hexdigest(),
        entropy_bits_per_byte=shannon_entropy(data),
        root_signature=strings[0].text,
        strings=strings,
        marker_counts=marker_counts,
        marker_offsets=frozen_offsets,
        lead_systems=tuple(lead_systems),
        unsupported_payloads=(
            "PMatrix numeric payloads",
            "PGeometry numeric payloads",
            "PGraphGeometry payloads",
            "PSource/PSourceParameter payloads",
            "unnamed PVector payloads",
            "PActivationConstruction payloads",
            "PLead/PShowLead payloads",
        ),
    )


def read_ecgsimcase_geometries(path: str | Path) -> tuple[ECGsimCaseGeometry, ...]:
    """Read all known ``PGeometry`` payloads from an ECGsimcase file.

    The observed payload shape is a marker, ``int32`` version, ``int32`` flag,
    ``int32`` point count, row-major float32 XYZ triplets, ``int32`` triangle
    count, then zero-based int32 triangle triplets.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    geometries: list[ECGsimCaseGeometry] = []

    for index, offset in enumerate(metadata.marker_offsets.get(PGEOMETRY_SIGNATURE, ())):
        name = GEOMETRY_NAMES_BY_INDEX[index] if index < len(GEOMETRY_NAMES_BY_INDEX) else f"geometry_{index}"
        geometries.append(
            ECGsimCaseGeometry(
                name=name,
                marker_offset=offset,
                geometry=_read_ecgsimcase_geometry_payload(data, source_path, offset),
            )
        )

    return tuple(geometries)


def read_ecgsimcase_matrix(path: str | Path, offset: int) -> MatrixData:
    """Read a known ``PMatrix`` payload from an ECGsimcase file.

    This is intentionally offset-driven while the full case object graph is
    still being mapped. The payload shape observed so far is:
    length-prefixed ``PMatrix`` marker, uint32 version, int32 rows, int32 columns,
    then row-major little-endian float32 values.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    if offset < 0 or offset + 4 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix offset {offset} is outside the file")

    byte_length = struct.unpack_from("<I", data, offset)[0]
    text_start = offset + 4
    text_end = text_start + byte_length
    if text_end > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix marker at {offset} overruns the file")
    try:
        marker = data[text_start:text_end].decode("utf-16le")
    except UnicodeDecodeError as exc:
        raise ECGsimCaseFormatError(f"{source_path} PMatrix marker at {offset} is not UTF-16LE") from exc
    if marker != PMATRIX_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PMatrix")

    header_offset = text_end
    if header_offset + 12 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix header at {offset} overruns the file")
    version, rows, columns = struct.unpack_from("<iii", data, header_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PMatrix at {offset} has invalid version {version}")
    if rows <= 0 or columns <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PMatrix at {offset} has invalid shape {rows}x{columns}")

    values_offset = header_offset + 12
    expected_bytes = rows * columns * 4
    if values_offset + expected_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix values at {offset} overrun the file")
    flat = struct.unpack_from(f"<{rows * columns}f", data, values_offset)
    values = tuple(
        tuple(float(flat[row * columns + column]) for column in range(columns))
        for row in range(rows)
    )

    return MatrixData(
        rows=rows,
        columns=columns,
        values=values,
        source_path=source_path,
        storage_format=f"ecgsimcase-pmatrix-v{version}",
    )


def read_ecgsimcase_vector(path: str | Path, offset: int) -> VectorData:
    """Read a known ``PVector`` payload from an ECGsimcase file."""

    source_path = Path(path)
    data = source_path.read_bytes()
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != "PVector":
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PVector")

    if values_offset + 8 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PVector header at {offset} overruns the file")
    version, length = struct.unpack_from("<ii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PVector at {offset} has invalid version {version}")
    if length <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PVector at {offset} has invalid length {length}")

    value_start = values_offset + 8
    expected_bytes = length * 4
    if value_start + expected_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PVector values at {offset} overrun the file")
    values = struct.unpack_from(f"<{length}f", data, value_start)

    return VectorData(
        length=length,
        values=tuple(float(value) for value in values),
        source_path=source_path,
        storage_format=f"ecgsimcase-pvector-v{version}",
    )


def _read_ecgsimcase_geometry_payload(data: bytes, source_path: Path, offset: int) -> GeometryData:
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != PGEOMETRY_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PGeometry")

    if values_offset + 12 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry header at {offset} overruns the file")
    version, _flags, point_count = struct.unpack_from("<iii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PGeometry at {offset} has invalid version {version}")
    if point_count < 0:
        raise ECGsimCaseFormatError(f"{source_path} PGeometry at {offset} has invalid point count {point_count}")

    point_start = values_offset + 12
    point_bytes = point_count * 3 * 4
    triangle_count_offset = point_start + point_bytes
    if triangle_count_offset + 4 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry points at {offset} overrun the file")
    flat_points = struct.unpack_from(f"<{point_count * 3}f", data, point_start) if point_count else ()
    points = tuple(
        (
            float(flat_points[row * 3]),
            float(flat_points[row * 3 + 1]),
            float(flat_points[row * 3 + 2]),
        )
        for row in range(point_count)
    )

    (triangle_count,) = struct.unpack_from("<i", data, triangle_count_offset)
    if triangle_count < 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PGeometry at {offset} has invalid triangle count {triangle_count}"
        )

    triangle_start = triangle_count_offset + 4
    triangle_bytes = triangle_count * 3 * 4
    if triangle_start + triangle_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry triangles at {offset} overrun the file")
    flat_triangles = (
        struct.unpack_from(f"<{triangle_count * 3}i", data, triangle_start) if triangle_count else ()
    )
    triangles = tuple(
        (
            int(flat_triangles[row * 3]),
            int(flat_triangles[row * 3 + 1]),
            int(flat_triangles[row * 3 + 2]),
        )
        for row in range(triangle_count)
    )
    for triangle in triangles:
        for point_index in triangle:
            if point_index < 0 or point_index >= point_count:
                raise ECGsimCaseFormatError(
                    f"{source_path} PGeometry at {offset} has triangle index {point_index} "
                    f"outside point range 0..{point_count - 1}"
                )

    return GeometryData(
        points=points,
        triangles=triangles,
        units="case-coordinate-units",
        source_index_base=0,
        source_path=source_path,
        storage_format=f"ecgsimcase-pgeometry-v{version}",
    )


def _read_marker(data: bytes, source_path: Path, offset: int) -> tuple[str, int]:
    if offset < 0 or offset + 4 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} marker offset {offset} is outside the file")

    byte_length = struct.unpack_from("<I", data, offset)[0]
    text_start = offset + 4
    text_end = text_start + byte_length
    if text_end > len(data):
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} overruns the file")
    try:
        marker = data[text_start:text_end].decode("utf-16le")
    except UnicodeDecodeError as exc:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is not UTF-16LE") from exc
    return marker, text_end


def find_length_prefixed_utf16le(
    data: bytes, *, min_chars: int = 3, max_chars: int = 256
) -> list[StringEntry]:
    """Find plausible uint32 length-prefixed UTF-16LE strings."""

    hits: list[StringEntry] = []
    limit = len(data) - 4
    offset = 0
    while offset <= limit:
        (byte_length,) = struct.unpack_from("<I", data, offset)
        if (
            byte_length >= min_chars * 2
            and byte_length <= max_chars * 2
            and byte_length % 2 == 0
            and offset + 4 + byte_length <= len(data)
        ):
            raw = data[offset + 4 : offset + 4 + byte_length]
            try:
                text = raw.decode("utf-16le")
            except UnicodeDecodeError:
                offset += 1
                continue
            if "\x00" not in text and is_reasonable_text(text):
                hits.append(StringEntry(offset, byte_length, text))
                offset += 4 + byte_length
                continue
        offset += 1
    return hits


def shannon_entropy(data: bytes) -> float:
    """Return byte-level Shannon entropy in bits per byte."""

    if not data:
        return 0.0
    counts = [0] * 256
    for byte in data:
        counts[byte] += 1
    total = len(data)
    entropy = 0.0
    for count in counts:
        if count:
            probability = count / total
            entropy -= probability * math.log2(probability)
    return entropy


def is_reasonable_text(text: str) -> bool:
    if not text:
        return False
    good = 0
    for ch in text:
        code = ord(ch)
        if ch in "\r\n\t" or PRINTABLE_MIN <= code <= PRINTABLE_MAX:
            good += 1
    return good / len(text) >= 0.85
