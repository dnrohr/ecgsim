# Wall Mapping Notes

Status: task `0045` parity notes, updated by task `0104` with parser evidence.

## Current Capability

- Case metadata exports a `wallMapping` capability object.
- The bundled cases mark endocardial/epicardial switching and transmural selection as unavailable.
- The Heart pane disables those controls from case metadata and exposes the case-specific reason in each control title.
- `read_ecgsimcase_graph_geometries` inventories `PGraphGeometry` envelopes for archived cases.
- `research/pgraphgeometry-inventory.json` records the repeatable two-block pattern: one empty graph-like payload and one source-node-sized payload.

## Why Unavailable

The legacy Heart pane can switch a selected node to the corresponding node on the other wall and can treat a selection as transmural. The modern parser now records `PGraphGeometry` payload boundaries and header values, but does not confirm the record layout as wall-side pairings. `docs/source-editing-model.md` requires explicit paired node IDs for transmural edits, so the app must not infer pairings from geometric proximity.

The current evidence shows:

- archived cases contain two `PGraphGeometry` payloads;
- the first payload has candidate node count `0` and 20 payload bytes;
- the second payload candidate count matches the case source-node scale: `576` for `normal_male2` and `697` for the WPW cases;
- no nested `PMatrix` payload markers appear inside these graph envelopes.

## Enablement Criteria

Enable these controls only after supported cases provide a stable mapping structure with:

- endocardial and epicardial source-node groups,
- explicit paired node IDs,
- a deterministic transmural edit expansion rule,
- parser/export regression tests proving the pairings are stable for each supported case.
