# Legacy Feature Inventory

Status: task `0026` feature inventory for parity planning. This is a factual inventory, not a commitment that every item must be implemented in the same way.

## Evidence Sources

Source IDs used below:

| ID | Evidence |
| --- | --- |
| `manual:basic` | `research/extracted-text/www.ecgsim.org/manual/basic.txt` |
| `manual:heart` | `research/extracted-text/www.ecgsim.org/manual/heart.txt` |
| `manual:thorax` | `research/extracted-text/www.ecgsim.org/manual/thorax.txt` |
| `manual:tmp` | `research/extracted-text/www.ecgsim.org/manual/membrane.txt` |
| `manual:leads` | `research/extracted-text/www.ecgsim.org/manual/leads.txt` |
| `manual:file` | `research/extracted-text/www.ecgsim.org/manual/file.txt` |
| `manual:options` | `research/extracted-text/www.ecgsim.org/manual/options.txt` |
| `manual:tools` | `research/extracted-text/www.ecgsim.org/manual/toolbox.txt` |
| `manual:focus` | `research/extracted-text/www.ecgsim.org/manual/focus.txt` |
| `manual:clipboard` | `research/extracted-text/www.ecgsim.org/manual/clipboard.txt` |
| `manual:update` | `research/extracted-text/www.ecgsim.org/manual/update.txt` |
| `manual:references` | `research/extracted-text/www.ecgsim.org/manual/ref.txt` |
| `screenshot:main` | `research/legacy-exports/screenshots/normal-male-main-window.png` and manifest |
| `export:attempt` | `docs/legacy-reference-exports.md` automation notes |

## Main Window And Global Layout

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Four-pane workspace | Main window has Heart upper-left, Thorax upper-right, TMP lower-left, Leads lower-right. Pane boundaries can be dragged. | `manual:basic`, `screenshot:main` | Partial: same four conceptual panes, not legacy layout/menus. | Need resizable panes and a legacy-recognizable shell. |
| Menu-per-pane model | Each pane has a corresponding menu-bar item controlling pane display. | `manual:basic` | Unsupported. | Inventory of exact menu entries needs live app confirmation. |
| Toolbar | Frequently used functions are available through top tool buttons with hover text. | `manual:basic`, `screenshot:main` | Unsupported. | Add only after feature matrix identifies required controls. |
| Status bar | Shows general application information and notifications. | `manual:basic`, `manual:heart`, `manual:thorax` | Partial: current app has static notices. | Need transient status messages for invalid selections/modes. |
| Mouse-driven interaction | Primary interaction is clicking, dragging, right-drag rotating, wheel/arrow scaling. | `manual:basic` | Partial. | Web app has click selection and limited sliders/toggles. |

## File, Case, And Export Workflows

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Open case | Opens `.ECGsimcase` from user-selected location. | `manual:file` | Partial: file picker only recognizes bundled fixture metadata and keeps bundled views. | Real object-graph parser and loader are FP1 priorities. |
| Open default case | Opens read-only default cases from application directory. | `manual:file` | Partial: bundled `normal_male2` fixture loads automatically. | Need default case catalog once real case loading exists. |
| Download case files | Menu opens ECGSIM website download location. | `manual:file` | Unsupported. | Could be docs link or app command. |
| Save case | Saves `.ECGsimcase`, including changed function values; default cases are read-only. | `manual:file` | Unsupported. | Risky until write-back format is understood; sidecar may come first. |
| Open/save source info | Saves source data to `.ECGsimsource`; load replaces current source parameters when compatible. | `manual:file` | Unsupported. | Needs source-edit persistence and compatibility checks. |
| Load ECG file | Replaces measured ECG shown in Leads; reload restores original measured ECG. | `manual:file` | Unsupported. | Needs ECG import format and measured/simulated signal model. |
| Export directory | Exports relevant case parts into a directory structure. | `manual:file`, `export:attempt` | Partial; modern subset writer exists and the normal male legacy raw export is captured. | Future export writer should mirror supported structure and document gaps. |
| Export ECG files | Writes `.refECG` and `.adaptECG` matrices at 1000 Hz under `ecgs/`. | `manual:file` | Unsupported. | Needed for numerical parity. |
| Export triangulation files | Writes atria/ventricles, thorax, lungs, and blood-cavity geometry under `model/`. | `manual:file` | Partial readers exist for `.tri`, but no export writer. | Need case-contained geometry parser before full parity. |
| Export source parameters | Writes adapted source vectors per atrial/ventricular beat: `.user.dep`, `.user.rep`, `.user.ampl`, `.user.rest`, `.user.depslope`, `.user.repslope`, `.user.platslope`. | `manual:file` | Unsupported writer; partial vector reader exists. | Critical for edit parity and legacy comparison. |
| Export TMP waveforms | Writes per-beat `.user.source` matrix for user-adapted TMP waveforms. | `manual:file`, `export:normal-male-ecgsim301` | Unsupported writer; captured legacy fixture exists. | Used to calibrate the task `0049` TMP generator; modern writer still missing. |
| Export electrode locations | Writes `.elec` files for each lead system. | `manual:file` | Unsupported. | Needed for lead-system and thorax electrode parity. |

