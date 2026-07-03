# 0115 Add Heart Source Mesh Overlay

Status: complete.

## Goal

Make the parsed `PGraphGeometry` source mesh visible in the Heart pane so wall-mapping-adjacent source topology has a discoverable modern visual equivalent, while keeping unsupported endocardial/epicardial and transmural semantics disabled.

## Context

Tasks `0104`, `0105`, and `0111` proved that supported cases contain a non-empty `PGraphGeometry` source mesh whose point count matches ventricular source-node count. That evidence was exported only as metadata, so users could not see the mesh in the app.

## Changes

- Added the non-empty `PGraphGeometry` source mesh to Heart viewer fixtures and supported case bundles.
- Added a Heart `Source mesh` overlay checkbox that draws source-node points and source-mesh edges.
- Added a visual mode navigator entry for `Heart source mesh`.
- Kept Endo/Epi and Transmural controls disabled because explicit wall pairings and transmural grouping semantics are still not decoded.
- Added smoke, regression, and browser workflow assertions for the fixture shape and visible canvas redraw.

## Evidence

For `normal_male2.ECGsimcase`, the source mesh overlay uses `graphGeometry2` with `576` source nodes and `1148` triangles. WPW bundles carry the same fixture field for their parsed source meshes.

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
