# Thorax View Notes

Status: task `0038` parity notes for the modern Thorax pane.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Thorax scale control.
- Thorax, left-lung, and right-lung visibility toggles.
- Thorax node click selection with selected-node marker and status text.
- Geometry surface mode with explicit placeholders for BSPM and sensitivity maps.
- Electrode and lock-to-heart controls are visible but disabled when required data is unavailable.

## Current Limitations

- Electrode counts are parsed from lead-system metadata, but electrode coordinates are not yet present in the browser fixtures, so electrode patches cannot be rendered.
- Measured, initial, and adapted BSPM maps are unavailable until surface potential matrices and the shared time cursor are parsed and wired.
- Sensitivity maps remain unavailable until heart probe mode, thorax selection, and transfer/sensitivity data are connected.
- Lock-to-heart orientation, linked movie playback, isofunction display, keyboard time stepping, and clipboard export remain future parity work.
- Scale currently changes the geometry view size; legacy potential amplitude scaling will be added with map rendering.
