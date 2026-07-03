# 0111 Document Source Mesh Alignment Evidence

Status: complete.

## Goal

Make the Heart wall-mapping blocker sharper by exporting concrete `PGraphGeometry` source-mesh evidence instead of a generic unavailable reason.

## Context

Task `0105` decoded `PGraphGeometry` payloads as source meshes. The remaining parity question is whether those meshes also encode endocardial/epicardial pairs or transmural groups. A direct comparison showed the non-empty graph mesh matches the ventricular source-node count, but it is not an exact subset of the parsed Heart geometry.

## Changes

- `tools/export_viewer_fixtures.py` now exports structured `wallMapping` evidence:
  - source mesh parse status, ID, offset, point count, triangle count, and scale;
  - ventricular source-node count and source-node alignment flag;
  - nearest parsed-Heart-mesh distance summary in millimeters;
  - explicit required missing semantics for wall pairings and transmural grouping.
- Viewer fixtures were regenerated for the normal and WPW bundles.
- Regression, smoke, and browser workflow tests now assert that source meshes are parsed while Endo/Epi and Transmural controls remain disabled.
- Feature-parity docs now identify the remaining blocker as missing pair/group semantics, not missing source mesh parsing.

## Evidence

- `normal_male2.ECGsimcase`: parsed source mesh has `576` points and `1148` triangles, matching `576` ventricular source nodes. Its nearest parsed-Heart-mesh distance summary is min `0.166425` mm, mean `40.739383` mm, max `96.069332` mm, with `0` exact point matches.
- WPW bundles: parsed source mesh has `697` points and `1394` triangles, matching `697` ventricular source nodes. Its nearest parsed-Heart-mesh distance summary is min `0.201913` mm, mean `37.283103` mm, max `86.00431` mm, with `0` exact point matches.

## Out Of Scope

This task does not enable endocardial/epicardial switching or transmural edits. Those still require explicit paired node IDs or a confirmed transmural grouping rule.

## Verification

- `python -m unittest discover -s tests`
- `npm --prefix app/viewer test`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:visual-modes`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
