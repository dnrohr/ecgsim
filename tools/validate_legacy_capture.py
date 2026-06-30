#!/usr/bin/env python3
"""Validate a raw legacy ECGSIM capture directory for parity follow-up tasks."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import export_case_directory
from tools.compare_export_directories import compare_export_directories
from tools.summarize_legacy_export import build_manifest


TASK_REQUIREMENTS = {
    "0049": {
        "label": "Legacy TMP Generator Parity",
        "requiredArtifacts": ("tmpSource",),
    },
    "0051": {
        "label": "Viewer Recompute Pipeline",
        "requiredArtifacts": ("tmpSource", "adaptedEcg"),
    },
    "0052": {
        "label": "Fiducial And Filtering Parity",
        "requiredArtifacts": ("referenceEcg", "adaptedEcg"),
    },
    "0053": {
        "label": "Numerical Parity Harness",
        "requiredArtifacts": ("tmpSource", "referenceEcg", "adaptedEcg"),
    },
}


def validate_capture(
    capture_dir: Path,
    *,
    case_path: Path | None = None,
    modern_export_dir: Path | None = None,
) -> dict[str, object]:
    manifest = build_manifest(capture_dir)
    comparison = None
    if case_path is not None or modern_export_dir is not None:
        if modern_export_dir is not None:
            comparison = compare_export_directories(capture_dir, modern_export_dir)
        else:
            with tempfile.TemporaryDirectory() as tmp:
                generated_modern_dir = Path(tmp) / "modern-export"
                export_case_directory(case_path, generated_modern_dir)
                comparison = compare_export_directories(capture_dir, generated_modern_dir)

    return {
        "schema": "org.ecgsim.legacy-capture-validation",
        "version": 1,
        "captureDir": capture_dir.as_posix(),
        "manifest": manifest,
        "taskReadiness": task_readiness(manifest),
        "comparison": comparison,
    }


def task_readiness(manifest: dict[str, object]) -> dict[str, dict[str, object]]:
    parity_artifacts = manifest["parityArtifacts"]
    readiness = {}
    for task_id, requirement in TASK_REQUIREMENTS.items():
        missing = [
            artifact
            for artifact in requirement["requiredArtifacts"]
            if not parity_artifacts[artifact]["present"]
        ]
        readiness[task_id] = {
            "label": requirement["label"],
            "ready": not missing,
            "requiredArtifacts": list(requirement["requiredArtifacts"]),
            "missingArtifacts": missing,
        }
    return readiness


def render_markdown_report(validation: dict[str, object]) -> str:
    manifest = validation["manifest"]
    parity_artifacts = manifest["parityArtifacts"]
    task_status = validation["taskReadiness"]
    comparison = validation["comparison"]

    lines = [
        "# Legacy Capture Validation",
        "",
        f"- Capture directory: `{validation['captureDir']}`",
        f"- Files: {manifest['fileCount']}",
        f"- Total bytes: {manifest['totalBytes']}",
        f"- Ready for numerical parity: {yes_no(manifest['readyForNumericalParity'])}",
        "",
        "## Required Artifacts",
        "",
        "| Artifact | Present | Paths |",
        "| --- | --- | --- |",
    ]
    for artifact_name, artifact in parity_artifacts.items():
        paths = ", ".join(f"`{path}`" for path in artifact["paths"]) if artifact["paths"] else "missing"
        lines.append(f"| `{artifact_name}` | {yes_no(artifact['present'])} | {paths} |")

    lines.extend(
        [
            "",
            "## Task Readiness",
            "",
            "| Task | Ready | Missing artifacts |",
            "| --- | --- | --- |",
        ]
    )
    for task_id, readiness in task_status.items():
        missing = ", ".join(f"`{artifact}`" for artifact in readiness["missingArtifacts"]) or "none"
        lines.append(f"| `{task_id}` {readiness['label']} | {yes_no(readiness['ready'])} | {missing} |")

    if comparison is not None:
        lines.extend(
            [
                "",
                "## Modern Export Comparison",
                "",
                f"- Status: `{comparison['status']}`",
                f"- Compared files: {comparison['comparedCount']}",
                f"- Failed files: {comparison['failedCount']}",
                f"- Extra legacy files: {len(comparison['extraLegacyFiles'])}",
            ]
        )
        failed = [item for item in comparison["comparisons"] if item["status"] != "passed"]
        if failed:
            lines.extend(["", "| Path | Status | Message |", "| --- | --- | --- |"])
            for item in failed[:10]:
                message = str(item.get("message", "")).replace("\n", " ")
                lines.append(f"| `{item['path']}` | `{item['status']}` | {message} |")
            if len(failed) > 10:
                lines.append(f"| ... | ... | {len(failed) - 10} more failures omitted from summary. |")

    lines.append("")
    return "\n".join(lines)


def yes_no(value: object) -> str:
    return "yes" if value else "no"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("capture_dir", type=Path)
    parser.add_argument("--case", type=Path, help="Case used to generate a temporary modern export comparison.")
    parser.add_argument("--modern-export-dir", type=Path, help="Existing modern export directory to compare.")
    parser.add_argument("--output", type=Path, help="Write the validation report to this path.")
    parser.add_argument(
        "--format",
        choices=("json", "markdown"),
        default="json",
        help="Output JSON for automation or Markdown for human handoff notes.",
    )
    parser.add_argument(
        "--require-ready",
        action="store_true",
        help="Exit nonzero unless all tracked downstream task requirements are ready.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if not args.capture_dir.is_dir():
        raise SystemExit(f"{args.capture_dir} is not a directory")
    if args.case is not None and args.modern_export_dir is not None:
        raise SystemExit("pass either --case or --modern-export-dir, not both")

    validation = validate_capture(
        args.capture_dir,
        case_path=args.case,
        modern_export_dir=args.modern_export_dir,
    )
    if args.format == "markdown":
        text = render_markdown_report(validation)
    else:
        text = json.dumps(validation, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")

    if args.require_ready and not all(item["ready"] for item in validation["taskReadiness"].values()):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
