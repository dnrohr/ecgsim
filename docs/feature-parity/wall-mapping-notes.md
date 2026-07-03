# Wall Mapping Notes

Status: task `0045` parity notes, updated by tasks `0104` and `0105` with parser evidence.

## Current Capability

- Case metadata exports a `wallMapping` capability object.
- The bundled cases mark endocardial/epicardial switching and transmural selection as unavailable.
- The Heart pane disables those controls from case metadata and exposes the case-specific reason in each control title.
- `read_ecgsimcase_graph_geometries` parses `PGraphGeometry` source meshes for archived cases.
- `load_case()` exposes the parsed graph geometries on the normalized case object.
- `research/pgraphgeometry-inventory.json` records the repeatable two-block pattern: one empty mesh and one source-node mesh.

## Why Unavailable

The legacy Heart pane can switch a selected node to the corresponding node on the other wall and can treat a selection as transmural. The modern parser now decodes `PGraphGeometry` as a source mesh with float32 XYZ points and int32 triangle indices, but this does not confirm any record layout for wall-side pairings. `docs/source-editing-model.md` requires explicit paired node IDs for transmural edits, so the app must not infer pairings from geometric proximity.

The current evidence shows:

- archived cases contain two `PGraphGeometry` payloads;
- the first payload is an empty mesh;
- the second payload matches the case source-node scale: `576` points and `1148` triangles for `normal_male2`, and `697` points and `1394` triangles for the WPW cases;
- no nested `PMatrix` payload markers appear inside these graph mesh payloads.

## Enablement Criteria

Enable these controls only after supported cases provide a stable mapping structure with:

- endocardial and epicardial source-node groups,
- explicit paired node IDs,
- a deterministic transmural edit expansion rule,
- parser/export regression tests proving the pairings are stable for each supported case.
