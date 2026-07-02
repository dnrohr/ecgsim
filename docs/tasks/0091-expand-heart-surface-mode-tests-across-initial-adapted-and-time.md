# 0091 Expand Heart Surface Mode Tests Across Initial Adapted And Time

## Objective

Strengthen automated evidence for Heart surface visual modes across initial/adapted source states and linked time.

## Minimal Context

Heart surface modes already exist, but current workflow coverage samples only a subset. Visualization parity needs every supported Heart scalar surface mode to be discoverable, data-backed, mode-labeled, and visibly responsive to its main controls.

## Inputs

- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`
- `docs/feature-parity/visual-test-coverage.md`

## Deliverables

- Expand app workflow coverage for Depolarization, Repolarization, ARI, Amplitude, Resting potential, and TMP-at-time.
- Verify initial/adapted selector behavior for scalar source-parameter modes.
- Preserve existing contour and linked-time coverage.
- Update the visualization matrix and test-coverage map.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Heart surface modes have direct workflow evidence for labels, provenance, initial/adapted switching, and time-linked redraw where applicable.

## Completion Notes

Status: complete.

- Expanded app workflow coverage across Depolarization, Repolarization, ARI, Amplitude, and Resting potential.
- Verified each scalar mode updates labels/provenance and redraws when switching between adapted and initial source values.
- Preserved TMP-at-time linked-cursor coverage and Heart contour smoke coverage.
