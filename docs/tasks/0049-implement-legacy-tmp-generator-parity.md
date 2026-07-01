# 0049 Implement Legacy TMP Generator Parity

## Objective

Replace or refine provisional TMP generation to match legacy output.

## Minimal Context

Current TMP generation is legacy-calibrated and parity-tested against the promoted normal male ECGSIM 3.0.1 `.user.source` export.

Task `0048` promoted `tmpSource`, reference ECG, adapted ECG, and task `0049` added `tmpParameterVectors` for `normal-male-ecgsim301`, so the generator can be tested from exported source parameters to exported TMP samples.

## Inputs

- Validated raw legacy TMP/source exports from task `0048`.
- Promoted `tmpSource` and `tmpParameterVectors` fixtures under `tests/fixtures/legacy-parity/<case-name>/`, created with `tools/promote_legacy_parity_fixtures.py`.
- `ecgsim/core/tmp.py`
- `docs/simulation.md`
- `docs/parity.md`

## Completed

- Replaced the provisional preview curve with a legacy-calibrated generator in `ecgsim.core.tmp`.
- Mirrored the generator in `app/viewer/src/tmp-generation.js` and regenerated viewer TMP fixtures.
- Added `read_legacy_tmp_source_matrix()` for the row-major exported `.user.source` layout.
- Extended fixture promotion with `tmpParameterVectors` so parity tests are self-contained.
- Added a parity test comparing generated normal male TMP samples to the promoted legacy `.user.source` matrix with `max_error <= 1.8 mV` and `rms_error <= 0.52 mV`.

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

Then promote the TMP source artifact and parameter vectors needed for tests:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name> --artifact tmpSource --artifact tmpParameterVectors
```
