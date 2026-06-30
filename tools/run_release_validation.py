"""Run release-level validation and collect evidence artifacts."""

from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path
import subprocess
import sys
import time


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_ROOT = ROOT / "dist/release-validation/latest"


@dataclass(frozen=True)
class ValidationStep:
    id: str
    command: tuple[str, ...]
    description: str


STEPS = (
    ValidationStep(
        id="python-tests",
        command=(sys.executable, "-m", "unittest", "discover", "-s", "tests"),
        description="Parser, IO, core, export, and parity unit/regression tests.",
    ),
    ValidationStep(
        id="viewer-smoke",
        command=("npm", "--prefix", "app/viewer", "test"),
        description="Viewer fixture and module smoke checks.",
    ),
    ValidationStep(
        id="packaged-workflow",
        command=("npm", "--prefix", "app/viewer", "run", "test:package"),
        description="Build static package and run browser golden workflow against packaged output.",
    ),
    ValidationStep(
        id="packaged-screenshot",
        command=(
            "npm",
            "--prefix",
            "app/viewer",
            "run",
            "capture:package",
            "--",
            "--output",
            str(ARTIFACT_ROOT / "packaged-viewer.png"),
        ),
        description="Capture a full-page screenshot of the packaged viewer for review.",
    ),
    ValidationStep(
        id="whitespace",
        command=("git", "diff", "--check"),
        description="Whitespace sanity check for the release candidate worktree.",
    ),
)


def main() -> int:
    ARTIFACT_ROOT.mkdir(parents=True, exist_ok=True)
    results = []
    failed = False

    for step in STEPS:
        result = run_step(step)
        results.append(result)
        if result["exitCode"] != 0:
            failed = True
            break

    summary = {
        "schema": "org.ecgsim.release-validation",
        "version": 1,
        "status": "failed" if failed else "passed",
        "artifactRoot": str(ARTIFACT_ROOT),
        "steps": results,
    }
    (ARTIFACT_ROOT / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    (ARTIFACT_ROOT / "summary.md").write_text(format_markdown_summary(summary), encoding="utf-8")
    print(format_markdown_summary(summary))
    return 1 if failed else 0


def run_step(step: ValidationStep) -> dict[str, object]:
    start = time.perf_counter()
    completed = subprocess.run(
        platform_command(step.command),
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    elapsed_ms = round((time.perf_counter() - start) * 1000, 1)
    log_path = ARTIFACT_ROOT / f"{step.id}.log"
    log_path.write_text(
        "\n".join(
            (
                f"$ {' '.join(step.command)}",
                "",
                "[stdout]",
                completed.stdout,
                "[stderr]",
                completed.stderr,
            )
        ),
        encoding="utf-8",
    )
    return {
        "id": step.id,
        "description": step.description,
        "command": list(step.command),
        "exitCode": completed.returncode,
        "elapsedMs": elapsed_ms,
        "log": str(log_path),
    }


def platform_command(command: tuple[str, ...]) -> tuple[str, ...]:
    if os.name == "nt" and command[0] == "npm":
        return ("npm.cmd",) + command[1:]
    return command


def format_markdown_summary(summary: dict[str, object]) -> str:
    lines = [
        "# Release Validation Summary",
        "",
        f"Status: {summary['status']}",
        "",
        f"Artifacts: `{summary['artifactRoot']}`",
        "",
        "| Step | Exit | Elapsed | Log |",
        "| --- | ---: | ---: | --- |",
    ]
    for step in summary["steps"]:
        lines.append(
            f"| `{step['id']}` | {step['exitCode']} | {step['elapsedMs']} ms | `{step['log']}` |"
        )
    lines.append("")
    if summary["status"] == "passed":
        lines.append("Release candidate validation passed for the current static package workflow.")
    else:
        lines.append("Release candidate validation failed; inspect the first nonzero step log.")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    raise SystemExit(main())
