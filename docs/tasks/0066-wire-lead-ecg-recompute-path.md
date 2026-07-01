# 0066 Wire Lead ECG Recompute Path

## Objective

Recompute lead ECG traces after source edits using available transfer/lead data.

## Minimal Context

Adapted Thorax BSPM recomputation exists for a shape-matched transfer candidate. Lead ECG recomputation remains incomplete and should use documented transfer and filtering assumptions.

## Inputs

- `ecgsim/core/transfer.py`
- `ecgsim/core/filtering.py`
- `app/viewer/src/recompute.js` or current recomputation code
- `tests/fixtures/legacy-parity/normal-male-ecgsim301/`
- `docs/parity.md`

## Deliverables

- Implement a lead ECG recompute path where data dimensions support it.
- Apply WCT/reference and filtering behavior consistently.
- Document unresolved lead transform assumptions.

## Verification

- Unit tests cover recomputed lead shapes and filtering.
- Browser/app test verifies edited TMP changes adapted ECG traces.
- Numerical parity test compares to legacy ECG exports only where the reference is truly comparable.

## Done When

Lead traces respond to source edits through the recomputation pipeline with documented evidence.
