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
