# Visual Test Coverage

Status: seeded by task `0084`.

This document maps visualization modes to current automated evidence. It tracks whether users can see and interact with a visual mode; numerical parity remains tracked separately.

## Current Automated Evidence

| Area | Visual mode or workflow | Current evidence | Coverage strength | Gap |
| --- | --- | --- | --- | --- |
| Workspace | Four-pane launch layout | `app/viewer/scripts/app-test.mjs` checks shell layout and task `0085` adds first-viewport canvas visibility assertions | strong for default layout | Does not yet test resizable panes or visual mode navigator |
| Workspace | Pane mode/provenance labels | App workflow checks launch badges and representative Heart/Thorax/TMP/Leads mode transitions | medium | Needs per-mode coverage expansion in `0101` |
| Heart | Geometry render | App workflow checks nonblank WebGL canvas and metadata | strong smoke | No pane-level legacy screenshot comparison |
| Heart | Depolarization/repolarization | App workflow switches modes and checks canvas signature changes/status | strong smoke | No exact legacy colormap or scale parity |
| Heart | ARI | App workflow switches mode and checks canvas signature change/status | strong smoke | No legacy ARI reference scale |
| Heart | TMP at time | App workflow links time cursor and checks canvas changes | strong smoke | No numeric sampled-color validation |
| Heart | Thorax contribution | App workflow selects a thorax node and checks Heart contribution canvas change | medium | Needs transfer-role provenance and electrode shortcuts |
| Heart | Selection radius/transition | App workflow selects nodes and checks selection text/weighted region | medium | Selection rings/node overlays not yet visible as dedicated modes |
| Thorax | Geometry/lung layers | App workflow checks nonblank canvas and lung-toggle canvas delta | strong smoke | Heart context overlay missing |
| Thorax | Electrodes | App workflow toggles parsed electrodes and checks canvas delta | strong smoke | Exact electrode glyph geometry unverified |
| Thorax | Measured BSPM | App workflow switches measured map, time cursor, contours, and scale | strong smoke | No legacy map color/line parity |
| Thorax | Initial/adapted BSPM | App workflow switches recomputed maps and verifies edit-driven redraw | strong smoke | WCT/reference parity unresolved |
| Thorax | Sensitivity | App workflow checks sensitivity map and scale changes | strong smoke | Selected-electrode target workflow missing |
| TMP | Initial/adapted traces | App workflow toggles initial/grid and verifies canvas deltas | strong smoke | Handler-style controls missing |
| TMP | Editing/reset/undo/redo | App workflow edits a selected node and checks redraw/status | strong behavior | Exact legacy drag handlers missing |
| TMP | Time cursor | App workflow checks yellow cursor movement | strong smoke | Interval highlight missing |
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
