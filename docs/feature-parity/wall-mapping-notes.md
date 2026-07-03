# Wall Mapping Notes

Status: task `0045` parity notes, updated by tasks `0104`, `0105`, `0111`, and `0115` with parser and viewer evidence.

## Current Capability

- Case metadata exports a `wallMapping` capability object.
- The bundled cases mark endocardial/epicardial switching and transmural selection as unavailable.
- The Heart pane disables those controls from case metadata and exposes the case-specific reason in each control title.
- `read_ecgsimcase_graph_geometries` parses `PGraphGeometry` source meshes for archived cases.
- `load_case()` exposes the parsed graph geometries on the normalized case object.
- `research/pgraphgeometry-inventory.json` records the repeatable two-block pattern: one empty mesh and one source-node mesh.
- Viewer metadata exports source-mesh alignment evidence under `wallMapping`, including source-node count matching and nearest parsed-Heart-mesh distance summaries.
- The Heart pane can show the parsed source mesh as a toggleable overlay and through the visual mode navigator.

## Why Unavailable

The legacy Heart pane can switch a selected node to the corresponding node on the other wall and can treat a selection as transmural. The modern parser now decodes `PGraphGeometry` as a source mesh with float32 XYZ points and int32 triangle indices, but this does not confirm any record layout for wall-side pairings. `docs/source-editing-model.md` requires explicit paired node IDs for transmural edits, so the app must not infer pairings from geometric proximity.

The current evidence shows:

- archived cases contain two `PGraphGeometry` payloads;
- the first payload is an empty mesh;
- the second payload matches the case source-node scale: `576` points and `1148` triangles for `normal_male2`, and `697` points and `1394` triangles for the WPW cases;
- the source mesh point count matches the ventricular source-node count for all bundled cases;
- the source mesh is not an exact subset of the parsed Heart geometry: nearest-distance checks report `0` exact point matches for the normal and WPW bundles;
- no nested `PMatrix` payload markers appear inside these graph mesh payloads.

Task `0115` makes the non-empty source mesh visible in the Heart pane as source-node points and mesh edges. This improves visual inspection coverage for the source topology, but it deliberately keeps Endo/Epi, Transmural, and opposite-wall workflows disabled because no explicit pairing or transmural grouping records have been decoded.

## Enablement Criteria

Enable these controls only after supported cases provide a stable mapping structure with:

- endocardial and epicardial source-node groups,
- explicit paired node IDs,
- a deterministic transmural edit expansion rule,
- parser/export regression tests proving the pairings are stable for each supported case.