## Heart View

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Geometry and surface functions | Displays atrial or ventricular heart geometry and surface functions. | `manual:heart`, `screenshot:main` | Partial: renders archived heart geometry and a simple selection overlay. | Need real case geometry and surface-function coloring. |
| Rotate/AP reset | Right-drag rotates; double-click restores standard AP view. | `manual:heart`, `manual:basic` | Partial: auto-rotation; no user drag/AP reset. | Add explicit interaction tests. |
| Cross plane | Shift + mouse wheel or Shift + arrow keys moves a planar cut through myocardium. | `manual:heart` | Unsupported. | Needs geometry clipping and keyboard focus handling. |
| Select node | Left click selects nearest heart-surface node; selection drives TMP view. | `manual:heart`, `manual:basic` | Partial: click selects a rendered geometry node and updates TMP selection. | Current geometry node count does not match source vector count; real mapping needed. |
| Radius/selected zone | Radius changes by mouse mode, wheel, or arrow keys in 2 mm steps; contours every 10 mm. | `manual:heart` | Partial: slider changes hard-radius region; no 10 mm contour rings. | Transition zone behavior is separate. |
| Probe mode | Shows TMP at selected position or sensitivity map for selected node in Thorax. | `manual:heart` | Unsupported. | Requires sensitivity map/transfer data and UI mode. |
| Foci edit mode | Opens foci edit view; selected heart node can become activation focus. | `manual:heart`, `manual:focus` | Unsupported. | Scientific and UI task; activation payload parsing required. |
| Atria/ventricles source switch | Switches active source when case has both; changes TMP view. | `manual:heart` | Unsupported. | Requires source inventory per case. |
| Initial/adapted display | Heart can display initial or adapted parameter values; initial mode disables left mouse editing. | `manual:heart` | Partial: TMP plot shows initial/adapted; Heart does not switch surface-function state. | Needed for visual parity. |
| Depolarization surface function | Colors depolarization times; editable through TMP interaction. | `manual:heart` | Unsupported. | Requires surface-function colormap. |
| Repolarization surface function | Colors repolarization times. | `manual:heart` | Unsupported. | Same as above. |
| ARI surface function | Colors activation recovery interval. | `manual:heart` | Unsupported. | Requires computed `rep - dep`. |
| Amplitude surface function | Colors TMP amplitude. | `manual:heart` | Unsupported. | Requires parameter colormap. |
| Resting-potential surface function | Colors TMP resting potential. | `manual:heart` | Unsupported. | Requires parameter colormap. |
| TMP-at-time surface function | Colors heart by TMP at selected time. | `manual:heart` | Unsupported. | Requires shared time cursor and generated/stored TMP matrices. |
| Geometry/nodes function | Shows geometry and selectable node positions. | `manual:heart` | Partial: mesh visible, nodes not generally visible. | Need node overlay mode. |
| Heart contribution map | Shows heart contribution to a selected thorax point; needs selected thorax node. | `manual:heart` | Unsupported. | Requires thorax node selection and transfer data. |
| Potential field strength | Shows potential field strength on heart. | `manual:heart` | Unsupported. | Data/equation source still needs confirmation. |
| Endocardial/epicardial switch | Converts selected node between corresponding endocardial and epicardial node. | `manual:heart` | Unsupported. | Requires wall-side mapping. |
| Transmural toggle | Treats selected node as transmural or not. | `manual:heart` | Unsupported. | Requires transmural mapping and edit semantics. |
| Accumulation modes | Supports selecting new area with previous settings, resetting previous area, expanding area, or adapting separate regions. | `manual:heart` | Unsupported. | Current app only edits current selected region. |
| Heart vector | Shows/hides heart-vector path and current time arrow; also shows thorax vector and disables other surface functions while active. | `manual:heart` | Unsupported. | Needs vector computation/data and shared time. |
| Electrode visibility | Shows selected lead-system electrode positions in Heart and Thorax. | `manual:heart`, `manual:thorax` | Unsupported. | Requires parsed electrodes. |
| Clipboard copy | Copies Heart pane image via Edit -> Copy -> Heart or Ctrl+C when mouse is in pane. | `manual:heart`, `manual:clipboard` | Unsupported. | Browser image export can cover this. |
| Movie | Shows activation/time development as a movie. | `manual:heart`, `manual:thorax` | Unsupported. | Requires time cursor/playback and map frames. |

