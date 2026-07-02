# Activation And Focus Notes

Status: updated through task `0070`.

## Supported In Current Code

- `PActivationConstruction` payloads are parsed as raw `int32,float32,float32` record tables.
- Case metadata fixtures expose per-source activation construction summaries and sample records.
- `ecgsim.core.fastest_route_activation_times` implements a tested first-arrival fastest-route solver for future graph/focus workflows.
- The web viewer exposes WPW ventricular activation records in the TMP pane Focus controls.
- For supported WPW bundles, the selected heart node can be copied into a focus preview and recomputed with editable start time and preview velocity.

## Current Interpretation

The activation table format is confirmed structurally for supported cases:

- normal ventricular source: 576 records,
- WPW ventricular sources: 697 records,
- atrial source in inspected cases: zero records.

The row fields are intentionally named `integer_field`, `float_field_1`, and `float_field_2` until legacy semantics are confirmed. The first normal ventricular row is `(-1, 13.60003, 0.8)`.

## Viewer Workflow

The Focus controls are intentionally conservative:

- `Activation` shows the ventricular activation record count for supported WPW bundles.
- `Use node` copies the selected heart node into the preview focus.
- `Focus`, `Start`, and `Velocity` update a deterministic `linear-index-preview` fastest-route calculation.
- `Opposite wall` and `Write raw fields` are disabled because wall-pair mapping and raw field semantics are not decoded.

The preview is useful for workflow and state validation. It is not a legacy numerical parity claim and does not write back to TMP/source parameters yet.

## Remaining Gaps

- `PGraphGeometry` semantics are still needed to map fastest-route edges to the source graph instead of the viewer's explicit preview graph.
- Focus node IDs, opposite-wall behavior, and local/global velocity edits are not yet mapped to raw case fields.
- Preview activation changes do not yet propagate into TMP, ECG, or BSPM recomputation.
