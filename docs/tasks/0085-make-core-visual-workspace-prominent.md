# 0085 Make Core Visual Workspace Prominent

## Objective

Make the default app view clearly show Heart, Thorax, TMP, and Leads visualizations without making users scroll past metadata or dense control rows.

## Minimal Context

The app currently mounts the Heart canvas, but the first viewport is dominated by title/menu/toolbar/case metadata/pane controls. Users can reasonably think the heart is missing.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/styles.css`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Compact top metadata and pane chrome so canvases are immediately visible on the default desktop viewport.
- Preserve all existing controls and labels.
- Add browser assertions that the Heart and Thorax canvases occupy visible first-viewport space and are not pushed below the fold.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- Visual regression smoke remains passing.

## Done When

A user opening the app can immediately see the Heart and Thorax visualizations and recognize the four visual panes.

## Completion Notes

Status: complete.

- Compacted top chrome, case metadata, pane padding, and pane gaps so visual canvases are prominent on launch.
- Changed dense TMP/Focus/Leads control rows to horizontal desktop scrollers so controls remain available without pushing canvases below the fold.
- Added browser workflow assertions that Heart and Thorax canvases start in the upper half of the first viewport and that Heart, Thorax, TMP, and Leads canvases are all visible at launch.
