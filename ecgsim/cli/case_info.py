"""Print metadata for legacy ECGSIM case files."""

from __future__ import annotations

import argparse
from pathlib import Path

from ecgsim.io import ECGsimCaseMetadata, read_ecgsimcase_metadata


SUMMARY_MARKERS = (
    "PMatrix",
    "PGeometry",
    "PGraphGeometry",
    "PSource",
    "PSourceParameter",
    "PVector",
    "PActivationConstruction",
    "PLeadSystem",
    "PLead",
    "PShowLead",
)


def format_case_metadata(metadata: ECGsimCaseMetadata) -> str:
    """Return stable human-readable metadata output."""

    lines = [
        f"case: {metadata.source_path.name}",
        f"path: {metadata.source_path}",
        f"bytes: {metadata.byte_size}",
        f"sha256: {metadata.sha256}",
        "detected_format: ECGsimcase custom little-endian binary stream",
        f"root_signature: {metadata.root_signature}",
        f"entropy_bits_per_byte: {metadata.entropy_bits_per_byte:.3f}",
        "sections:",
    ]
    for marker in SUMMARY_MARKERS:
        count = metadata.marker_counts.get(marker, 0)
        if count:
            first_offset = metadata.marker_offsets[marker][0]
            lines.append(f"  {marker}: count={count} first_offset={first_offset}")
    if metadata.lead_systems:
        lines.append("lead_systems:")
        for lead_system in metadata.lead_systems:
            lines.append(f"  - {lead_system}")
    if metadata.unsupported_payloads:
        lines.append("unsupported_payloads:")
        for payload in metadata.unsupported_payloads:
            lines.append(f"  - {payload}")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("case_file", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    metadata = read_ecgsimcase_metadata(args.case_file)
    print(format_case_metadata(metadata))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
