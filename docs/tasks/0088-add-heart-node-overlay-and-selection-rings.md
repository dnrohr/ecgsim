# 0088 Add Heart Node Overlay And Selection Rings

## Objective

Make Heart node selection visually inspectable, not only text/status-driven.

## Minimal Context

The Heart view already supports node selection, radius, transition zones, and selected-region data. The visual surface needs explicit overlays so users can see node locations and the approximate selected area while validating source edits.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add a Heart node-dot overlay toggle.
- Add a Heart selection-ring overlay toggle for selected radius and transition zone.
- Keep overlays optional so they do not obscure surface maps by default.
- Add app workflow checks that overlays visibly change the Heart canvas.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Heart node locations and the selected zone can be made visible from the app, and tests verify the overlay controls affect the rendered canvas.

## Completion Notes

Status: complete.

- Added optional Heart node-dot and selection-ring overlay controls.
- Rendered parsed heart nodes plus selected radius and transition rings in the Heart WebGL scene.
- Hardened compact selection-control overflow so Heart controls remain clickable beside the Thorax pane.
- Added app workflow assertions that node dots and rings visibly change the Heart canvas.
