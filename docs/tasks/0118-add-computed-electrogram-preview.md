# 0118 Add Computed Electrogram Preview

Status: complete.

## Goal

Turn the TMP EGM blocker into a discoverable computed preview, while preserving the distinction between modern visual functionality and legacy-validated numerical parity.

## Context

Task `0113` proved that supported `.ECGsimcase` files do not contain a stored source-node-by-time electrogram matrix. Task `0116` found exactly one dense signed source-to-source transfer candidate, matrix index `27`, in each supported case. That is enough to provide a reasonable modern selected-node electrogram preview, but not enough to claim exact ECGSIM scale parity.

## Changes

- Exported the dense signed source-to-source transfer matrix into TMP fixtures as `computedElectrogram`.
- Marked case metadata EGM status as `computed-preview`.
- Enabled the TMP `EGM` checkbox when computed preview data is present.
- Drew computed EGM traces by applying the selected node transfer row to generated adapted TMP values at each sample.
- Updated workflow, smoke, regression, audit, and documentation expectations.

## Evidence

For `normal_male2.ECGsimcase`, the EGM preview uses transfer matrix index `27` with shape `576 x 576`. WPW bundles use the same classified matrix index with shape `697 x 697`.

The preview is intentionally labeled as computed and not legacy scale validated. Exact `VENTR.VENTRICLES` role confirmation and selected-node output-scale validation remain future numerical parity work.

## Verification

Run:

```powershell
python tools/export_viewer_fixtures.py
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
