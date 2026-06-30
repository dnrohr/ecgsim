# Shell Visual Notes

Status: task `0036` comparison notes against `research/legacy-exports/screenshots/normal-male-main-window.png`.

## Matched Concepts

- The app now presents a top application title, menu strip, toolbar, case summary, four primary panes, and bottom status bar.
- Menu labels mirror the legacy top-level groups: File, Edit, Heart, Thorax, ECGs, Options, Help.
- The primary workspace keeps the recognizable Heart, Thorax, TMP, and ECGs/Leads quadrants.
- Supported case opening remains in the toolbar, and status messages are shown in a persistent status bar.

## Remaining Differences

- The toolbar uses compact text and form controls rather than the legacy icon bitmap set.
- Pane resizing/splitters are not implemented yet.
- Per-pane menus and most legacy toolbar commands are not active until the corresponding feature-parity tasks implement them.
- The modern app keeps the case metadata summary visible; the legacy app instead relies more heavily on title/menu/toolbar state.
- Color maps, contour legends, ECG grid density, and exact pane proportions remain view-parity work for later FP2 tasks.
