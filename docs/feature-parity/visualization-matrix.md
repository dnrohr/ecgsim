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
| Workspace | Four-pane Heart, Thorax, TMP, Leads workspace visible at launch | Visual-first 2x2 workspace with compact metadata and visible canvases | partial | Browser viewport assertions for pane/canvas visibility | `0085` |
| Workspace | Menu/toolbar discoverability for visual modes | Pane controls plus visual mode navigator | partial | Mode coverage map and browser navigation checks | `0087` |
| Heart | Geometry surface | Heart mesh canvas | supported | Nonblank canvas and mode label | `0101` |
| Heart | Depolarization surface | Heart surface `Depolarization`, initial/adapted selector | supported | Data-backed source parameter check and canvas delta | `0091` |
| Heart | Repolarization surface | Heart surface `Repolarization`, initial/adapted selector | supported | Data-backed source parameter check and canvas delta | `0091` |
| Heart | ARI surface | Heart surface `ARI` | supported | Computed `rep - dep` check and canvas delta | `0091` |
| Heart | Amplitude surface | Heart surface `Amplitude` | supported | Parameter vector check and canvas delta | `0091` |
| Heart | Resting-potential surface | Heart surface `Resting potential` | supported | Parameter vector check and canvas delta | `0091` |
| Heart | TMP at selected time | Heart surface `TMP at time`, linked cursor/playback | supported | Time cursor changes canvas and status | `0091` |
| Heart | Heart contribution map | Heart surface `Thorax contribution` after thorax-node selection | partial | Transfer-row provenance and selected-node workflow test | `0095` |
| Heart | Node visibility and selected-zone rings | Node overlay plus radius/transition rings | partial | Canvas overlay delta and selection summary | `0088` |
| Heart | Cross plane | Geometry clipping plane | blocked-on-evidence | Confirm expected legacy clipping behavior | `0089` |
| Heart | Heart vector | Time arrow/vector overlay | blocked-on-evidence | Equation/data source for vector path | `0090` |
| Heart | Electrode visibility | Lead-system electrode overlay in Heart and Thorax | partial | Parsed electrode mapping and overlay tests | `0090` |
| Heart | Endocardial/epicardial and transmural mapping | Disabled until wall mappings are parsed | blocked-on-evidence | PGraphGeometry/wall mapping semantics | future |
| Thorax | Geometry with lungs | Thorax, left lung, right lung toggles | supported | Nonblank canvas and layer-toggle deltas | `0101` |
| Thorax | Heart context inside thorax | Heart-context overlay in Thorax geometry mode | partial | Visible overlay and layer controls | `0092` |
| Thorax | Measured BSPM | Thorax surface `Measured BSPM` | supported | Surface matrix provenance and time canvas delta | `0101` |
| Thorax | Initial BSPM | Thorax surface `Initial BSPM` | supported | TMP/transfer recomputation provenance and canvas delta | `0101` |
| Thorax | Adapted BSPM | Thorax surface `Adapted BSPM` | supported | TMP edit changes recomputed map | `0101` |
| Thorax | Sensitivity map | Thorax surface `Sensitivity` for selected source node | supported | Transfer-column provenance and canvas delta | `0095` |
| Thorax | Isofunction lines | Contour overlay and line-only mode | partial | Contour visibility and mode status | `0093` |
| Thorax | Electrodes | Thorax electrode toggle | supported | Parsed electrode count and canvas delta | `0101` |
| Thorax | Lock to heart orientation | Shared Heart/Thorax camera mode | partial | Camera synchronization workflow | `0094` |
| TMP | Initial/adapted TMP traces | TMP plot with initial/adapted toggles | supported | Toggle canvas deltas and selected-node provenance | `0101` |
| TMP | Parameter handlers | Modern numeric controls plus future handler-style overlay | partial | Handler or documented modern-equivalent workflow | `0096` |
| TMP | Time bar | Shared yellow cursor | supported | Cursor x-position tests | `0101` |
| TMP | Interval highlight | Linked Leads interval highlight | partial | Interval model and canvas delta | `0097` |
| TMP | Electrogram | EGM toggle disabled until data/equation exists | blocked-on-evidence | Electrogram data or derivation | `0100` |
| Leads | Standard and alternate lead systems | Lead-system selector with parsed electrodes/traces | supported | Lead-system switch canvas/metadata tests | `0101` |
| Leads | Measured/initial/adapted overlays | Measured/initial disabled; adapted recompute preview | partial | Signal classification and WCT/reference parity | future |
| Leads | Coupling/filter modes | Baseline, AC, DC selector | supported | Numerical filtering tests and canvas/status deltas | `0101` |
| Leads | Time bar and arrow stepping | Shared yellow cursor and keyboard stepping | supported | Cursor x-position and status tests | `0101` |
| Leads | Beat zoom | Beat/interval zoom workflow | partial | Beat metadata or interval model | `0098` |
| Leads | VCG loop display | Frank VCG visualization mode | partial | VCG transform/data mapping | `0099` |
| Visual output | Pane PNG export | PNG per pane | supported | PNG signature and dimensions | complete |
| Visual output | Movie/playback export | WebM per pane | supported | WebM signature and nonempty artifact | complete |

## Completion Rule

The visualization feature-parity goal cannot be marked complete until every row is no longer `partial` without a specific next task, and every `supported` row has automated evidence or a documented blocker.
