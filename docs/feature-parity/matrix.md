# Feature Parity Matrix

Status: initial parity tracking matrix generated from `docs/feature-parity/inventory.md`.

## Status Definitions

- `unsupported`: legacy capability is identified, but the modern app has no user-facing implementation.
- `partial`: a prototype or related implementation exists, but it is incomplete or not behaviorally equivalent.
- `supported`: the modern app supports the workflow for current data, but it has not been validated against legacy behavior.
- `parity-tested`: the modern app supports the workflow and has automated or recorded manual parity evidence against a legacy reference.
- `deferred`: the capability is intentionally not scheduled yet, is superseded by a modern workflow, or was incomplete in the legacy app.

No row is `parity-tested` yet. The first rows should move to that status only after task `0028` expands the reference capture plan and later implementation tasks add repeatable checks.

## Priorities

- `P0`: required before the app can claim practical ECGSIM feature parity.
- `P1`: important for recognizable legacy workflows and scientific usability.
- `P2`: useful compatibility, polish, or documentation behavior.
- `Deferred`: not planned until a specific product or research need appears.

## Matrix

| Category | Feature | Status | Priority | Next task | Notes |
| --- | --- | --- | --- | --- | --- |
| Main Window And Global Layout | Four-pane workspace | partial | P0 | `0036` | Needs legacy-recognizable shell and resizable workspace. |
| Main Window And Global Layout | Menu-per-pane model | unsupported | P1 | `0036` | Confirm exact menu entries during expanded reference capture. |
| Main Window And Global Layout | Toolbar | unsupported | P2 | `0036` | Add only for controls that survive parity triage. |
| Main Window And Global Layout | Status bar | partial | P1 | `0036` | Needs transient interaction and validation messages. |
| Main Window And Global Layout | Mouse-driven interaction | partial | P0 | `0037` | Core selection/editing interactions remain incomplete. |
| File, Case, And Export Workflows | Open case | partial | P0 | `0034` | Must load arbitrary `.ECGsimcase` files. |
| File, Case, And Export Workflows | Open default case | partial | P0 | `0033` | Needs catalog/default behavior backed by real loader. |
| File, Case, And Export Workflows | Download case files | unsupported | P2 | `0061` | Could be a docs or Help action. |
| File, Case, And Export Workflows | Save case | unsupported | P1 | `0055` | Prefer adaptation sidecar until safe write-back is proven. |
| File, Case, And Export Workflows | Open/save source info | unsupported | P1 | `0055` | Requires source persistence and compatibility evidence. |
| File, Case, And Export Workflows | Load ECG file | unsupported | P1 | `0032` | Requires ECG import format and measured/simulated model. |
| File, Case, And Export Workflows | Export directory | unsupported | P0 | `0054` | Needed for interop and numerical parity references. |
| File, Case, And Export Workflows | Export ECG files | unsupported | P0 | `0054` | Required for legacy-style signal output. |
| File, Case, And Export Workflows | Export triangulation files | partial | P1 | `0054` | Readers exist; writer needs real geometry model. |
| File, Case, And Export Workflows | Export source parameters | partial | P0 | `0054` | Critical for edit parity and legacy comparison. |
| File, Case, And Export Workflows | Export TMP waveforms | unsupported | P0 | `0054` | Needed to replace provisional TMP generator evidence. |
| File, Case, And Export Workflows | Export electrode locations | unsupported | P1 | `0054` | Depends on lead/electrode parser. |
| Heart View | Geometry and surface functions | partial | P0 | `0037` | Needs real case geometry and surface-function coloring. |
| Heart View | Rotate/AP reset | partial | P1 | `0037` | Add explicit camera controls and tests. |
| Heart View | Cross plane | unsupported | P1 | `0037` | Requires geometry clipping. |
| Heart View | Select node | partial | P0 | `0037` | Needs real source-node mapping. |
| Heart View | Radius/selected zone | partial | P0 | `0044` | Needs contour/transition-zone behavior. |
| Heart View | Probe mode | unsupported | P1 | `0042` | Requires sensitivity map and transfer data. |
| Heart View | Foci edit mode | unsupported | P1 | `0050` | Requires activation model. |
| Heart View | Atria/ventricles source switch | unsupported | P1 | `0031` | Requires source inventory per case. |
| Heart View | Initial/adapted display | partial | P0 | `0037` | Heart view must switch visual state, not only TMP plot. |
| Heart View | Depolarization surface function | unsupported | P0 | `0037` | Needs parsed source parameters and colormap. |
| Heart View | Repolarization surface function | unsupported | P0 | `0037` | Needs parsed source parameters and colormap. |
| Heart View | ARI surface function | unsupported | P1 | `0037` | Computed from repolarization minus depolarization. |
| Heart View | Amplitude surface function | unsupported | P1 | `0037` | Needs parameter colormap. |
| Heart View | Resting-potential surface function | unsupported | P1 | `0037` | Needs parameter colormap. |
| Heart View | TMP-at-time surface function | unsupported | P0 | `0041` | Requires shared time cursor and TMP matrices. |
| Heart View | Geometry/nodes function | partial | P1 | `0037` | Needs node overlay mode. |
| Heart View | Heart contribution map | unsupported | P1 | `0042` | Requires thorax node selection and transfer data. |
| Heart View | Potential field strength | unsupported | P2 | `0042` | Data/equation source still needs confirmation. |
| Heart View | Endocardial/epicardial switch | unsupported | P1 | `0045` | Requires wall-side mapping. |
| Heart View | Transmural toggle | unsupported | P1 | `0045` | Requires transmural mapping and edit semantics. |
| Heart View | Accumulation modes | unsupported | P1 | `0046` | Needed for legacy edit behavior. |
| Heart View | Heart vector | unsupported | P2 | `0042` | Requires vector computation/data and shared time. |
| Heart View | Electrode visibility | unsupported | P1 | `0032` | Requires parsed electrodes. |
| Heart View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Heart View | Movie | unsupported | P2 | `0056` | Requires time cursor/playback and map frames. |
| Thorax View | Geometry display | partial | P0 | `0038` | Add embedded heart context and real case geometry. |
| Thorax View | Rotate/AP reset | partial | P1 | `0038` | Share camera controls with Heart. |
| Thorax View | Select thorax node | unsupported | P1 | `0038` | Needed for leads and contribution maps. |
| Thorax View | Surface function: default geometry | partial | P1 | `0038` | Needs linked heart function and transparency mode. |
| Thorax View | Surface function: measured BSPM | unsupported | P0 | `0042` | Requires parsed measured surface potentials. |
| Thorax View | Surface function: initial BSPM | unsupported | P0 | `0042` | Requires recompute or parsed initial matrices. |
| Thorax View | Surface function: adapted BSPM | unsupported | P0 | `0042` | Requires recompute pipeline. |
| Thorax View | Surface function: sensitivity map | unsupported | P1 | `0042` | Requires probe mode and transfer visualization. |
| Thorax View | Time stepping | unsupported | P0 | `0041` | Shared time cursor dependency. |
| Thorax View | Show/hide lungs | supported | P2 | `0038` | Prototype works; menu parity still missing. |
| Thorax View | Show/hide electrodes | unsupported | P1 | `0032` | Requires parsed electrodes. |
| Thorax View | Lock to heart | unsupported | P2 | `0038` | Requires shared camera/orientation state. |
| Thorax View | Scale | unsupported | P1 | `0042` | Needed for BSPM map parity. |
| Thorax View | Movie | unsupported | P2 | `0056` | Requires linked playback. |
| Thorax View | Isofunction display | unsupported | P1 | `0042` | Map renderer should support contour and color modes. |
| Thorax View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| TMP View | Selected-node TMP display | partial | P0 | `0040` | Needs exact source data and display styling. |
| TMP View | Parameter handlers | partial | P0 | `0040` | Need legacy handler-equivalent interaction. |
| TMP View | Timing/amplitude parameters | partial | P0 | `0040` | Needs legacy constraints and parser-backed values. |
| TMP View | Slope parameters | partial | P0 | `0040` | Provisional waveform behavior must be replaced. |
| TMP View | Initial/adapted handler reset | partial | P1 | `0040` | Decide double-click parity or documented modern alternative. |
| TMP View | Reset beat | partial | P0 | `0040` | Needs real beat/source scope. |
| TMP View | Time bar | unsupported | P0 | `0041` | Shared time cursor dependency. |
| TMP View | Interval highlight | unsupported | P1 | `0041` | Needs interval model. |
| TMP View | Grid display | unsupported | P2 | `0040` | Plot rendering option. |
| TMP View | Combined resting/amplitude handlers | unsupported | P1 | `0040` | Needs handler implementation. |
| TMP View | Keep constant APD option | unsupported | P1 | `0040` | Needs edit semantics. |
| TMP View | Show/hide electrogram | unsupported | P1 | `0032` | Requires electrogram data or derivation. |
| TMP View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Leads / ECG View | Lead systems | partial | P0 | `0043` | Requires parser and switcher. |
| Leads / ECG View | Signal overlays | unsupported | P0 | `0039` | Requires signal classification and controls. |
| Leads / ECG View | Coupling/filtering | partial | P0 | `0052` | Exact fiducial behavior unknown. |
| Leads / ECG View | Time bar | unsupported | P0 | `0041` | Shared time cursor dependency. |
| Leads / ECG View | Arrow-key time stepping | unsupported | P1 | `0041` | Requires keyboard focus and time state. |
| Leads / ECG View | Beat zoom | unsupported | P1 | `0039` | Requires beat inventory and plot interval model. |
| Leads / ECG View | Interval selection | unsupported | P1 | `0041` | Needs linked interval state. |
| Leads / ECG View | VCG display | unsupported | P2 | `0039` | Requires VCG lead data and plot mode. |
| Leads / ECG View | Scale | unsupported | P1 | `0039` | Current plots autoscale per trace. |
| Leads / ECG View | Grid display | unsupported | P2 | `0039` | Plot rendering option. |
| Leads / ECG View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Tools, Focus, And Preferences | Dockable Tools view | unsupported | P2 | `0036` | Modern panels may replace dockable windows. |
| Tools, Focus, And Preferences | Standard orientation tools | unsupported | P1 | `0037` | Needed for Heart/Thorax view parity. |
| Tools, Focus, And Preferences | Create rhythm | unsupported | P2 | `0050` | Requires multi-beat source model. |
| Tools, Focus, And Preferences | Global TMP timing statistics | unsupported | P1 | `0040` | Requires source parameter model and validation. |
| Tools, Focus, And Preferences | Global TMP shape adjustments | unsupported | P1 | `0040` | Requires edit transaction model. |
| Tools, Focus, And Preferences | Timing supervision | unsupported | P1 | `0040` | Add validation when global edits exist. |
| Tools, Focus, And Preferences | Transition zone editor | unsupported | P1 | `0044` | Needed for source editing parity. |
| Tools, Focus, And Preferences | Foci edit dock | unsupported | P1 | `0050` | Requires activation parsing/simulation. |
| Tools, Focus, And Preferences | Focus opposite wall | unsupported | P1 | `0050` | Requires wall mapping. |
| Tools, Focus, And Preferences | Focus propagation velocity | unsupported | P1 | `0050` | Requires graph/activation model. |
| Tools, Focus, And Preferences | Global repolarization | unsupported | P1 | `0049` | Needs equations and parity data. |
| Tools, Focus, And Preferences | Preferences modal | unsupported | P2 | `0036` | Modern settings may replace modal behavior. |
| Tools, Focus, And Preferences | Color scale preferences | unsupported | P1 | `0042` | Needed for map/surface views. |
| Tools, Focus, And Preferences | Thorax isofunction preference | unsupported | P1 | `0042` | Map renderer feature. |
| Tools, Focus, And Preferences | Arc ball rotation preference | deferred | Deferred | none | Legacy itself marks this as future/unavailable. |
| Clipboard And Visual Output | Pane image copy | partial | P2 | `0056` | PNG download supported for all primary panes; clipboard is best-effort by browser capability. |
| Clipboard And Visual Output | App must remain open for paste | deferred | Deferred | `0056` | Modern clipboard writes are independent once the browser/OS accepts the image. |
| Clipboard And Visual Output | Movie output | unsupported | P2 | `0056` | Need legacy reference for save versus playback behavior. |
| Help, About, References, And Updates | About/version discovery | unsupported | P2 | `0059` | Needed before packaged release. |
| Help, About, References, And Updates | Check for updates | unsupported | P2 | `0059` | Likely replaced by release/release-notes strategy. |
| Help, About, References, And Updates | Standalone updater | unsupported | P2 | `0059` | Relevant only if desktop packaging uses auto-update. |
| Help, About, References, And Updates | Download case files link | unsupported | P2 | `0061` | Add after external source policy is decided. |
| Help, About, References, And Updates | References/publications | partial | P2 | `0061` | Research papers are archived; app/docs need a user-facing reference view. |
