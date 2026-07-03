# Visual Test Coverage

Status: seeded by task `0084`.

This document maps visualization modes to current automated evidence. It tracks whether users can see and interact with a visual mode; numerical parity remains tracked separately.

## Current Automated Evidence

| Area | Visual mode or workflow | Current evidence | Coverage strength | Gap |
| --- | --- | --- | --- | --- |
| Workspace | Four-pane launch layout | `app/viewer/scripts/app-test.mjs` checks shell layout and task `0085` adds first-viewport canvas visibility assertions | strong for default layout | Does not yet test resizable panes |
| Workspace | Pane mode/provenance labels | App workflow checks launch badges and representative Heart/Thorax/TMP/Leads mode transitions; visual-mode smoke iterates Heart/Thorax labels | strong for Heart/Thorax | Leads/TMP per-mode matrix remains in app workflow |
| Workspace | Visual mode navigator | App workflow selects representative Heart, Thorax, TMP, and Leads destinations through toolbar navigator | medium | Does not yet enumerate every visual matrix row |
| Heart | Geometry render | App workflow and visual-mode smoke check nonblank WebGL canvas and metadata/status | strong smoke | No pane-level legacy screenshot comparison |
| Heart | Depolarization/repolarization | App workflow checks initial/adapted redraw; visual-mode smoke iterates status/mode labels and nonblank canvas | strong smoke | No exact legacy colormap or scale parity |
| Heart | ARI | App workflow checks initial/adapted redraw; visual-mode smoke checks status/mode labels and nonblank canvas | strong smoke | No legacy ARI reference scale |
| Heart | Amplitude/resting potential | App workflow checks initial/adapted redraw; visual-mode smoke iterates status/mode labels and nonblank canvas | strong smoke | No exact legacy colormap or scale parity |
| Heart | TMP at time | App workflow links time cursor and checks canvas changes; visual-mode smoke checks status/mode labels and nonblank canvas | strong smoke | No numeric sampled-color validation |
| Heart | Thorax contribution | App workflow targets a parsed thorax electrode and checks canvas change; visual-mode smoke checks status/provenance and nonblank canvas | strong smoke | Confirmed legacy lead-transfer roles still need reference capture |
| Heart | Selection radius/transition | App workflow selects nodes, checks selection text/weighted region, and verifies node/ring overlay canvas deltas | strong smoke | Exact legacy glyph and ring projection style unverified |
| Heart | Cross-section plane | App workflow enables Heart cut mode, moves the plane, and checks canvas deltas/status | medium | Exact legacy Shift+wheel/arrow behavior and plane orientation unverified |
| Heart | Electrode overlay | App workflow toggles Heart electrodes and verifies parsed lead-system count plus canvas delta | strong smoke | Exact legacy grey patch shape unverified |
| Heart | Heart vector | App workflow toggles computed TMP vector path and checks time-linked canvas redraw/status | medium | Exact legacy heart-vector equation unverified |
| Thorax | Geometry/heart/lung layers | App workflow checks overlays/layers; visual-mode smoke checks geometry status/mode label and nonblank canvas | strong smoke | Exact legacy transparency style unverified |
| Thorax | Electrodes | App workflow toggles parsed electrodes and checks canvas delta | strong smoke | Exact electrode glyph geometry unverified |
| Thorax | Measured BSPM | App workflow switches measured map/time/contours/scale; visual-mode smoke checks status/mode label and nonblank canvas | strong smoke | No legacy map color/line parity |
| Thorax | Line-only isofunction mode | App workflow enables line-only mode on measured BSPM and checks status/canvas delta | medium | Exact interpolated legacy isolines unverified |
| Thorax | Initial/adapted BSPM | App workflow switches recomputed maps and verifies edit-driven redraw; visual-mode smoke checks each mode label/status and nonblank canvas | strong smoke | WCT/reference parity unresolved |
| Thorax | Sensitivity | App workflow checks sensitivity map, scale changes, and parsed electrode target selection; visual-mode smoke checks status/mode label and nonblank canvas | strong smoke | Confirmed legacy lead-transfer roles still need reference capture |
| Thorax | Lock to Heart orientation | App workflow enables lock, checks followed Heart rotation, linked AP reset, and unlock | medium | Exact manual drag-rotation parity unverified |
| TMP | Initial/adapted traces | App workflow toggles initial/grid and verifies canvas deltas | strong smoke | Multi-beat source inventory unresolved |
| TMP | Handler overlay | App workflow toggles selected-node handlers and verifies TMP canvas delta | medium | Exact legacy triangular drag handles unverified |
| TMP | Editing/reset/undo/redo | App workflow edits a selected node and checks redraw/status | strong behavior | Exact legacy drag handlers remain numeric-edit equivalent |
| TMP | Time cursor, interval, and beat zoom | App workflow checks yellow cursor movement, shared interval highlight, zoomed metadata, and TMP canvas deltas | strong smoke | Multi-beat atrial/ventricular selection unresolved |
| TMP | Electrogram blocker | App workflow verifies EGM control is disabled and names missing electrogram evidence | blocker evidence | Needs selected-node electrogram payload or derivation equation |
| Leads | Interval highlight and beat zoom | App workflow sets interval controls, zooms from interval/fiducials, resets all beats, and verifies Leads/TMP canvas deltas | strong smoke | Multi-beat atrial/ventricular selection unresolved |
| Leads | Lead-system switching and VCG loop | App workflow selects VCG, checks metadata/canvas delta, enables VCG loop, and verifies mode/status/canvas redraw | strong smoke | Exact Frank transform unresolved |
| Leads | Coupling/filtering | App workflow switches baseline/AC/DC and checks status/canvas delta | strong behavior | Arbitrary case fiducials unresolved |
| Leads | Adapted recompute preview | App workflow toggles adapted and checks TMP-edit-driven redraw | medium | Lead transform/WCT parity unresolved |
| Leads | External ECG import | App workflow imports JSON and checks imported source/status/canvas | strong smoke | Legacy ECG file import format still separate |
| Visual output | PNG exports | App workflow downloads all pane PNGs and checks signatures/dimensions | strong artifact | Clipboard remains browser-permission dependent |
| Visual output | WebM movie export | App workflow downloads Leads WebM and checks EBML signature/size | medium artifact | Other panes use same code path but are not individually downloaded |
| Help/About | References/status | App workflow opens Help/About and verifies core text | strong smoke | Case-download shortcut missing |
| Visual regression | Legacy screenshot smoke | `tests/test_visual_regression.py` checks tracked screenshot and synthetic pass/fail fixtures | strong smoke | Broad comparison only; not pane-level parity |

## Priority Coverage Gaps

1. Promote exact Frank VCG transform/reference evidence when lead semantics are parsed.
2. Capture curated pane-level legacy references for specific modes once the modern equivalents are stable.
3. Add per-mode Leads/TMP matrix enumeration if those modes continue to grow beyond the main app workflow.
