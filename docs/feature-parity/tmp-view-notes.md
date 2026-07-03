# TMP View Notes

Status: task `0049` TMP generation parity notes for the modern TMP pane.

## Supported In Current Viewer

- Initial and adapted TMP trace visibility toggles.
- Grid visibility toggle.
- Selected-node handler overlay for depolarization/repolarization timing plus resting/amplitude markers.
- Shared Leads beat zoom window for TMP traces, cursor, interval highlight, axis labels, and click-to-time mapping.
- Parameter selector for the six editable TMP parameters currently modeled.
- Numeric adapted-value editing for the active heart selection.
- Handler-style increment and decrement buttons using each parameter's configured step.
- Reset selected parameter and reset beat actions.
- Parameter status text showing initial value, adapted value, unit, and selected-node count.
- Stored-only depolarization slope remains listed as disabled.
- TMP traces use the legacy-calibrated generator from task `0049`; Python and browser implementations are kept in sync and generated viewer fixtures have been refreshed.

## Current Limitations

- TMP generation is parity-tested against the captured normal male ECGSIM 3.0.1 `.user.source` export. Additional cases and edited-source exports are still needed before claiming broad TMP parity.
- Exact triangular drag handlers are represented by numeric/step controls plus visual selected-node handler markers for now.
- Combined resting/amplitude handlers, keep-constant-APD mode, and electrogram display are visible but disabled until edit semantics and data are available.
- Selected-node electrogram display is blocked until an electrogram payload or derivation equation is identified; the disabled EGM control names that blocker.
- Time bar, interval highlight, beat zoom, and linked playback are supported; clipboard copy remains deferred to shared view/export tasks.
- Reset beat currently applies to the active fixture edit state, not yet to a parsed multi-source or multi-beat case scope.
