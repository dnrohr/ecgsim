# Thorax View Notes

Status: task `0038` parity notes for the modern Thorax pane.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Thorax scale control.
- Thorax, left-lung, and right-lung visibility toggles.
- Thorax node click selection with selected-node marker and status text.
- Geometry surface mode with explicit placeholders for BSPM and sensitivity maps.
- Selected lead-system electrode markers can be shown on the Thorax view.
- Lock-to-heart controls are visible but disabled when required orientation-link data is unavailable.

## Current Limitations

- Electrode markers use parsed lead-system positions and nearest thorax nodes; exact legacy patch geometry remains future parity work.
- Measured, initial, and adapted BSPM maps are unavailable until surface potential matrices and the shared time cursor are parsed and wired.
- Sensitivity maps remain unavailable until heart probe mode, thorax selection, and transfer/sensitivity data are connected.
- Lock-to-heart orientation, linked movie playback, isofunction display, keyboard time stepping, and clipboard export remain future parity work.
- Scale currently changes the geometry view size; legacy potential amplitude scaling will be added with map rendering.
