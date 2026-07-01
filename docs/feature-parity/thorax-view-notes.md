# Thorax View Notes

Status: task `0038` parity notes for the modern Thorax pane.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Thorax scale control.
- Thorax, left-lung, and right-lung visibility toggles.
- Thorax node click selection with selected-node marker and status text.
- Geometry, measured BSPM, initial BSPM, adapted BSPM, and sensitivity-map modes.
- Selected lead-system electrode markers can be shown on the Thorax view.
- Lock-to-heart controls are visible but disabled when required orientation-link data is unavailable.

## Current Limitations

- Electrode markers use parsed lead-system positions and nearest thorax nodes; exact legacy patch geometry remains future parity work.
- Initial and adapted BSPM maps are recomputed from TMP source parameters through the ventricles-to-thorax transfer candidate when dimensions match.
- Sensitivity maps display the selected heart/source node's transfer column on the thorax. This is useful for inspection, but transfer-role and WCT/reference parity still need stronger legacy evidence.
- Lock-to-heart orientation, linked movie playback, isofunction display, keyboard time stepping, and clipboard export remain future parity work.
- Scale currently changes the geometry view size; legacy potential amplitude scaling will be added with map rendering.
