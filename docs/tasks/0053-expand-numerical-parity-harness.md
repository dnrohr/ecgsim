# 0053 Expand Numerical Parity Harness

## Objective

Create a broad numerical parity harness for parsed, generated, and exported outputs.

## Minimal Context

Existing regression tests cover fixture integrity and small samples. Feature parity needs scenario-level numerical comparisons.

## Inputs

- `docs/parity.md`
- `docs/feature-parity/golden-workflows.md`
- Validated raw exports from task `0048`.
- Promoted fixture sets under `tests/fixtures/legacy-parity/<case-name>/` with `tmpSource`, `referenceEcg`, and `adaptedEcg` artifacts when available.

## Deliverables

- Add tests for TMP matrices, ECG/lead matrices, BSPM maps, filtering outputs, and exports.
- Add clear per-area tolerances and failure diagnostics.
- Keep large artifacts out of git unless intentionally curated.

## Verification

- Harness fails on known injected differences.
- Test runtime remains acceptable for normal development.
- Promoted fixture manifests pass before numerical tests consume them:

```powershell
python tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>
```

## Done When

Scientific regressions are caught before UI or packaging work ships.

## Progress Note

Partially implemented by adding reusable numerical sequence comparison helpers with absolute/relative tolerances and diagnostic failure messages, plus tests that prove injected differences fail and current surface-potential/TMP fixtures match parsed source samples. Task `0048` now provides promoted `normal-male-ecgsim301` fixtures for legacy `.adaptECG`, `.refECG`, and `.user.source`; remaining harness work should turn those fixtures into scenario-level parity assertions.

Added `tools/compare_export_directories.py` as a raw-export comparison path. It compares matching files from a captured legacy export directory and the modern supported export subset, reports missing relative paths, shape differences, and numerical mismatches, and can generate the modern export from a case file. Synthetic tests cover pass, value mismatch, and missing-file diagnostics. The normal male ECGSIM 3.0.1 export is now captured and promoted; full parity still requires scenario-level assertions and may require additional case/workflow captures.

## Capture Handoff

Use the full readiness gate before expanding raw-export numerical scenarios:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --require-task 0053 --format markdown --output research/legacy-exports/<case-name>-0053-handoff.md
```

Promote all currently tracked raw numerical artifacts for the harness:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name>
```
