# Heart View Notes

Status: task `0037` parity notes for the modern Heart pane.

## Supported In Current Viewer

- AP orientation reset.
- Auto-rotation toggle.
- Node click selection and radius-based selected-region display.
- Surface preview modes for geometry, depolarization, repolarization, amplitude, and resting potential.
- Initial/adapted value switching for supported source-parameter previews.

## Current Limitations

- Surface coloring is a source-parameter preview mapped by source-node index; exact legacy heart surface-function interpolation remains future parity work.
- Atria/ventricles switching is not exposed yet even though source containers are parsed.
- Endocardial/epicardial switching and transmural handling are visible only as disabled controls.
- Cross-plane clipping, probe mode, foci editing, contribution maps, heart vector display, electrode visibility, movie playback, and clipboard export remain unsupported until their roadmap tasks.
- Color scales are automatic and not yet user-configurable.
