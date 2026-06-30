# 0048 Capture Raw Legacy Exports For Numerical Parity

## Objective

Capture raw legacy exports for cases and workflows selected in the parity matrix.

## Minimal Context

Several scientific algorithms remain provisional because raw `.source`, `.adaptECG`, and related exports are missing.

## Inputs

- `docs/legacy-reference-exports.md`
- `docs/feature-parity/golden-workflows.md`
- Legacy app.

## Deliverables

- Add curated raw export manifests and checksums.
- Store large/raw outputs only where appropriate under ignored or documented paths.
- Add summarized fixtures for automated tests.

## Verification

- Checksums reproduce after capture.
- Each captured artifact maps to a golden workflow.

## Done When

Numerical parity tasks have concrete legacy outputs to compare against.

## Blocker Note

Blocked in the current automation environment. A 2026-06-29 probe launched `ECGsim-3.0.1/ECGsim.exe`, but UI Automation and keyboard menu probing could not expose or invoke `File -> Export`; no files were written under the ignored raw export probe directory. Complete this task from a normal interactive legacy-app session or with deeper native Qt automation, then commit manifests/checksums.

## Progress

Added raw-export intake diagnostics while capture remains blocked.

- `tools/summarize_legacy_export.py` now classifies legacy export files, records matrix/vector/geometry shapes when readable, and reports whether `.user.source`, `.adaptECG`, and `.refECG` artifacts are present.
- `tools/validate_legacy_capture.py` now produces JSON or Markdown capture handoff reports with the manifest, optional modern-export comparison, and readiness for downstream tasks `0049`, `0051`, `0052`, and `0053`.
- The validator supports `--require-ready` for full downstream readiness and `--require-task <id>` for accepting a partial capture that unblocks a specific next task, such as `0049`.
- Added tests with a synthetic export tree to prove manifest classification, checksum, shape, and parity-readiness behavior.
- Raw legacy export capture is still required before tasks `0049`, `0051`, `0052`, and full `0053` can claim scientific parity.
