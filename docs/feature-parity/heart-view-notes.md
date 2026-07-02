# Heart View Notes

Status: updated through task `0073`.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Node click selection and radius-based selected-region display.
- Single and expand selection modes with explicit transition-zone weights.
- Surface preview modes for geometry, depolarization, repolarization, ARI, TMP-at-time, amplitude, and resting potential.
- Thorax contribution surface mode driven by the selected Thorax node.
- Contour overlay toggle for scalar Heart surfaces.
- Optional node, selection-ring, parsed-electrode, and computed heart-vector overlays.
- Movable cross-section clipping-plane prototype.
- Initial/adapted value switching for supported source-parameter previews.
- TMP-at-time coloring follows the shared time cursor and current adapted TMP edit state.
- Case-driven unavailable states for endocardial/epicardial and transmural controls.

## Current Limitations

- Surface coloring is a source-parameter preview mapped by source-node index; exact legacy heart surface-function interpolation remains future parity work.
- Contours are node-marker overlays near scalar levels rather than interpolated triangle isolines.
- Atria/ventricles switching is not exposed yet even though source containers are parsed.
- Endocardial/epicardial switching and transmural handling are disabled per case until explicit wall pairings are parsed. See `docs/feature-parity/wall-mapping-notes.md`.
- Electrode-target probe shortcuts, legacy named-region accumulation variants, movie playback, and clipboard export remain unsupported until their roadmap tasks.
- Heart vector display is a modern-equivalent computed TMP-centroid preview; exact legacy vector-equation parity remains blocked on reference capture.
- Contribution maps use the selected Thorax node's transfer row from the current ventricles-to-thorax candidate; confirmed legacy lead-transfer roles remain unresolved.
- Color scales are automatic and use a legacy-informed sequential palette; exact palette stops and user-configurable scales remain future work.
