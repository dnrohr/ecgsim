# Time Cursor Notes

Status: updated through task `0071`.

## Supported In Current Viewer

- Shared sample/time cursor initialized from the common TMP and ECG sample window.
- Toolbar range, -2 ms, +2 ms, and play/pause controls.
- Yellow cursor line rendered in both Leads and TMP plots.
- Clicking Leads or TMP plots moves the shared cursor.
- Left/right arrow stepping works when a waveform canvas has focus.
- Time status reports current milliseconds and available shared duration.
- Heart TMP-at-time coloring follows the shared cursor.
- Thorax measured, initial, and adapted BSPM modes follow the shared cursor when their data/recompute prerequisites are available.

## Current Limitations

- Playback currently advances the shared cursor, waveform markers, Heart TMP-at-time, and Thorax BSPM coloring; movie export remains future work.
- The shared duration uses the overlapping sample count between the TMP preview and ECG fixture.
- Beat zoom and interval highlighting remain future Leads/TMP parity work.
