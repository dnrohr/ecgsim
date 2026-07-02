# Feature Parity Matrix

Status: parity tracking matrix synced with implemented tasks through `0061` plus the first raw legacy export capture for the ECGSIM 3.0.1 normal male case. Scientific rows remain conservative until promoted exports are wired into scenario-level assertions.

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
| Main Window And Global Layout | Four-pane workspace | supported | P0 | `0036` | Static viewer has the four primary panes; resizable legacy splitter parity is not implemented. |
| Main Window And Global Layout | Menu-per-pane model | partial | P1 | `0036` | Menu strip is visible; most legacy menu commands remain represented by pane controls or unsupported. |
| Main Window And Global Layout | Toolbar | partial | P2 | `0036` | Compact toolbar exists for case, workspace, lead-system, and time controls. |
| Main Window And Global Layout | Status bar | supported | P1 | `0036` | Status messages report case loading, edits, time cursor, exports, and validation errors. |
| Main Window And Global Layout | Mouse-driven interaction | partial | P0 | `0037` | Core selection/editing interactions remain incomplete. |
| File, Case, And Export Workflows | Open case | partial | P0 | `0034` | Must load arbitrary `.ECGsimcase` files. |
| File, Case, And Export Workflows | Open default case | supported | P0 | `0033` | Bundled normal case loads by default from generated fixtures. |
| File, Case, And Export Workflows | Download case files | partial | P2 | `0061` | User docs identify archived case locations; in-app Help/download action is not implemented. |
| File, Case, And Export Workflows | Save case | partial | P1 | `0055` | Modern `.source-edits.json` sidecar is supported; legacy `.ECGsimcase` write-back is unsupported. |
| File, Case, And Export Workflows | Open/save source info | partial | P1 | `0075` | Modern `.ECGsimsource.json` source-info export/import validation is supported; byte-compatible legacy `.ECGsimsource` remains undocumented. |
| File, Case, And Export Workflows | Load ECG file | unsupported | P1 | `0032` | Requires ECG import format and measured/simulated model. |
| File, Case, And Export Workflows | Export directory | partial | P0 | `0054` | Python writer emits supported legacy-style subset; normal male legacy raw export is captured, but full `File -> Export` parity still needs comparison work. |
| File, Case, And Export Workflows | Export ECG files | partial | P0 | `0054` | `ecgs/thorax.refECG` surface-potential matrix is exported; adapted ECG recomputation is unsupported. |
| File, Case, And Export Workflows | Export triangulation files | supported | P1 | `0054` | Heart, thorax, and lung `.tri` files export in documented ASCII format. |
| File, Case, And Export Workflows | Export source parameters | supported | P0 | `0054` | Supported source parameter vectors export as legacy-style `user.*` files when present. |
| File, Case, And Export Workflows | Export TMP waveforms | unsupported | P0 | `0054` | Captured `.user.source` evidence calibrated the task `0049` generator; modern export writing remains unsupported. |
| File, Case, And Export Workflows | Export electrode locations | unsupported | P1 | `0054` | Depends on lead/electrode parser. |
| Heart View | Geometry and surface functions | partial | P0 | `0072` | Geometry, parameter, ARI, TMP-at-time, and scalar contour overlays are implemented for supported cases; exact legacy colormaps remain approximate. |
| Heart View | Rotate/AP reset | supported | P1 | `0037` | AP reset and auto-rotation controls are implemented and tested. |
| Heart View | Cross plane | unsupported | P1 | `0037` | Requires geometry clipping. |
| Heart View | Select node | partial | P0 | `0037` | Needs real source-node mapping. |
| Heart View | Radius/selected zone | partial | P0 | `0044` | Radius, transition zone, and weighted region selection are implemented; exact legacy contour behavior is unverified. |
| Heart View | Probe mode | partial | P1 | `0073` | Selected Thorax nodes can drive Heart contribution maps through the transfer row; electrode probe shortcuts remain future work. |
| Heart View | Foci edit mode | partial | P1 | `0070` | WPW activation records are inspectable and selected heart nodes can drive a focus route preview; exact legacy raw-field edits remain unavailable. |
| Heart View | Atria/ventricles source switch | partial | P1 | `0031` | Source inventory is parsed; viewer editing remains ventricular-only. |
| Heart View | Initial/adapted display | partial | P0 | `0037` | Heart view must switch visual state, not only TMP plot. |
| Heart View | Depolarization surface function | partial | P0 | `0037` | Implemented from parsed source parameters for supported cases; legacy colormap parity unverified. |
| Heart View | Repolarization surface function | partial | P0 | `0037` | Implemented from parsed source parameters for supported cases; legacy colormap parity unverified. |
| Heart View | ARI surface function | partial | P1 | `0071` | Computed as repolarization minus depolarization in milliseconds; legacy colormap parity unverified. |
| Heart View | Amplitude surface function | partial | P1 | `0037` | Implemented from parsed source parameters for supported cases; legacy colormap parity unverified. |
| Heart View | Resting-potential surface function | partial | P1 | `0037` | Implemented from parsed source parameters for supported cases; legacy colormap parity unverified. |
| Heart View | TMP-at-time surface function | partial | P0 | `0071` | Generated from current TMP parameter state and synchronized to the shared time cursor; legacy colormap parity unverified. |
| Heart View | Geometry/nodes function | partial | P1 | `0037` | Needs node overlay mode. |
| Heart View | Heart contribution map | partial | P1 | `0073` | Heart contribution surface displays the selected Thorax node's ventricles-to-thorax transfer row; transfer-role parity remains incomplete. |
| Heart View | Potential field strength | unsupported | P2 | `0042` | Data/equation source still needs confirmation. |
| Heart View | Endocardial/epicardial switch | deferred | P1 | `0045` | Control is explicitly disabled per case until wall-side mappings are parsed. |
| Heart View | Transmural toggle | deferred | P1 | `0045` | Control is explicitly disabled per case until transmural mappings and edit semantics are known. |
| Heart View | Accumulation modes | partial | P1 | `0046` | Replace/expand-style weighted selection, undo, and redo exist; legacy named modes remain incomplete. |
| Heart View | Heart vector | unsupported | P2 | `0042` | Requires vector computation/data and shared time. |
| Heart View | Electrode visibility | unsupported | P1 | `0032` | Electrode positions are parsed and shown in Thorax; Heart electrode display is not implemented. |
| Heart View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Heart View | Movie | unsupported | P2 | `0056` | Requires time cursor/playback and map frames. |
| Thorax View | Geometry display | supported | P0 | `0038` | Parsed thorax and lung geometry render for supported cases. |
| Thorax View | Rotate/AP reset | supported | P1 | `0038` | AP reset and auto-rotation controls are implemented and tested. |
| Thorax View | Select thorax node | partial | P1 | `0073` | Thorax node selection drives Heart contribution maps; electrode target shortcuts remain future work. |
| Thorax View | Surface function: default geometry | supported | P1 | `0038` | Default geometry/transparency mode is implemented for supported cases. |
| Thorax View | Surface function: measured BSPM | partial | P0 | `0042` | Measured surface-potential map from parsed fixture is shown; classification and legacy parity remain incomplete. |
| Thorax View | Surface function: initial BSPM | partial | P0 | `0067` | Initial BSPM recomputes from initial TMP parameters through the transfer candidate; legacy numerical parity remains incomplete. |
| Thorax View | Surface function: adapted BSPM | partial | P0 | `0051`, `0067` | Adapted BSPM recomputes from TMP parameters through a shape-matched ventricles-to-thorax transfer candidate; WCT/reference parity remains downstream. |
| Thorax View | Surface function: sensitivity map | partial | P1 | `0067` | Shows the selected heart/source node's transfer column on the thorax; transfer-role parity remains incomplete. |
| Thorax View | Time stepping | partial | P0 | `0041` | Shared time cursor updates measured BSPM maps; movie/frame parity remains incomplete. |
| Thorax View | Show/hide lungs | supported | P2 | `0038` | Prototype works; menu parity still missing. |
| Thorax View | Show/hide electrodes | partial | P1 | `0032` | Parsed electrode coordinate markers can be toggled where available; exact patch geometry is not implemented. |
| Thorax View | Lock to heart | unsupported | P2 | `0038` | Requires shared camera/orientation state. |
| Thorax View | Scale | supported | P1 | `0042` | Thorax scale control is implemented and covered by app workflow tests. |
| Thorax View | Movie | unsupported | P2 | `0056` | Requires linked playback. |
| Thorax View | Isofunction display | partial | P1 | `0072` | Contour overlays are available for scalar maps; exact interpolated legacy isolines remain future work. |
| Thorax View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| TMP View | Selected-node TMP display | partial | P0 | `0040` | Selected-node TMP display is implemented with provisional waveform generation; legacy `.user.source` parity is missing. |
| TMP View | Parameter handlers | partial | P0 | `0040` | Numeric controls implement parameter edits; legacy drag-handler equivalence is incomplete. |
| TMP View | Timing/amplitude parameters | partial | P0 | `0040` | Parser-backed parameters can be edited; legacy constraints and waveform parity are incomplete. |
| TMP View | Slope parameters | partial | P0 | `0040` | Provisional waveform behavior must be replaced. |
| TMP View | Initial/adapted handler reset | partial | P1 | `0040` | Reset parameter and undo/redo are implemented; double-click handler parity is not. |
| TMP View | Reset beat | supported | P0 | `0040` | Reset beat restores adapted vectors for the current supported beat. |
| TMP View | Time bar | supported | P0 | `0041` | Shared time cursor is implemented on TMP and Leads canvases. |
| TMP View | Interval highlight | unsupported | P1 | `0041` | Needs interval model. |
| TMP View | Grid display | supported | P2 | `0040` | TMP grid toggle is implemented and tested. |
| TMP View | Combined resting/amplitude handlers | unsupported | P1 | `0040` | Needs handler implementation. |
| TMP View | Keep constant APD option | unsupported | P1 | `0040` | Needs edit semantics. |
| TMP View | Show/hide electrogram | unsupported | P1 | `0032` | Requires electrogram data or derivation. |
| TMP View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Leads / ECG View | Lead systems | partial | P0 | `0043` | Lead-system metadata and switching are implemented; exact lead transform semantics remain incomplete. |
| Leads / ECG View | Signal overlays | unsupported | P0 | `0039` | Requires signal classification and controls. |
| Leads / ECG View | Coupling/filtering | partial | P0 | `0052` | Exact fiducial behavior unknown. |
| Leads / ECG View | Time bar | supported | P0 | `0041` | Shared time cursor is implemented on Leads and TMP canvases. |
| Leads / ECG View | Arrow-key time stepping | supported | P1 | `0041` | Arrow-key stepping works when waveform canvases have focus. |
| Leads / ECG View | Beat zoom | unsupported | P1 | `0039` | Requires beat inventory and plot interval model. |
| Leads / ECG View | Interval selection | unsupported | P1 | `0041` | Needs linked interval state. |
| Leads / ECG View | VCG display | unsupported | P2 | `0039` | Requires VCG lead data and plot mode. |
| Leads / ECG View | Scale | supported | P1 | `0039` | Leads scale control is implemented and tested. |
| Leads / ECG View | Grid display | supported | P2 | `0039` | Leads grid toggle is implemented and tested. |
| Leads / ECG View | Clipboard copy | partial | P2 | `0056` | PNG download supported; clipboard depends on browser permission/API support. |
| Tools, Focus, And Preferences | Dockable Tools view | unsupported | P2 | `0036` | Modern panels may replace dockable windows. |
| Tools, Focus, And Preferences | Standard orientation tools | unsupported | P1 | `0037` | Needed for Heart/Thorax view parity. |
| Tools, Focus, And Preferences | Create rhythm | deferred | P2 | `0050` | Multi-beat creation is not implemented; activation/focus parsing groundwork exists. |
| Tools, Focus, And Preferences | Global TMP timing statistics | unsupported | P1 | `0040` | Requires source parameter model and validation. |
| Tools, Focus, And Preferences | Global TMP shape adjustments | unsupported | P1 | `0040` | Requires edit transaction model. |
| Tools, Focus, And Preferences | Timing supervision | unsupported | P1 | `0040` | Add validation when global edits exist. |
| Tools, Focus, And Preferences | Transition zone editor | partial | P1 | `0044` | Transition-zone radius control exists in Heart selection; legacy tool panel parity is incomplete. |
| Tools, Focus, And Preferences | Foci edit dock | partial | P1 | `0070` | TMP pane Focus controls expose WPW activation records and preview focus route edits; a dockable legacy-style tool remains unnecessary unless workflow testing requires it. |
| Tools, Focus, And Preferences | Focus opposite wall | deferred | P1 | `0050` | Requires confirmed wall mapping before enabling. |
| Tools, Focus, And Preferences | Focus propagation velocity | partial | P1 | `0070` | WPW Focus controls accept a preview velocity for deterministic route recomputation; decoded graph-geometry velocity parity remains future work. |
| Tools, Focus, And Preferences | Global repolarization | unsupported | P1 | `0049` | Needs equations and parity data. |
| Tools, Focus, And Preferences | Preferences modal | unsupported | P2 | `0036` | Modern settings may replace modal behavior. |
| Tools, Focus, And Preferences | Color scale preferences | partial | P1 | `0072` | Sequential/diverging palettes are implemented automatically; user-configurable scale preferences remain future work. |
| Tools, Focus, And Preferences | Thorax isofunction preference | partial | P1 | `0072` | Thorax scalar maps can toggle contour overlays; line-only preference parity remains future work. |
| Tools, Focus, And Preferences | Arc ball rotation preference | deferred | Deferred | none | Legacy itself marks this as future/unavailable. |
| Clipboard And Visual Output | Pane image copy | partial | P2 | `0056` | PNG download supported for all primary panes; clipboard is best-effort by browser capability. |
| Clipboard And Visual Output | App must remain open for paste | deferred | Deferred | `0056` | Modern clipboard writes are independent once the browser/OS accepts the image. |
| Clipboard And Visual Output | Movie output | unsupported | P2 | `0056` | Need legacy reference for save versus playback behavior. |
| Help, About, References, And Updates | About/version discovery | partial | P2 | `0059` | Static package manifest and release validation exist; in-app About view is not implemented. |
| Help, About, References, And Updates | Check for updates | unsupported | P2 | `0059` | Likely replaced by release/release-notes strategy. |
| Help, About, References, And Updates | Standalone updater | unsupported | P2 | `0059` | Relevant only if desktop packaging uses auto-update. |
| Help, About, References, And Updates | Download case files link | partial | P2 | `0061` | User guide documents archived case paths; in-app link is not implemented. |
| Help, About, References, And Updates | References/publications | partial | P2 | `0061` | Research papers are archived and documented; in-app reference view is not implemented. |
