# Feature Parity Roadmap

Status: active roadmap. Tasks through productization have produced a usable parity-oriented viewer, import/export tooling, tests, packaging checks, and documentation. The first normal male ECGSIM 3.0.1 raw export capture is available, and TMP generation is now calibrated against it; recomputation, fiducials/filtering, and broader numerical parity remain the high-risk work.

## Goal

Bring the modern ECGSIM app to practical feature parity with the legacy Windows/macOS ECGSIM application while keeping scientific behavior testable and source-attributed.

Feature parity means:

- Users can open real legacy `.ECGsimcase` files, not only bundled fixtures.
- The four primary legacy workspaces are recognizable and useful: Heart, Thorax, TMP, and ECG/Leads.
- Source selection, source editing, recomputation, and reset workflows behave like the legacy app where known.
- ECG, BSPM, TMP, transfer, filtering, and export outputs are validated against legacy references.
- Unsupported legacy behavior is either implemented, explicitly deferred, or documented with a reason.

## Current State

The feature-parity roadmap has moved beyond the initial prototype:

- Python readers, a normalized case model, and manifest generation support the archived normal and WPW cases.
- The browser viewer loads generated case bundles for `normal_male2` and `WPW_ectopicbeat`.
- Heart, Thorax, TMP, and Leads workspaces expose linked time state, playback, source selection, editing, lead switching, surface maps, and view-specific controls.
- Source edits can be saved locally, exported/imported as sidecar files, and written to a supported modern export directory subset.
- Visual PNG exports, workflow tests, performance profiling, static packaging, release validation, and user documentation are in place.

Major gaps:

- Raw legacy export capture exists for the ECGSIM 3.0.1 normal male case, including `.user.source`, `.adaptECG`, `.refECG`, and source-parameter vectors. Additional cases and edited workflows are still needed for broad parity.
- The browser viewer does not yet parse arbitrary user-provided `.ECGsimcase` files directly; it consumes generated bundles for supported cases.
- ECG/BSPM recomputation after source edits is not wired into the viewer with verified legacy-equivalent behavior.
- TMP generation is calibrated against the promoted normal male `.user.source` fixture; fiducial and filtering parity remains unverified.
- Legacy `.ECGsimcase` write-back, `.ECGsimsource` interchange, ECG import, full legacy export-directory reproduction, movie export, and signed native installers remain unsupported or deferred.

Currently unfinished or scientifically blocked tasks:

- `0048` Capture Raw Legacy Exports For Numerical Parity: completed for the ECGSIM 3.0.1 normal male case with committed manifests and promoted numerical fixtures.
- `0049` Implement Legacy TMP Generator Parity: completed for the promoted `normal-male-ecgsim301` `.user.source` fixture with documented residuals.
- `0051` Wire Recompute Pipeline Into Viewer: completed for adapted Thorax BSPM using a shape-matched ventricles-to-thorax transfer candidate; lead ECG recomputation remains downstream of filtering/fiducial parity.
- `0052` Implement Fiducial And Filtering Parity: partially implemented and instrumented; ECG export fixtures are now available, but P/T fiducial semantics still need resolution.
- `0053` Expand Numerical Parity Harness: comparison tooling and promoted legacy fixtures exist; scenario-level assertions remain to be added.

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