## Thorax View

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Geometry display | Displays thorax geometry, heart, and lungs. | `manual:thorax`, `screenshot:main` | Partial: renders thorax and lungs, not embedded heart context. | Add heart context and real case geometry. |
| Rotate/AP reset | Right-drag rotates; left double-click restores AP view. | `manual:thorax`, `manual:basic` | Partial: auto-rotation; no user drag/AP reset. | Same camera controls as Heart. |
| Select thorax node | Available for single-lead ECG or contribution map; left click selects nearest thorax node. | `manual:thorax` | Unsupported. | Needed for single thorax-node leads and contribution maps. |
| Surface function: default geometry | Shows semi-transparent thorax with same heart surface function and lungs by default. | `manual:thorax` | Partial. | Needs linked heart function and transparency mode. |
| Surface function: measured BSPM | Displays measured Body Surface Potentials Map. | `manual:thorax` | Unsupported. | Requires parsed measured surface potentials. |
| Surface function: initial BSPM | Displays simulated BSPM with initial parameters. | `manual:thorax` | Unsupported. | Requires recompute or parsed initial matrices. |
| Surface function: adapted BSPM | Displays simulated BSPM with adapted parameters. | `manual:thorax` | Unsupported. | Requires recompute pipeline. |
| Surface function: sensitivity map | Shows sensitivity map for probed heart point. | `manual:thorax` | Unsupported. | Requires probe mode and transfer matrix visualization. |
| Time stepping | Left/right arrow steps BSPM time; clicking TMP or ECG selects map time. | `manual:thorax` | Unsupported. | Requires shared time cursor. |
| Show/hide lungs | Menu toggles lungs. | `manual:thorax` | Supported prototype: checkbox toggles lungs. | Menu parity still missing. |
| Show/hide electrodes | Shows electrodes on thorax and heart. | `manual:thorax` | Unsupported. | Requires parsed electrodes. |
| Lock to heart | Links heart and thorax orientation/rotation. | `manual:thorax` | Unsupported. | Requires shared camera/orientation state. |
| Scale | Mouse wheel or arrows change amplitude scale after thorax focus. | `manual:thorax` | Unsupported. | Needed for map scale parity. |
| Movie | Plays time development of potentials/activation; loops over shown ECG signal interval. | `manual:thorax` | Unsupported. | Requires linked playback. |
| Isofunction display | Preferences can draw only iso function lines rather than full colormap. | `manual:thorax`, `manual:options` | Unsupported. | Map renderer should support both modes. |
| Clipboard copy | Copies Thorax pane image via Edit -> Copy -> Thorax or Ctrl+C. | `manual:thorax`, `manual:clipboard` | Unsupported. | See visual export tasks. |

