# 0098 Add Beat Zoom Workflow

## Objective

Add a waveform beat-zoom workflow for Leads and TMP views.

## Minimal Context

Legacy ECGSIM lets users double-click the ECG view to zoom into a selected atrial or ventricular beat and double-click again to restore all beats. Current bundled viewer cases are represented as single-beat signal windows, so the modern equivalent should expose a sample-window zoom that uses the selected interval when available and parsed fiducial bounds otherwise.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/leads-view-notes.md`
- `docs/feature-parity/tmp-view-notes.md`

## Deliverables

- Add discoverable Leads controls for zooming into the active beat window and restoring all beats.
- Make Leads and TMP renderers use the same visible sample window.
- Keep time cursor, interval highlight, click-to-time mapping, and axis labels consistent with the zoomed window.
- Add workflow coverage that zoom and reset redraw both waveform canvases.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

A user can zoom the waveform views to a beat-scale sample window and restore the full signal span, with automated visual-smoke coverage.

## Completion Notes

Status: complete.

- Added `Zoom beat` and `All beats` controls plus legacy-style double-click toggling on the Leads canvas.
- Zoom uses the selected interval first, then parsed fiducial bounds, and falls back to the full signal when no narrower data-backed window exists.
- Leads and TMP traces, interval highlight, time cursor, axis labels, metadata, and canvas click mapping share the same zoom window.
- Added app workflow assertions for interval-backed zoom, fiducial-backed zoom, reset controls, and Leads/TMP canvas redraws.
