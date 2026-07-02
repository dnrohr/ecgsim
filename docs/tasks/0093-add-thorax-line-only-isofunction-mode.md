# 0093 Add Thorax Line Only Isofunction Mode

## Objective

Add a Thorax line-only isofunction mode for scalar body-surface maps.

## Minimal Context

Legacy ECGSIM preferences can show isofunction lines without the full potential colormap. The modern app already has contour markers for scalar Thorax maps; this task adds a discoverable line-only mode while preserving the filled colormap mode.

## Inputs

- `docs/feature-parity/inventory.md`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/surface-potential-map-notes.md`

## Deliverables

- Add a Thorax line-only/isofunction control.
- Make line-only mode available for measured, initial, adapted, and sensitivity maps.
- Keep geometry mode behavior unchanged.
- Add workflow coverage that line-only mode changes the Thorax canvas and mode status.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Thorax scalar maps can be shown in filled or line-only contour-focused mode, and tests verify the mode is visible and functional.

## Completion Notes

Status: complete.

- Added a Thorax `Lines only` control for measured, initial, adapted, and sensitivity scalar maps.
- Line-only mode keeps contours visible while rendering the thorax surface in a neutral low-opacity style.
- Added app workflow assertions that line-only mode enables for scalar maps, updates status, and changes the Thorax canvas.
- Exact interpolated legacy isofunction-line geometry remains a later reference-capture/polish concern.
