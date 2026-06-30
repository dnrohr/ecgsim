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
