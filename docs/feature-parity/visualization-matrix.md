# Visualization Feature Parity Matrix

Status: active seed matrix for the visualization feature-parity goal.

This matrix tracks what a user can see and manipulate. It does not require the modern app to copy legacy ECGSIM pixels, menu placement, fonts, or exact window layout.

## Status Definitions

- `supported`: user-facing modern equivalent exists for supported case bundles.
- `parity-tested`: supported and validated against legacy visual or numerical evidence.
- `modern-equivalent`: deliberately different UI/control, but the same visual information is available.
- `partial`: some visual behavior exists, but discoverability, data coverage, or tests are incomplete.
- `blocked-on-evidence`: implementation needs a missing legacy payload, equation, or capture.
- `deferred-with-reason`: not currently required for practical visualization parity.

## Matrix

| Area | Legacy visual mode or interaction | Modern equivalent target | Status | Evidence needed | Next task |
| --- | --- | --- | --- | --- | --- |
| Workspace | Four-pane Heart, Thorax, TMP, Leads workspace visible at launch | Visual-first 2x2 workspace with compact metadata and visible canvases | supported | Browser viewport assertions for pane/canvas visibility | complete |
| Workspace | Current pane mode and data provenance are visible | Compact mode/provenance badges in each pane header | supported | App workflow checks launch badges and representative mode transitions | complete |
| Workspace | Menu/toolbar discoverability for visual modes | Pane controls plus visual mode navigator | supported | App workflow drives representative Heart, Thorax, TMP, and Leads modes through navigator | complete |
| Heart | Geometry surface | Heart mesh canvas | supported | Nonblank canvas and mode label | `0101` |
| Heart | Depolarization surface | Heart surface `Depolarization`, initial/adapted selector | supported | App workflow checks labels, provenance, canvas delta, and initial/adapted redraw | complete |
| Heart | Repolarization surface | Heart surface `Repolarization`, initial/adapted selector | supported | App workflow checks labels, provenance, canvas delta, and initial/adapted redraw | complete |
| Heart | ARI surface | Heart surface `ARI` | supported | App workflow checks derived ARI label/provenance and initial/adapted redraw | complete |
| Heart | Amplitude surface | Heart surface `Amplitude` | supported | App workflow checks labels, provenance, canvas delta, and initial/adapted redraw | complete |
| Heart | Resting-potential surface | Heart surface `Resting potential` | supported | App workflow checks labels, provenance, canvas delta, and initial/adapted redraw | complete |
| Heart | TMP at selected time | Heart surface `TMP at time`, linked cursor/playback | supported | App workflow checks time cursor canvas/status redraw | complete |
| Heart | Heart contribution map | Heart surface `Thorax contribution` after thorax-node or electrode-target selection | supported | App workflow checks parsed electrode target, transfer-row provenance, and canvas delta | complete |
| Heart | Node visibility and selected-zone rings | Node overlay plus radius/transition rings | supported | App workflow checks overlay toggles and canvas deltas | complete |
| Heart | Cross plane | Movable Heart clipping-plane prototype | modern-equivalent | App workflow checks cut and plane movement; exact legacy orientation still needs curated reference | `0102` |
| Heart | Heart vector | Computed TMP-centroid vector path and current-time arrow | modern-equivalent | App workflow checks vector canvas delta and time-linked redraw; exact legacy vector equation still needs capture | `0102` |
| Heart | Electrode visibility | Lead-system electrode overlay in Heart and Thorax | supported | App workflow checks parsed electrode counts and lead-system overlay redraw | complete |
| Heart | Endocardial/epicardial and transmural mapping | Parsed `PGraphGeometry` source-mesh overlay plus disabled wall-pair/transmural controls | blocked-on-evidence | Source mesh is visible and source-node aligned; explicit wall-pairing and transmural grouping semantics still need decoding | future |
| Thorax | Geometry with lungs | Thorax, left lung, right lung toggles | supported | Nonblank canvas and layer-toggle deltas | `0101` |
| Thorax | Heart context inside thorax | Heart-context overlay in Thorax geometry mode | supported | App workflow checks layer toggle and canvas delta | complete |
| Thorax | Measured BSPM | Thorax surface `Measured BSPM` | supported | Surface matrix provenance and time canvas delta | `0101` |
| Thorax | Initial BSPM | Thorax surface `Initial BSPM` | supported | TMP/transfer recomputation provenance and canvas delta | `0101` |
| Thorax | Adapted BSPM | Thorax surface `Adapted BSPM` | supported | TMP edit changes recomputed map | `0101` |
| Thorax | Sensitivity map | Thorax surface `Sensitivity` for selected source node | supported | App workflow checks transfer-column provenance and canvas delta | complete |
| Thorax | Isofunction lines | Contour overlay plus line-only scalar-map mode | supported | App workflow checks contour visibility, line-only status, and canvas delta | complete |
| Thorax | Electrodes | Thorax electrode toggle | supported | Parsed electrode count and canvas delta | `0101` |
| Thorax | Lock to heart orientation | Shared Heart/Thorax orientation lock | supported | App workflow checks lock, follow-rotation redraw, AP reset, and unlock | complete |
| TMP | Initial/adapted TMP traces | TMP plot with initial/adapted toggles | supported | Toggle canvas deltas and selected-node provenance | `0101` |
| TMP | Parameter handlers | Numeric controls plus selected-node handler overlay | modern-equivalent | App workflow checks handler overlay canvas delta after Heart selection | complete |
| TMP | Time bar | Shared yellow cursor | supported | Cursor x-position tests | `0101` |
| TMP | Interval highlight | Linked Leads interval highlight | supported | App workflow checks interval redraw on Leads and TMP canvases | complete |
| TMP | Beat zoom | Shared Leads beat-window zoom | supported | App workflow checks zoomed TMP metadata and canvas redraw | complete |
| TMP | Electrogram | EGM toggle disabled with matrix-inventory and source-square transfer evidence | blocked-on-evidence | Case metadata verifies no source-node-by-time electrogram matrix candidate and one dense signed source-to-source transfer candidate; needs confirmed VENTR.VENTRICLES role and legacy-validated EGM output | future |
| Leads | Standard and alternate lead systems | Lead-system selector with parsed electrodes/traces | supported | Lead-system switch canvas/metadata tests | `0101` |
| Leads | Measured/initial/adapted overlays | Promoted normal-male measured `.refECG` traces plus initial/adapted recompute overlays; unsupported measured cases disabled with status text | blocked-on-evidence | Promoted normal-male `.refECG` exports cover measured traces for matching lead systems; arbitrary case-payload measured classification and final reference-weight equations still need decoded semantics | future |
| Leads | Coupling/filter modes | Baseline, AC, DC selector | supported | Numerical filtering tests and canvas/status deltas | `0101` |
| Leads | Time bar and arrow stepping | Shared yellow cursor and keyboard stepping | supported | Cursor x-position and status tests | `0101` |
| Leads | Beat zoom | Interval/fiducial-backed zoom controls plus double-click toggle | supported | App workflow checks interval and fiducial zoom plus all-beats reset | complete |
| Leads | VCG loop display | Frank trace projection preview | modern-equivalent | App workflow checks VCG mode/status/canvas redraw | complete |
| Visual output | Pane PNG export | PNG per pane | supported | PNG signature and dimensions | complete |
| Visual output | Movie/playback export | WebM per pane | supported | WebM signature and nonempty artifact | complete |

## Completion Rule

The visualization feature-parity goal cannot be marked complete until every row is no longer `partial` without a specific next task, and every `supported` row has automated evidence or a documented blocker.
