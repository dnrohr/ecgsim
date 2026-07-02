# 0072 Implement Isofunction Contours And Colormap Parity

## Objective

Improve map visualization with isofunction contours and legacy-informed color scaling.

## Minimal Context

Current maps render useful color surfaces, but legacy-like contour and colormap semantics are not fully implemented.

## Inputs

- `app/viewer/src/`
- `docs/feature-parity/golden-workflows.md`
- Legacy screenshots under `research/legacy-exports/`

## Deliverables

- Add contour/isoline rendering where maps support scalar fields.
- Document color scale choices and any legacy mismatch.
- Keep rendering performant for normal cases.

## Verification

- Browser visual/state tests confirm contours toggle and maps remain nonblank.
- Performance smoke remains acceptable.

## Done When

Scalar maps are easier to inspect and legacy visual differences are documented rather than accidental.

## Completion Notes

Status: complete.

- Added shared sequential/diverging colormap helpers for Heart and Thorax scalar maps.
- Added Heart and Thorax Contours toggles that overlay scalar-node contour markers near evenly spaced levels.
- Browser workflow tests verify contour toggles visibly alter Heart and Thorax scalar maps while canvases remain nonblank.
- Documented that contours are node overlays, not exact interpolated legacy isofunction lines, and that user-configurable scale preferences remain future work.
