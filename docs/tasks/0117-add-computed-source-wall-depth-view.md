# 0117 Add Computed Source Wall Depth View

Status: complete.

## Goal

Give the legacy endocardial/epicardial and transmural visualization mode a discoverable modern equivalent without claiming pixel-perfect or decoded legacy wall-pair parity.

## Context

Tasks `0104`, `0105`, `0111`, and `0115` proved that supported cases contain a parsed `PGraphGeometry` source mesh whose point count matches ventricular source nodes. The exact legacy endocardial/epicardial pairings and transmural grouping semantics remain undecoded, but the source mesh is sufficient for a computed wall-depth preview.

## Changes

- Added a normalized radial `computedWallDepth` scalar to exported source-mesh fixtures.
- Added a `Source wall depth` Heart surface mode and visual-mode navigator entry.
- Kept exact Endo/Epi and Transmural controls disabled until explicit legacy pair/group semantics are parsed.
- Updated visualization parity docs to mark the Heart wall/transmural row as `modern-equivalent`.
- Added regression, smoke, workflow, and visual-mode assertions for the computed wall-depth data and redraw.

## Evidence

For `normal_male2.ECGsimcase`, the computed wall-depth vector has `576` values, spans `0.0` to `1.0`, and covers the parsed `graphGeometry2` source mesh. The app labels the surface as computed source-mesh data so users can distinguish it from decoded legacy wall-pair semantics.

## Verification

Run:

```powershell
python tools/export_viewer_fixtures.py
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
