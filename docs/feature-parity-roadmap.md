# Feature Parity Roadmap

Status: new roadmap after completion of the initial prototype roadmap.

## Goal

Bring the modern ECGSIM app to practical feature parity with the legacy Windows/macOS ECGSIM application while keeping scientific behavior testable and source-attributed.

Feature parity means:

- Users can open real legacy `.ECGsimcase` files, not only bundled fixtures.
- The four primary legacy workspaces are recognizable and useful: Heart, Thorax, TMP, and ECG/Leads.
- Source selection, source editing, recomputation, and reset workflows behave like the legacy app where known.
- ECG, BSPM, TMP, transfer, filtering, and export outputs are validated against legacy references.
- Unsupported legacy behavior is either implemented, explicitly deferred, or documented with a reason.

## Current Starting Point

The initial roadmap produced a tested prototype:

- Python readers for selected legacy formats and known `.ECGsimcase` payloads.
- Browser viewer with bundled `normal_male2` fixtures.
- Basic heart/thorax/TMP/leads views.
- Simple region selection and TMP parameter editing.
- Provisional TMP generation, transfer application, filtering helpers, and workflow tests.

Major gaps:

- No full `.ECGsimcase` object-graph parser.
- No arbitrary case loading in the viewer.
- No standard lead-system switching or electrode geometry.
- No real ECG/BSPM recomputation after edits.
- No exact legacy TMP/fiducial/filtering parity.
- No save/export/write-back.
- No desktop packaging.

## FP0: Parity Definition

Goal: turn "feature parity" into an auditable checklist.

Exit criteria:

- Legacy UI/features are inventoried from the original app, manual, screenshots, and exports.
- Every known legacy capability is mapped to a modern status: supported, partial, blocked, or intentionally out of scope.
- Golden workflows and reference cases are selected.

Tasks:

- `0026` Inventory Legacy UI And Workflows.
- `0027` Define Feature Parity Matrix And Golden Workflows.
- `0028` Expand Legacy Reference Capture Plan.

## FP1: Real Case Loading

Goal: replace offset-driven fixtures with a named case model.

Exit criteria:

- The parser can load at least the bundled normal and WPW cases into stable domain objects.
- The viewer can open a real `.ECGsimcase` and render its available geometry/signals.
- Tests cover multiple cases and known unsupported payloads.

Tasks:

- `0029` Design ECGsimcase Object Model.
- `0030` Parse Case Geometry Objects.
- `0031` Parse Source Parameters Beats And Activation Objects.
- `0032` Parse Lead Systems Electrodes And Signal Metadata.
- `0033` Build Case Loader API And Fixture Adapter.
- `0034` Implement Real Viewer Case Open.
- `0035` Add Multi-Case Regression Fixtures.

## FP2: View Parity

Goal: make the modern UI recognizably cover the legacy app's primary views.

Exit criteria:

- Heart, Thorax, TMP, and Leads views expose the key controls and modes used in the legacy app.
- View state is linked through time, selected source nodes, selected leads, and selected thorax/electrode positions.
- Browser workflow tests validate visible state changes for the major controls.

Tasks:

- `0036` Implement Legacy-Inspired App Shell.
- `0037` Implement Heart View Controls.
- `0038` Implement Thorax View Controls.
- `0039` Implement Leads View Controls.
- `0040` Implement TMP View Controls.
- `0041` Add Linked Time Cursor And Playback State.
- `0042` Implement Surface Potential Maps And Animation.
- `0043` Implement Lead System Switching.

## FP3: Source Editing Parity

Goal: reproduce legacy source selection and editing behavior closely enough for scientific workflows.

Exit criteria:

- Node, region, transmural, and wall-side workflows are implemented or explicitly marked unavailable.
- Accumulation modes, reset behavior, and undo/redo are deterministic and tested.
- Editing state survives recomputation and export.

Tasks:

- `0044` Implement Selection Modes And Transition Zones.
- `0045` Implement Endocardial Epicardial And Transmural Mapping.
- `0046` Implement Accumulation Modes Undo And Redo.
- `0047` Implement Source Edit Persistence Model.

## FP4: Scientific Recomputation Parity

Goal: make edited source data recompute TMP, ECG, and BSPM outputs with documented tolerances.

Exit criteria:

- TMP generation matches legacy exports for selected cases within documented tolerance.
- Transfer/recomputation pipeline updates views after edits.
- Filtering/fiducials match legacy behavior or have documented residual error.

Tasks:

- `0048` Capture Raw Legacy Exports For Numerical Parity.
- `0049` Implement Legacy TMP Generator Parity.
- `0050` Implement Activation And Focus Construction.
- `0051` Wire Recompute Pipeline Into Viewer.
- `0052` Implement Fiducial And Filtering Parity.
- `0053` Expand Numerical Parity Harness.

## FP5: Import Export And Interop

Goal: support the file workflows users expect from ECGSIM.

Exit criteria:

- Users can export useful data products from modern ECGSIM.
- Save/write-back behavior is defined, implemented where safe, and tested.
- Clipboard/image/movie outputs cover the highest-value legacy workflows.

Tasks:

- `0054` Implement Export Directory Writer.
- `0055` Implement Case Save Or Adaptation Sidecar.
- `0056` Implement Clipboard Image And Movie Exports.
- `0057` Document Import Export Compatibility.

## FP6: Productization

Goal: turn the parity-capable app into a reliable cross-platform product.

Exit criteria:

- App performance is acceptable on supported cases.
- Releases are packaged, signed/notarized where needed, and documented.
- User docs and tests cover full parity workflows.

Tasks:

- `0058` Profile And Optimize Large Case Workflows.
- `0059` Implement Desktop Packaging.
- `0060` Add End-To-End Release Validation.
- `0061` Update User Documentation For Feature Parity.

## Development Rule

Each task should finish with:

- Updated docs or parity matrix entries.
- Automated verification where possible.
- A focused commit.
- Push to `main` following the established project process.
