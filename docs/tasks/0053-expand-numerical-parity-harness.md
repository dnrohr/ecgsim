# 0053 Expand Numerical Parity Harness

## Objective

Create a broad numerical parity harness for parsed, generated, and exported outputs.

## Minimal Context

Existing regression tests cover fixture integrity and small samples. Feature parity needs scenario-level numerical comparisons.

## Inputs

- `docs/parity.md`
- `docs/feature-parity/golden-workflows.md`
- Raw exports from task `0048`.

## Deliverables

- Add tests for TMP matrices, ECG/lead matrices, BSPM maps, filtering outputs, and exports.
- Add clear per-area tolerances and failure diagnostics.
- Keep large artifacts out of git unless intentionally curated.

## Verification

- Harness fails on known injected differences.
- Test runtime remains acceptable for normal development.

## Done When

Scientific regressions are caught before UI or packaging work ships.

## Progress Note

Partially implemented by adding reusable numerical sequence comparison helpers with absolute/relative tolerances and diagnostic failure messages, plus tests that prove injected differences fail and current surface-potential/TMP fixtures match parsed source samples. Full scenario coverage for legacy `.adaptECG`, `.refECG`, `.user.source`, export directories, and filtering outputs remains blocked by missing raw exports from task `0048`.