## TMP View

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Selected-node TMP display | Shows initial trace in white and user-adapted trace in red for selected heart node. | `manual:tmp` | Partial: plots initial/adapted traces for selected/default nodes. | Colors and exact single-node emphasis differ. |
| Parameter handlers | TMP waveform changes by dragging triangular parameter handlers. | `manual:tmp` | Partial: numeric input/dropdown edits parameters. | Need handler-style interaction for parity or documented modern alternative. |
| Timing/amplitude parameters | Supports depolarization time, repolarization time, resting potential, and amplitude. | `manual:tmp` | Partial: editable numeric controls exist. | Needs legacy constraints/handlers. |
| Slope parameters | Supports plateau slope and repolarization slope with plateau <= repolarization constraint. | `manual:tmp` | Partial: editable numeric controls and constraint enforcement exist for edits. | Exact waveform behavior still provisional. |
| Initial/adapted handler reset | Double-clicking a handler resets selected parameter to initial value. | `manual:tmp` | Partial: Reset parameter button exists. | Need double-click/handler parity if implemented. |
| Reset beat | Resets all parameter changes for selected beat and active atria/ventricles. | `manual:tmp` | Partial: Reset beat resets fixture edit state. | Needs real beat/source scope. |
| Time bar | Yellow time bar corresponds to Leads selected time; click/drag changes time. | `manual:tmp`, `manual:leads` | Unsupported. | Shared time cursor task. |
| Interval highlight | Leads interval selection lightens non-selected parts in TMP. | `manual:leads` | Unsupported. | Needs interval model. |
| Grid display | Preferences control TMP grid; grid auto-hides if view is too small. | `manual:tmp`, `manual:options` | Unsupported. | Plot rendering option. |
| Combined resting/amplitude handlers | Preference combines resting potential and amplitude handlers. | `manual:options` | Unsupported. | Needs handler implementation. |
| Keep constant APD option | Preference determines whether repolarization shifts when depolarization shifts. | `manual:options` | Unsupported. | Needs edit semantics. |
| Show/hide electrogram | ECG menu/toolbutton shows electrogram for selected heart node in TMP pane. | `manual:tmp`, `manual:leads` | Unsupported. | Requires electrogram data/derivation. |
| Clipboard copy | Copies TMP pane image via TMP menu or Ctrl+C. | `manual:tmp`, `manual:clipboard` | Unsupported. | See visual export tasks. |

## Leads / ECG View

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Lead systems | Displays standard 12-lead, Frank VCG, 64-lead BSPM, minimap montage, and single thorax-node lead when present in case. | `manual:leads` | Partial: metadata lists systems; plot shows representative thorax-node traces only. | Lead-system parser and switcher required. |
| Signal overlays | Can superpose measured ECG, simulated initial ECG, simulated adapted ECG, selected-node electrogram, and RMS. | `manual:leads` | Unsupported. | Requires signal classification and controls. |
| Coupling/filtering | Baseline correction, AC coupling, and DC coupling. | `manual:leads` | Partial: implemented selector with approximate baseline fallback. | Exact fiducial behavior unknown. |
| Time bar | Yellow vertical line indicates selected time; click/drag changes time. | `manual:leads` | Unsupported. | Shared time cursor task. |
| Arrow-key time stepping | Left/right arrows change selected time in 2 ms steps. | `manual:leads` | Unsupported. | Requires keyboard focus and time state. |
| Beat zoom | Double-click zooms to desired atrial/ventricular beat; double-click restores all beats. | `manual:leads` | Unsupported. | Requires beat inventory and plot interval model. |
| Interval selection | Selected interval is mirrored in TMP pane. | `manual:leads` | Unsupported. | Needs linked interval state. |
| VCG display | Frank VCG shows projections of 3D vector loop on three thorax cross sections. | `manual:leads` | Unsupported. | Requires VCG lead data and plot mode. |
| Scale | Mouse wheel changes amplitude scale. | `manual:leads` | Unsupported. | Current plots autoscale per trace. |
| Grid display | Preferences control grid, with auto-hide when small. | `manual:leads`, `manual:options` | Unsupported. | Plot rendering option. |
| Clipboard copy | Copies Leads pane image via Edit -> Copy -> ECG or Ctrl+C. | `manual:leads`, `manual:clipboard` | Unsupported. | See visual export tasks. |

