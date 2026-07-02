# 0089 Add Heart Cross Section Plane Prototype

## Objective

Add a prototype Heart cross-section plane so users can inspect a cut through the myocardium.

## Minimal Context

The legacy manual documents a cross-plane interaction using Shift plus mouse wheel or arrow keys. The exact clipping behavior and plane orientation still need curated reference capture, so this task implements a discoverable modern prototype rather than claiming exact parity.

## Inputs

- `docs/feature-parity/inventory.md`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add Heart cross-section controls.
- Clip the Heart mesh with a movable plane when enabled.
- Keep the control discoverable but clearly scoped as a modern prototype.
- Add workflow coverage showing the control changes the Heart canvas.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

The Heart view can show a movable cross-section cut, and automated tests verify the canvas changes when the cut is enabled and moved.

## Completion Notes

Status: complete.

- Added Heart `Cut` and `Plane` controls for a movable clipping-plane prototype.
- Enabled WebGL local clipping for the Heart mesh while preserving existing surface-color modes.
- Added app workflow assertions that the cut enables the plane slider, changes the canvas, and redraws when moved.
- Kept exact legacy Shift+wheel/arrow parity as a reference-capture follow-up.
