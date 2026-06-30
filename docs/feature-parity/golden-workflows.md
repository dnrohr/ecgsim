# Golden Workflows

Status: initial feature-parity workflows. These are test targets, not claims of current support.

## Reference Cases

| Case | Path | Role |
| --- | --- | --- |
| Normal male legacy screenshot case | `ECGsim-3.0.1/cases/normal_male.ECGsimcase` | Native-app screenshot and visual reference only; app binary/case directory remains ignored. |
| Normal male archived source case | `research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase` | Primary modern fixture and first loader/parity case. |
| WPW bundle-only | `research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase` | Multi-case parser and activation variant reference. |
| WPW ectopic beat | `research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase` | Beat/focus workflow reference. |
| WPW fusion beat | `research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase` | Fusion/variant workflow reference. |

## Workflow Table

| ID | Name | Starting file | Actions | Expected outputs | Validation method | Current blocker |
| --- | --- | --- | --- | --- | --- | --- |
| GW-001 | Open normal case and inspect workspace | `normal_male2.ECGsimcase`; legacy screenshot `normal-male-main-window.png` | Launch app, load the normal case, inspect Heart, Thorax, TMP, and Leads panes. | Case metadata appears; four primary workspaces are visible; heart/thorax geometry, TMP traces, and ECG traces are nonblank. | Browser workflow test plus screenshot review against `research/legacy-exports/screenshots/normal-male-main-window.png`. | App shell is prototype-only. |
| GW-002 | Open WPW variants | `WPW_Bundleonly.ECGsimcase`, `WPW_ectopicbeat.ECGsimcase`, `WPW_fusionbeat.ECGsimcase` | Use Open case for each WPW file and switch between them without reload. | Case identity, geometry counts, source/beat metadata, and available lead systems update for each file. | Parser regression tests for case metadata plus browser file-open workflow test. | Real case object model and browser loader are missing. |
| GW-003 | Select heart node and review TMP | `normal_male2.ECGsimcase` | Click a heart node, adjust selection radius, inspect selected region and TMP plot. | Selected node/region changes in Heart; TMP plot follows the selected source node; invalid selections report status. | Browser interaction test using visible selected node text and nonblank TMP plot; future numeric check against parsed source parameters. | Real source-node mapping is incomplete. |
| GW-004 | Edit TMP parameter and reset | `normal_male2.ECGsimcase` | Select a node/region, edit depolarization time and amplitude, apply, reset parameter, then reset beat. | Adapted TMP changes after apply; selected parameter reset restores that parameter; reset beat restores all adapted parameters. | Unit tests for edit model plus browser workflow test checking changed/restored values and traces. | Current generator is provisional and not legacy-parity-tested. |
| GW-005 | Switch heart surface functions | `normal_male2.ECGsimcase` | Switch Heart among geometry, depolarization, repolarization, ARI, amplitude, resting potential, and TMP-at-time functions. | Surface coloring and legends update; initial/adapted state is clear; selected node remains stable. | Browser visual/state test plus parser checks for source parameter arrays. | Surface-function renderer and real source arrays are missing. |
| GW-006 | Navigate thorax BSPM maps | `normal_male2.ECGsimcase` | Switch Thorax among geometry, measured BSPM, initial BSPM, adapted BSPM, sensitivity map; step time and play movie. | BSPM/isofunction maps change with time; scale/legend is visible; lungs/electrodes visibility works. | Browser workflow test for map/time changes; future numeric comparison against raw legacy exports. | BSPM matrices, time cursor, and map renderer are missing. |
| GW-007 | Switch lead systems and overlays | `normal_male2.ECGsimcase`; WPW variants | Select standard lead systems, toggle measured/initial/adapted overlays, adjust scale and grid. | Lead labels, traces, overlay visibility, scale, and grid update without changing the selected case. | Parser tests for lead/electrode metadata plus browser plot-state tests. | Lead-system parser and overlay model are missing. |
| GW-008 | Validate coupling and filtering modes | `normal_male2.ECGsimcase` | Toggle Baseline, AC, and DC coupling; inspect fiducial-dependent baseline behavior. | Trace baselines and offsets match documented mode semantics; selected lead and time cursor persist. | Unit tests against parsed/future raw signal fixtures; browser workflow test for visible mode changes. | Legacy fiducial behavior needs raw export evidence. |
| GW-009 | Use linked time cursor | `normal_male2.ECGsimcase` | Drag/step the time cursor in Leads/TMP/Thorax; use arrow keys and playback. | Time marker is synchronized across ECG, TMP, Heart TMP-at-time, and Thorax BSPM views. | Browser workflow test over all panes, including keyboard input. | Shared time state and playback are missing. |
| GW-010 | Probe thorax contribution/sensitivity | `normal_male2.ECGsimcase` | Select a thorax node or electrode, enable probe/sensitivity/contribution display. | Thorax selection is visible; Heart contribution/sensitivity map updates; selected ECG target is identified. | Browser workflow test plus future numeric comparison from transfer matrix data. | Transfer/sensitivity visualization and thorax selection are missing. |
| GW-011 | Create or edit focus/activation | WPW cases | Open Focus tools, inspect or edit activation focus, opposite wall, and propagation velocity where supported. | Focus data is visible/editable; activation/source changes propagate to TMP and ECG after recompute. | Parser tests for activation/focus data plus future recomputation parity test. | Activation object model and focus workflow are missing. |
| GW-012 | Export and reload adapted work | `normal_male2.ECGsimcase` | Make a small TMP edit, export directory, save sidecar/case, reload output, and compare values. | Exported ECG/TMP/source/electrode/triangulation files are present; reloaded adaptation preserves edits. | File-level regression tests, MATLAB/readECGsim compatibility smoke test where possible, and browser save/reload test. | Export writer and persistence model are missing. |
| GW-013 | Copy visual output | `normal_male2.ECGsimcase` | Copy or download Heart, Thorax, TMP, and Leads views; export movie where supported. | Images are nonblank, include current view state, and can be opened outside the app. | Browser download/clipboard test plus image nonblank check. | Clipboard/image/movie export is missing. |
| GW-014 | Open help and references | Any bundled case | Open About, references, case-download link, and validation/status help. | Version/build data, scientific references, source links, and known limitations are visible. | Browser navigation test and docs link check. | Help/reference UI is missing. |

## Promotion Rules

A workflow can become `parity-tested` only when all of these are true:

- The starting case is committed or explicitly documented as an ignored local legacy artifact.
- The action sequence is automated or recorded as a repeatable manual script.
- Expected outputs are stated as observable UI state, file output, or numeric values.
- The validation method identifies the reference artifact and tolerance from `docs/parity.md`.

Until then, workflows should be treated as planning anchors for tasks `0028` through `0061`.