## Tools, Focus, And Preferences

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Dockable Tools view | Opened from Options -> Tools; can dock left/right or float. | `manual:tools` | Unsupported. | Modern UI may use panels instead of dockable windows. |
| Standard orientation tools | Tools tab provides AP, PA, superior-inferior, inferior-superior, store current view, restore stored view. | `manual:tools` | Unsupported. | Needed for Heart/Thorax view parity. |
| Create rhythm | Adds multiple atrial/ventricular activations up to 10 seconds. | `manual:tools` | Unsupported. | Requires multi-beat source model. |
| Global TMP timing statistics | Shows timing statistics and supports scaling/shifting source timing while retaining distribution pattern. | `manual:tools` | Unsupported. | Requires source parameter model and validation. |
| Global TMP shape adjustments | Globally adapts other TMP shape parameters. | `manual:tools` | Unsupported. | Requires edit transaction model. |
| Timing supervision | Prevents invalid timing values such as depolarization before 0 ms or ARI below 50 ms. | `manual:tools` | Unsupported. | Add validation when global edits exist. |
| Transition zone editor | Modifies taper slope from 100% at selected node to zero at selected-area boundary. | `manual:tools` | Unsupported. | Needed for source editing parity. |
| Foci edit dock | Dockable view assigns selected nodes as foci and controls activation parameters. | `manual:focus` | Unsupported. | Requires activation parsing/simulation. |
| Focus opposite wall | Focus can use node on opposite wall to model intramural activation. | `manual:focus` | Unsupported. | Requires wall mapping. |
| Focus propagation velocity | Supports construction/manipulation modes and local/global propagation velocity changes. | `manual:focus` | Unsupported. | Requires graph/activation model. |
| Global repolarization | Recomputes repolarization with heuristic ARI relation. | `manual:focus` | Unsupported. | Needs equations and parity data. |
| Preferences modal | Preferences are modal and block rest of app. | `manual:options` | Unsupported. | Modern app may prefer non-modal settings; parity matrix should decide. |
| Color scale preferences | Separate scales for timing, potential, and TMP functions. | `manual:options` | Unsupported. | Needed for map/surface views. |
| Thorax isofunction preference | Toggles line-only vs colormap potential/sensitivity drawing. | `manual:options` | Unsupported. | Map renderer feature. |
| Arc ball rotation preference | Listed as future/unavailable in manual. | `manual:options` | Deferred by legacy itself. | Do not prioritize unless user wants it. |

## Clipboard And Visual Output

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| Pane image copy | Ctrl+C copies the active pane image; Edit -> Copy offers per-pane choices. | `manual:clipboard`, view manuals | Unsupported. | Browser can support download/copy image for canvases. |
| App must remain open for paste | Legacy clipboard data requires app running until paste. | `manual:clipboard` | Not applicable yet. | Modern clipboard behavior may differ; document it when implemented. |
| Movie output | Manuals mention movie option for Heart/Thorax time development. | `manual:heart`, `manual:thorax` | Unsupported. | Need to confirm whether legacy saves movies or only plays them. |

## Help, About, References, And Updates

| Feature | Legacy behavior | Evidence | Current modern status | Parity notes |
| --- | --- | --- | --- | --- |
| About/version discovery | User can determine current version from Help -> About. | `manual:basic` | Unsupported. | Modern app should expose app/version/build data before packaged release. |
| Check for updates | Windows Help menu has Check for updates; OS X application menu also exposes update checking. Status messages appear in bottom-left; update may close ECGSIM. | `manual:update` | Unsupported. | Probably replaced by release notes/auto-update strategy in packaged app. |
| Standalone updater | Legacy package includes standalone ECGsimUpdater application. | `manual:update` | Unsupported. | Only relevant if desktop packaging adds auto-update. |
| Download case files link | Help/application menu can open ECGSIM website case download location. | `manual:file` | Unsupported. | Modern app can provide a docs/link action once external source policy is decided. |
| References/publications | Manual contains scientific reference list for ECGSIM, transfer matrix, depolarization, repolarization, and education/research use. | `manual:references` | Partial: source papers are archived under `research/`; no app Help view. | Modern docs/app should expose scientific references and validation status. |

## Current Screenshot Baseline

The captured legacy screenshot proves the initial normal-male view includes:

- A top toolbar and menu area.
- Heart pane with colored activation/depolarization-style surface map.
- Thorax pane with a semi-transparent torso/lung/heart-like view.
- Lower-left TMP pane.
- Lower-right ECG/Leads pane with 12-lead style traces.

Evidence: `screenshot:main`.

## Unknowns Requiring More Evidence

- Exact menu hierarchy and toolbar icon set in ECGSIM 3.0.1.
- Exact raw export output for current Windows app, because automated `File -> Export` terminates before folder selection in this environment.
- Exact TMP waveform generator and slope units.
- Exact baseline fiducial detection/interpolation behavior.
- Exact `.ECGsimcase` object layout for geometry, source, activation, lead, and fiducial payloads.
- Exact behavior of movie output beyond playback controls.
- Exact saved-case/write-back semantics and compatibility guarantees.
- Exact Help/About menu contents and version/update behavior in ECGSIM 3.0.1 require live app confirmation.
