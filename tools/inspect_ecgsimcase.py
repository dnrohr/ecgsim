#!/usr/bin/env python3
"""Inspect ECGSIM .ECGsimcase files.

This is an exploratory tool for documenting the legacy case container. It does
not parse numeric payloads yet; it reports file signatures and likely serialized
UTF-16LE string fields with offsets.
"""

from __future__ import annotations

import argparse
import hashlib
import math
import struct
from dataclasses import dataclass
from pathlib import Path
from collections import Counter


PRINTABLE_MIN = 0x20
PRINTABLE_MAX = 0x7E


@dataclass(frozen=True)
class StringHit:
    offset: int
    byte_length: int
    text: str


def shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = [0] * 256
    for byte in data:
        counts[byte] += 1
    total = len(data)
    entropy = 0.0
    for count in counts:
        if count:
            p = count / total
            entropy -= p * math.log2(p)
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


def find_length_prefixed_utf16le(data: bytes, *, min_chars: int = 3, max_chars: int = 256) -> list[StringHit]:
    hits: list[StringHit] = []
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
                hits.append(StringHit(offset, byte_length, text))
                offset += 4 + byte_length
                continue
        offset += 1
    return hits


def hex_head(data: bytes, count: int = 32) -> str:
    return " ".join(f"{byte:02X}" for byte in data[:count])


def ascii_head(data: bytes, count: int = 32) -> str:
    return "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in data[:count])


def inspect_file(path: Path, *, max_strings: int) -> str:
    data = path.read_bytes()
    strings = find_length_prefixed_utf16le(data)
    marker_counts = Counter(hit.text for hit in strings if hit.text.startswith("P"))
    lines = [
        f"file: {path}",
        f"bytes: {len(data)}",
        f"sha256: {hashlib.sha256(data).hexdigest()}",
        f"entropy_bits_per_byte: {shannon_entropy(data):.3f}",
        f"head_hex: {hex_head(data, 64)}",
        f"head_ascii: {ascii_head(data, 64)}",
        f"utf16le_length_prefixed_strings: {len(strings)}",
    ]
    if marker_counts:
        markers = ", ".join(f"{name}={count}" for name, count in sorted(marker_counts.items()))
        lines.append(f"p_markers: {markers}")
    for hit in strings[:max_strings]:
        lines.append(f"  {hit.offset:10d} len={hit.byte_length:4d} text={hit.text!r}")
    if len(strings) > max_strings:
        lines.append(f"  ... {len(strings) - max_strings} more")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", help="Case paths or glob patterns.")
    parser.add_argument("--max-strings", type=int, default=80)
    args = parser.parse_args()

    paths: list[Path] = []
    for value in args.paths:
        matches = sorted(Path().glob(value)) if any(ch in value for ch in "*?[") else []
        paths.extend(matches or [Path(value)])

    for index, path in enumerate(paths):
        if index:
            print()
        print(inspect_file(path, max_strings=args.max_strings))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
