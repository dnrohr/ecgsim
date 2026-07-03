# 0116 Classify Source Square Matrix Evidence For EGM

Status: complete.

## Goal

Narrow the selected-node electrogram blocker by classifying source-square `PMatrix` payloads and identifying whether any candidate could support a computed Heart-surface electrogram.

## Context

Task `0113` proved that bundled `.ECGsimcase` files do not contain a stored source-node-by-time electrogram matrix. The same cases do contain seven source-square matrices. `readECGsim.m` names source-to-source transfer matrices such as `DATA.VENTR.VENTRICLES`, so one of these matrices may be the missing computation path for selected-node EGM.

## Changes

- Added `tools/inspect_source_square_matrices.py`.
- Generated `research/source-square-matrix-evidence.json` for all supported case files.
- Added compact source-square transfer-candidate evidence to viewer case metadata.
- Updated EGM disabled-state text to name the remaining requirement: confirm the source-to-source transfer role and validate selected-node EGM output against legacy ECGSIM.
- Added regression and smoke assertions for the candidate evidence.

## Findings

Across all supported cases:

- `7` source-square matrices are present.
- `6` classify as sparse/dense nonnegative graph or distance candidates.
- Matrix index `27` classifies as a dense signed source-to-source transfer candidate.
- The candidate is not enough to enable EGM yet because its exact `VENTR.VENTRICLES` role and selected-node output have not been validated against legacy ECGSIM.

## Verification

Run:

```powershell
python tools/inspect_source_square_matrices.py research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase --output research/source-square-matrix-evidence.json
python tools/export_viewer_fixtures.py
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
