# Visual Test Coverage

Status: seeded by task `0084`.

This document maps visualization modes to current automated evidence. It tracks whether users can see and interact with a visual mode; numerical parity remains tracked separately.

## Current Automated Evidence

| Area | Visual mode or workflow | Current evidence | Coverage strength | Gap |
| --- | --- | --- | --- | --- |
| Workspace | Four-pane launch layout | `app/viewer/scripts/app-test.mjs` checks shell layout and task `0085` adds first-viewport canvas visibility assertions | strong for default layout | Does not yet test resizable panes |
| Workspace | Pane mode/provenance labels | App workflow checks launch badges and representative Heart/Thorax/TMP/Leads mode transitions | medium | Needs per-mode coverage expansion in `0101` |
| Workspace | Visual mode navigator | App workflow selects representative Heart, Thorax, TMP, and Leads destinations through toolbar navigator | medium | Does not yet enumerate every visual matrix row |
| Heart | Geometry render | App workflow checks nonblank WebGL canvas and metadata | strong smoke | No pane-level legacy screenshot comparison |
| Heart | Depolarization/repolarization | App workflow switches modes, verifies labels/provenance, and checks initial/adapted canvas redraw | strong smoke | No exact legacy colormap or scale parity |
| Heart | ARI | App workflow switches mode, verifies derived provenance, and checks initial/adapted canvas redraw | strong smoke | No legacy ARI reference scale |
| Heart | Amplitude/resting potential | App workflow switches modes, verifies labels/provenance, and checks initial/adapted canvas redraw | strong smoke | No exact legacy colormap or scale parity |
| Heart | TMP at time | App workflow links time cursor and checks canvas changes | strong smoke | No numeric sampled-color validation |
| Heart | Thorax contribution | App workflow targets a parsed thorax electrode and checks Heart contribution status/canvas change | strong smoke | Confirmed legacy lead-transfer roles still need reference capture |
| Heart | Selection radius/transition | App workflow selects nodes, checks selection text/weighted region, and verifies node/ring overlay canvas deltas | strong smoke | Exact legacy glyph and ring projection style unverified |
| Heart | Cross-section plane | App workflow enables Heart cut mode, moves the plane, and checks canvas deltas/status | medium | Exact legacy Shift+wheel/arrow behavior and plane orientation unverified |
| Heart | Electrode overlay | App workflow toggles Heart electrodes and verifies parsed lead-system count plus canvas delta | strong smoke | Exact legacy grey patch shape unverified |
| Heart | Heart vector | App workflow toggles computed TMP vector path and checks time-linked canvas redraw/status | medium | Exact legacy heart-vector equation unverified |
| Thorax | Geometry/heart/lung layers | App workflow checks nonblank canvas plus Heart context and lung-toggle canvas deltas | strong smoke | Exact legacy transparency style unverified |
| Thorax | Electrodes | App workflow toggles parsed electrodes and checks canvas delta | strong smoke | Exact electrode glyph geometry unverified |
| Thorax | Measured BSPM | App workflow switches measured map, time cursor, contours, and scale | strong smoke | No legacy map color/line parity |
| Thorax | Line-only isofunction mode | App workflow enables line-only mode on measured BSPM and checks status/canvas delta | medium | Exact interpolated legacy isolines unverified |
| Thorax | Initial/adapted BSPM | App workflow switches recomputed maps and verifies edit-driven redraw | strong smoke | WCT/reference parity unresolved |
| Thorax | Sensitivity | App workflow checks sensitivity map, scale changes, and parsed electrode target selection | strong smoke | Confirmed legacy lead-transfer roles still need reference capture |
| Thorax | Lock to Heart orientation | App workflow enables lock, checks followed Heart rotation, linked AP reset, and unlock | medium | Exact manual drag-rotation parity unverified |
| TMP | Initial/adapted traces | App workflow toggles initial/grid and verifies canvas deltas | strong smoke | Beat zoom missing |
| TMP | Handler overlay | App workflow toggles selected-node handlers and verifies TMP canvas delta | medium | Exact legacy triangular drag handles unverified |
| TMP | Editing/reset/undo/redo | App workflow edits a selected node and checks redraw/status | strong behavior | Exact legacy drag handlers remain numeric-edit equivalent |
| TMP | Time cursor and interval | App workflow checks yellow cursor movement plus shared Leads/TMP interval highlight | strong smoke | Beat zoom missing |
| Leads | Interval highlight | App workflow sets Leads interval controls and verifies Leads/TMP canvas deltas | strong smoke | Beat zoom missing |
| Leads | Lead-system switching | App workflow selects VCG and checks metadata/canvas delta | strong smoke | VCG loop visualization missing |
| Leads | Coupling/filtering | App workflow switches baseline/AC/DC and checks status/canvas delta | strong behavior | Arbitrary case fiducials unresolved |
| Leads | Adapted recompute preview | App workflow toggles adapted and checks TMP-edit-driven redraw | medium | Lead transform/WCT parity unresolved |
| Leads | External ECG import | App workflow imports JSON and checks imported source/status/canvas | strong smoke | Legacy ECG file import format still separate |
| Visual output | PNG exports | App workflow downloads all pane PNGs and checks signatures/dimensions | strong artifact | Clipboard remains browser-permission dependent |
| Visual output | WebM movie export | App workflow downloads Leads WebM and checks EBML signature/size | medium artifact | Other panes use same code path but are not individually downloaded |
| Help/About | References/status | App workflow opens Help/About and verifies core text | strong smoke | Case-download shortcut missing |
| Visual regression | Legacy screenshot smoke | `tests/test_visual_regression.py` checks tracked screenshot and synthetic pass/fail fixtures | strong smoke | Broad comparison only; not pane-level parity |

## Priority Coverage Gaps

1. Add per-mode canvas smoke tests that iterate all Heart and Thorax surface modes without relying on one long workflow.
2. Add visible node overlays and selection rings so Heart selection is inspectable, not only text/status-driven.
3. Add interval/beat zoom coverage for Leads/TMP linked views.
4. Add VCG loop visualization evidence for Frank VCG cases.
5. Capture curated pane-level legacy references for specific modes once the modern equivalents are stable.
