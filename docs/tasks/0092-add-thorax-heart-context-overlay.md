# 0092 Add Thorax Heart Context Overlay

## Objective

Show the parsed Heart mesh inside the Thorax pane as an optional context layer.

## Minimal Context

The legacy Thorax geometry view displays thorax geometry with heart and lungs. The modern app already renders thorax/lung meshes and the Heart pane separately, but the Thorax pane needs an embedded heart context overlay for visual parity.

## Inputs

- `docs/feature-parity/inventory.md`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add a Thorax heart-context layer control.
- Render the parsed Heart mesh in Thorax case coordinates.
- Preserve existing thorax/lung/electrode controls.
- Add workflow coverage that the context layer visibly changes the Thorax canvas.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

The Thorax pane can show or hide the Heart context mesh, and automated tests verify the overlay changes the rendered view.

## Completion Notes

Status: complete.

- Added a Thorax `Heart` layer toggle beside the existing thorax/lung layer controls.
- Rendered the parsed Heart mesh in the Thorax case coordinate frame as a through-shell context overlay.
- Added app workflow assertions that the Heart context layer toggles and visibly changes the Thorax canvas.
