# Thorax View Notes

Status: updated through task `0073`.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Thorax scale control.
- Thorax, left-lung, and right-lung visibility toggles.
- Thorax node click selection with selected-node marker and status text.
- Selected Thorax nodes can drive Heart contribution maps.
- Geometry, measured BSPM, initial BSPM, adapted BSPM, and sensitivity-map modes.
- Contour overlay and line-only isofunction toggles for scalar Thorax maps.
- Selected lead-system electrode markers can be shown on the Thorax view.
- Lock-to-heart orientation links Thorax orientation to Heart orientation and AP reset while enabled.

## Current Limitations

- Electrode markers use parsed lead-system positions and nearest thorax nodes; exact legacy patch geometry remains future parity work.
- Initial and adapted BSPM maps are recomputed from TMP source parameters through the ventricles-to-thorax transfer candidate when dimensions match.
- Sensitivity maps display the selected heart/source node's transfer column on the thorax. This is useful for inspection, but transfer-role and WCT/reference parity still need stronger legacy evidence.
- Linked movie playback, keyboard time stepping, and clipboard export remain future parity work.
- Lock-to-heart uses the current explicit Heart orientation state; exact legacy drag-rotation behavior remains future interaction polish.
- Contours and line-only mode are scalar-node overlays rather than exact legacy interpolated isofunction lines.
- Electrode-marker click/probe shortcuts and confirmed lead-transfer contribution roles remain future work.
- Scale currently changes the geometry view size; legacy potential amplitude scaling will be added with map rendering.
