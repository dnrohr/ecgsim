# Activation And Focus Notes

Status: task `0050` parser/model notes.

## Supported In Current Code

- `PActivationConstruction` payloads are parsed as raw `int32,float32,float32` record tables.
- Case metadata fixtures expose per-source activation construction summaries and sample records.
- `ecgsim.core.fastest_route_activation_times` implements a tested first-arrival fastest-route solver for future graph/focus workflows.

## Current Interpretation

The activation table format is confirmed structurally for supported cases:

- normal ventricular source: 576 records,
- WPW ventricular sources: 697 records,
- atrial source in inspected cases: zero records.

The row fields are intentionally named `integer_field`, `float_field_1`, and `float_field_2` until legacy semantics are confirmed. The first normal ventricular row is `(-1, 13.60003, 0.8)`.

## Remaining Gaps

- `PGraphGeometry` semantics are still needed to map fastest-route edges to the source graph.
- Focus node IDs, opposite-wall behavior, and local/global velocity edits are not yet mapped to case fields.
- The web viewer does not expose the legacy foci edit dock yet; current hooks are parser/model/metadata hooks.
