# 0090 Add Heart Electrode And Vector Overlays

## Objective

Add Heart-pane overlays for selected lead-system electrodes and a time-linked heart-vector path.

## Minimal Context

The legacy manual says the Heart pane can show selected lead-system electrodes as grey patches and can show a heart-vector path plus the current-time arrow. Parsed electrode positions exist in current case metadata. Exact legacy heart-vector equations are not yet confirmed, so the modern overlay should be labeled as a computed vector preview.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/heart.txt`
- `research/extracted-text/www.ecgsim.org/manual/thorax.txt`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add Heart electrode overlay controls for the active lead system.
- Add a Heart vector overlay showing a path and current-time arrow.
- Use parsed electrodes and computed TMP-at-time vector data, with visible provenance/status.
- Add workflow coverage that overlays visibly affect the Heart canvas and follow time/lead-system changes.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Heart electrodes and heart-vector overlays are discoverable, data-backed, and covered by visual-smoke workflow tests.

## Completion Notes

Status: complete.

- Added Heart `Electrodes` overlay using parsed lead-system electrode positions from current case metadata.
- Added Heart `Vector` overlay as a computed TMP-at-time centroid path plus current-time arrow.
- Synced Heart electrode overlay with lead-system changes and Heart vector overlay with shared time/TMP edits.
- Added app workflow assertions for electrode counts, lead-system updates, vector display, and time-linked vector redraw.
- Documented the heart vector as a modern-equivalent preview because the exact legacy vector equation remains uncaptured.
