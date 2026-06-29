"""Metadata-only reader for legacy ECGSIM .ECGsimcase files."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import hashlib
import math
from pathlib import Path
import struct


ROOT_SIGNATURE = "PECGsimData"
PRINTABLE_MIN = 0x20
PRINTABLE_MAX = 0x7E


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
            "PVector payloads",
            "PActivationConstruction payloads",
            "PLead/PShowLead payloads",
        ),
    )


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
