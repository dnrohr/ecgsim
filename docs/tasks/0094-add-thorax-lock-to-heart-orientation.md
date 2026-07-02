# 0094 Add Thorax Lock To Heart Orientation

## Objective

Link Thorax orientation to the Heart view when the Thorax `Lock` control is enabled.

## Minimal Context

The legacy Thorax manual says lock-to-heart links Heart and Thorax orientation/rotation, and resetting either pane restores both. The modern app already has AP reset and auto-rotation controls; this task adds a shared orientation state for the existing controls.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/thorax.txt`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Enable the Thorax `Lock` control.
- When locked, make Thorax orientation follow Heart orientation updates.
- Stop independent Thorax auto-rotation while locked.
- Add workflow coverage for enabling lock and linked AP reset behavior.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

The Thorax view has a working lock-to-heart mode covered by workflow tests.

## Completion Notes

Status: complete.

- Enabled the Thorax `Lock` control.
- Added shared orientation state so Thorax follows Heart orientation while locked.
- Locked mode stops independent Thorax auto-rotation and makes Thorax AP reset restore the linked Heart orientation as well.
- Added app workflow assertions for lock, follow-rotation redraw, locked AP reset, and unlock.
