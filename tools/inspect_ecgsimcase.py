#!/usr/bin/env python3
"""Inspect ECGSIM .ECGsimcase files.

This is an exploratory tool for documenting the legacy case container. It does
not parse numeric payloads yet; it reports file signatures and likely serialized
UTF-16LE string fields with offsets.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from ecgsim.io.ecgsimcase import read_ecgsimcase_metadata


def hex_head(data: bytes, count: int = 32) -> str:
    return " ".join(f"{byte:02X}" for byte in data[:count])


def ascii_head(data: bytes, count: int = 32) -> str:
    return "".join(chr(byte) if 32 <= byte <= 126 else "." for byte in data[:count])


def inspect_file(path: Path, *, max_strings: int) -> str:
    metadata = read_ecgsimcase_metadata(path)
    data = path.read_bytes()
    strings = metadata.strings
    lines = [
        f"file: {path}",
        f"bytes: {metadata.byte_size}",
        f"sha256: {metadata.sha256}",
        f"entropy_bits_per_byte: {metadata.entropy_bits_per_byte:.3f}",
        f"head_hex: {hex_head(data, 64)}",
        f"head_ascii: {ascii_head(data, 64)}",
        f"utf16le_length_prefixed_strings: {len(strings)}",
    ]
    if metadata.marker_counts:
        markers = ", ".join(
            f"{name}={count}" for name, count in sorted(metadata.marker_counts.items())
        )
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
