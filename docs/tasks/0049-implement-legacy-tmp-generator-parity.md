# 0049 Implement Legacy TMP Generator Parity

## Objective

Replace or refine provisional TMP generation to match legacy output.

## Minimal Context

Current TMP generation is deterministic but not parity-verified against legacy `.user.source` exports.

## Inputs

- Validated raw legacy TMP/source exports from task `0048`.
- Promoted `tmpSource` fixtures under `tests/fixtures/legacy-parity/<case-name>/`, created with `tools/promote_legacy_parity_fixtures.py`.
- `ecgsim/core/tmp.py`
- `docs/simulation.md`
- `docs/parity.md`

## Deliverables

- Implement TMP generator matching legacy references within tolerance.
- Document equation/source attribution and residual differences.
- Update viewer/browser generator to match or consume generated data from core.

## Verification

- Tests compare generated TMP matrices to legacy exports.
- Existing TMP edit tests pass.
- Promoted fixture manifests pass:

```powershell
python tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>
```

## Done When

TMP generation is a parity-tested scientific function, not a preview approximation.

## Capture Handoff

Do not start parity claims from the ignored raw export directory directly. First validate the capture for this task:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --require-task 0049 --format markdown --output research/legacy-exports/<case-name>-0049-handoff.md
```

Then promote only the TMP source artifact needed for tests:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name> --artifact tmpSource
```
