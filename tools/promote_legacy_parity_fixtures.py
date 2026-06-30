#!/usr/bin/env python3
"""Promote small legacy export artifacts into curated parity fixtures."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import sys


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.summarize_legacy_export import build_manifest


DEFAULT_ARTIFACTS = ("tmpSource", "referenceEcg", "adaptedEcg")


def promote_fixtures(
    capture_dir: Path,
    output_dir: Path,
    *,
    artifacts: tuple[str, ...] = DEFAULT_ARTIFACTS,
    case_id: str | None = None,
) -> dict[str, object]:
    manifest = build_manifest(capture_dir)
    parity_artifacts = manifest["parityArtifacts"]
    unknown = [artifact for artifact in artifacts if artifact not in parity_artifacts]
    if unknown:
        known = ", ".join(sorted(parity_artifacts))
        raise ValueError(f"unknown artifact(s): {', '.join(unknown)}; known artifacts: {known}")
    missing = [artifact for artifact in artifacts if not parity_artifacts[artifact]["present"]]
    if missing:
        raise ValueError(f"required artifact(s) missing from capture: {', '.join(missing)}")

    promoted = []
    for artifact in artifacts:
        coverage = parity_artifacts[artifact]
        for relative_path in coverage["paths"]:
            source = capture_dir / relative_path
            target = output_dir / relative_path
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, target)
            source_entry = next(file for file in manifest["files"] if file["path"] == relative_path)
            promoted.append(
                {
                    "artifact": artifact,
                    "path": relative_path,
                    "bytes": source_entry["bytes"],
                    "sha256": source_entry["sha256"],
                    "classification": source_entry["classification"],
                    "numericSummary": source_entry["numericSummary"],
                }
            )

    fixture_manifest = {
        "schema": "org.ecgsim.legacy-parity-fixture-set",
        "version": 1,
        "caseId": case_id,
        "sourceCaptureDir": capture_dir.as_posix(),
        "artifactNames": list(artifacts),
        "fileCount": len(promoted),
        "files": promoted,
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "manifest.json").write_text(json.dumps(fixture_manifest, indent=2) + "\n", encoding="utf-8")
    return fixture_manifest


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("capture_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument("--case-id", help="Stable case/workflow identifier to record in the fixture manifest.")
    parser.add_argument(
        "--artifact",
        action="append",
        choices=DEFAULT_ARTIFACTS,
        default=[],
        help="Artifact to promote. May be repeated. Defaults to all raw numerical parity artifacts.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not args.capture_dir.is_dir():
        raise SystemExit(f"{args.capture_dir} is not a directory")
    artifacts = tuple(args.artifact) if args.artifact else DEFAULT_ARTIFACTS
    try:
        manifest = promote_fixtures(
            args.capture_dir,
            args.output_dir,
            artifacts=artifacts,
            case_id=args.case_id,
        )
    except ValueError as exc:
        raise SystemExit(str(exc)) from exc
    print(json.dumps(manifest, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
