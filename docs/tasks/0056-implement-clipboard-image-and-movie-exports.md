# 0056 Implement Clipboard Image And Movie Exports

## Objective

Implement high-value visual export workflows.

## Minimal Context

Legacy ECGSIM supports clipboard/image/movie workflows. Modern app currently has no visual export tools.

## Inputs

- `docs/feature-parity/inventory.md`
- Manual pages for clipboard/movie/export behavior.
- Current canvas/WebGL views.

## Deliverables

- Add image export for key views.
- Add clipboard copy where browser/desktop environment permits.
- Add movie/frame export for time-dependent maps if available.

## Verification

- App tests verify export buttons produce files or clipboard data where feasible.
- Visual export dimensions and content are documented.

## Done When

Users can capture modern app outputs for reports and teaching workflows.

## Progress

Completed the first high-value visual export slice.

- Added PNG download controls for Heart, Thorax, TMP, and Leads canvases.
- Added clipboard copy controls for those same panes when the browser supports image clipboard writes.
- Captures use the current visible canvas state, including view controls, time cursor state, and selected overlays.
- Added browser workflow tests that download all four PNGs and verify signature, dimensions, and file size.
- Documented clipboard limitations and deferred movie export in `docs/feature-parity/visual-export-notes.md`.

Movie export remains deferred until frame sequencing and legacy behavior are confirmed.
