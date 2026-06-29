#!/usr/bin/env python3
"""Create a checksum manifest for a legacy ECGSIM export directory."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def build_manifest(root: Path) -> dict[str, object]:
    files = []
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        files.append(
            {
                "path": path.relative_to(root).as_posix(),
                "bytes": path.stat().st_size,
                "sha256": file_sha256(path),
            }
        )
    return {
        "exportRoot": root.as_posix(),
        "fileCount": len(files),
        "totalBytes": sum(file["bytes"] for file in files),
        "files": files,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("export_dir", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        help="Write the manifest as UTF-8 JSON instead of printing to stdout.",
    )
    args = parser.parse_args()
    export_dir = args.export_dir
    if not export_dir.is_dir():
        parser.error(f"{export_dir} is not a directory")
    manifest = json.dumps(build_manifest(export_dir), indent=2) + "\n"
    if args.output:
        args.output.write_text(manifest, encoding="utf-8")
    else:
        print(manifest, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
