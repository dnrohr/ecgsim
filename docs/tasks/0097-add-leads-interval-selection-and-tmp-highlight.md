# 0097 Add Leads Interval Selection And TMP Highlight

## Objective

Add a shared interval highlight between Leads and TMP plots.

## Minimal Context

Legacy workflows use the ECG/TMP time axis as a linked visual reference. The modern app already has a shared time cursor; this task adds a selectable interval so users can inspect a time window across ECG traces and TMP waveforms.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/leads-view-notes.md`
- `docs/feature-parity/tmp-view-notes.md`

## Deliverables

- Add Leads interval controls.
- Draw the selected interval on Leads and TMP canvases.
- Keep interval bounds clamped to the current shared sample range.
- Add workflow coverage that interval changes both canvases.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

A user can highlight an ECG interval and see the same interval on TMP and Leads views, with automated visual-smoke coverage.

## Completion Notes

Status: complete.

- Added Leads interval enable/start/end controls.
- Draws the selected interval on both Leads and TMP canvases using shared sample bounds.
- Added app workflow assertions that interval selection redraws both canvases.
