# 0105 Parse PGraphGeometry Source Meshes

Status: complete.

## Goal

Decode the confirmed `PGraphGeometry` mesh layout and expose it through `load_case()` so visualization parity work can use the legacy source surface directly.

## Scope

- Parse `PGraphGeometry` as `version`, `scale`, `flag`, `point_count`, float32 XYZ points, `triangle_count`, and int32 triangle indices.
- Validate triangle indices against the parsed graph point count.
- Add graph geometries to the normalized `ECGsimCase` object.
- Update the graph-geometry inspection report and file-format notes.

## Out Of Scope

- Enabling endocardial/epicardial switching.
- Inferring opposite-wall node pairs.
- Treating this source mesh as proof of transmural edit semantics.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python -m unittest discover -s tests`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
- `python tools/inspect_graph_geometry.py research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase --output research/pgraphgeometry-inventory.json`
