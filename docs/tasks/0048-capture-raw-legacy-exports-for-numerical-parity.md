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

## Capture Note

Resolved for the bundled ECGSIM 3.0.1 normal male case on 2026-07-01. A deeper Win32 automation probe launched `ECGsim-3.0.1/ECGsim.exe`, opened `File -> Export`, drove the native `export case data files to directory` folder picker, and wrote a complete raw export under the ignored directory:

```text
research/legacy-exports/raw/normal-male/final-export-win32-probe/normal_male/
```

## Progress

Added raw-export intake diagnostics and captured the first raw legacy export set.

- `tools/summarize_legacy_export.py` now classifies legacy export files, records matrix/vector/geometry shapes when readable, and reports whether `.user.source`, `.adaptECG`, and `.refECG` artifacts are present.
- `tools/validate_legacy_capture.py` now produces JSON or Markdown capture handoff reports with the manifest, optional modern-export comparison, and readiness for downstream tasks `0049`, `0051`, `0052`, and `0053`.
- The validator supports `--require-ready` for full downstream readiness and `--require-task <id>` for accepting a partial capture that unblocks a specific next task, such as `0049`.
- `tools/promote_legacy_parity_fixtures.py` can copy reviewed `.user.source`, `.refECG`, or `.adaptECG` artifacts from an ignored raw capture into a curated fixture directory with a checksum/shape manifest and verify that promoted files still match it.
- Added tests with a synthetic export tree to prove manifest classification, checksum, shape, parity-readiness behavior, fixture promotion, and promoted-fixture verification.
- Captured and committed `research/legacy-exports/normal-male-ecgsim301-manifest.json`, `research/legacy-exports/normal-male-ecgsim301-validation.json`, and `research/legacy-exports/normal-male-ecgsim301-validation.md`.
- Promoted curated numerical fixtures under `tests/fixtures/legacy-parity/normal-male-ecgsim301/`.
- The promoted fixture set includes `ventricular_beats/beat1/user.source`, five `.refECG` matrices, and `ecgs/standard_12.adaptECG`; all promoted files pass manifest verification.
- Tasks `0049`, `0051`, `0052`, and `0053` now have concrete raw legacy artifacts for the normal male ECGSIM 3.0.1 case.
