# TMP View Notes

Status: task `0040` parity notes for the modern TMP pane.

## Supported In Current Viewer

- Initial and adapted TMP trace visibility toggles.
- Grid visibility toggle.
- Parameter selector for the six editable TMP parameters currently modeled.
- Numeric adapted-value editing for the active heart selection.
- Handler-style increment and decrement buttons using each parameter's configured step.
- Reset selected parameter and reset beat actions.
- Parameter status text showing initial value, adapted value, unit, and selected-node count.
- Stored-only depolarization slope remains listed as disabled.

## Current Limitations

- TMP waveforms are generated previews from source parameters; exact legacy TMP generation and slope semantics remain future parity work.
- Triangular drag handlers are represented by numeric and step controls for now.
- Combined resting/amplitude handlers, keep-constant-APD mode, and electrogram display are visible but disabled until edit semantics and data are available.
- Time bar, interval highlight, linked playback, and clipboard copy are deferred to shared time/export tasks.
- Reset beat currently applies to the active fixture edit state, not yet to a parsed multi-source or multi-beat case scope.
