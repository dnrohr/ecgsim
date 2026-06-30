# Wall Mapping Notes

Status: task `0045` parity notes for endocardial/epicardial and transmural workflows.

## Current Capability

- Case metadata exports a `wallMapping` capability object.
- The bundled cases mark endocardial/epicardial switching and transmural selection as unavailable.
- The Heart pane disables those controls from case metadata and exposes the case-specific reason in each control title.

## Why Unavailable

The legacy Heart pane can switch a selected node to the corresponding node on the other wall and can treat a selection as transmural. The modern parser currently recognizes `PGraphGeometry` markers but does not confirm their matrix semantics as wall-side pairings. `docs/source-editing-model.md` requires explicit paired node IDs for transmural edits, so the app must not infer pairings from geometric proximity.

## Enablement Criteria

Enable these controls only after supported cases provide a stable mapping structure with:

- endocardial and epicardial source-node groups,
- explicit paired node IDs,
- a deterministic transmural edit expansion rule,
- parser/export regression tests proving the pairings are stable for each supported case.
