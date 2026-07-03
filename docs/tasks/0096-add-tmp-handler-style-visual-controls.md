# 0096 Add TMP Handler Style Visual Controls

## Objective

Add handler-style visual markers to the TMP plot for selected-node source parameters.

## Minimal Context

Legacy ECGSIM exposes TMP parameter handlers visually on the waveform. The modern app already has numeric source-parameter editing; this task adds a visual overlay that makes the selected node's key TMP parameters easier to inspect without replacing the exact numeric workflow.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/tmp-view-notes.md`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add a TMP handler overlay toggle.
- Draw selected-node depolarization, repolarization, resting-potential, and amplitude markers on the TMP plot.
- Keep numeric controls as the authoritative editing path.
- Add workflow coverage that handlers appear after selecting a Heart node and visibly change the TMP canvas.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

TMP handler-style markers are discoverable, selected-node aware, and covered by app workflow tests.

## Completion Notes

Status: complete.

- Added a TMP `Handlers` overlay toggle.
- Draws selected-node depolarization/repolarization timing lines plus resting/amplitude handle points on the TMP plot.
- Kept numeric controls as the exact editing mechanism while adding visual handler-style inspection.
- Added app workflow assertions that handlers appear after Heart selection and visibly change the TMP canvas.
