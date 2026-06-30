# 0051 Wire Recompute Pipeline Into Viewer

## Objective

Recompute TMP, ECG, BSPM, and lead displays after source edits.

## Minimal Context

Core helpers exist for TMP previews, transfer application, and filtering, but the viewer does not recompute ECG after edits.

## Inputs

- Tasks `0047`, `0049`, `0050`.
- `ecgsim/core/transfer.py`
- `ecgsim/core/filtering.py`
- `app/viewer/`

## Deliverables

- Add recompute pipeline from adapted source parameters to displayed outputs.
- Update Heart/Thorax/TMP/Leads views after edits.
- Show recomputation status and errors.

## Verification

- App tests verify edits change relevant ECG/BSPM views.
- Numerical tests compare recomputed values to parity fixtures.

## Done When

Source edits produce scientifically meaningful downstream output changes.

## Blocker Note

Blocked after task `0050`. TMP preview traces update after edits, but ECG/BSPM/lead recomputation should not be enabled until task `0049` has parity-tested TMP/source output and source-to-thorax/lead transfer matrices are parsed with confirmed roles. See `docs/feature-parity/recompute-pipeline-notes.md`.
