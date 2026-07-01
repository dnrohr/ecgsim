# Task Index

These task descriptions split the roadmap into agent-sized units. Start with the lowest unfinished task number unless the user explicitly chooses a different one.

Tasks `0001` through `0025` completed the initial prototype roadmap. Tasks `0026` and later follow the feature-parity roadmap in `docs/feature-parity-roadmap.md`.

Each task should end with:

- Relevant docs updated.
- Verification performed and recorded in the final response.
- A focused commit.
- Push to `main` when requested or when following the established project process.

## M1: Data Inventory And Parsers

- [x] [0001 Inspect ECGsimcase Structure](0001-inspect-ecgsimcase-structure.md)
- [x] [0002 Document Legacy Export Formats](0002-document-legacy-export-formats.md)
- [x] [0003 Choose Runtime And Scaffold Parser Package](0003-choose-runtime-and-scaffold-parser-package.md)
- [x] [0004 Implement Matrix And Vector Readers](0004-implement-matrix-and-vector-readers.md)
- [x] [0005 Implement Geometry Reader](0005-implement-geometry-reader.md)
- [x] [0006 Implement ECGsimcase Metadata Loader](0006-implement-ecgsimcase-metadata-loader.md)
- [x] [0007 Add Case Metadata CLI](0007-add-case-metadata-cli.md)

## M2: Read-Only Viewer

- [x] [0008 Select App Stack And Viewer Architecture](0008-select-app-stack-and-viewer-architecture.md)
- [x] [0009 Render Heart Geometry Prototype](0009-render-heart-geometry-prototype.md)
- [x] [0010 Render Thorax Geometry Prototype](0010-render-thorax-geometry-prototype.md)
- [x] [0011 Plot ECG Signals](0011-plot-ecg-signals.md)
- [x] [0012 Plot TMP Waveforms](0012-plot-tmp-waveforms.md)
- [x] [0013 Build Read-Only Case Viewer Shell](0013-build-read-only-case-viewer-shell.md)

## M3: Legacy Parity Harness

- [x] [0014 Capture Legacy Reference Exports](0014-capture-legacy-reference-exports.md)
- [x] [0015 Define Parity Tolerances](0015-define-parity-tolerances.md)
- [x] [0016 Add Regression Fixtures And Checks](0016-add-regression-fixtures-and-checks.md)

## M4: Parameter Editing

- [x] [0017 Design Source Editing Model](0017-design-source-editing-model.md)
- [x] [0018 Implement Node And Region Selection](0018-implement-node-and-region-selection.md)
- [x] [0019 Implement TMP Parameter Editing](0019-implement-tmp-parameter-editing.md)

## M5: Simulation/Recomputation

- [x] [0020 Document Simulation Equations](0020-document-simulation-equations.md)
- [x] [0021 Implement TMP Generation](0021-implement-tmp-generation.md)
- [x] [0022 Apply Transfer Function](0022-apply-transfer-function.md)
- [x] [0023 Implement ECG Filtering Modes](0023-implement-ecg-filtering-modes.md)

## M6: Product Polish

- [x] [0024 Package Examples And User Docs](0024-package-examples-and-user-docs.md)
- [x] [0025 Cross-Platform Packaging Plan](0025-cross-platform-packaging-plan.md)

## FP0: Parity Definition

- [x] [0026 Inventory Legacy UI And Workflows](0026-inventory-legacy-ui-and-workflows.md)
- [x] [0027 Define Feature Parity Matrix And Golden Workflows](0027-define-feature-parity-matrix-and-golden-workflows.md)
- [x] [0028 Expand Legacy Reference Capture Plan](0028-expand-legacy-reference-capture-plan.md)

## FP1: Real Case Loading

- [x] [0029 Design ECGsimcase Object Model](0029-design-ecgsimcase-object-model.md)
- [x] [0030 Parse Case Geometry Objects](0030-parse-case-geometry-objects.md)
- [x] [0031 Parse Source Parameters Beats And Activation Objects](0031-parse-source-parameters-beats-and-activation-objects.md)
- [x] [0032 Parse Lead Systems Electrodes And Signal Metadata](0032-parse-lead-systems-electrodes-and-signal-metadata.md)
- [x] [0033 Build Case Loader API And Fixture Adapter](0033-build-case-loader-api-and-fixture-adapter.md)
- [x] [0034 Implement Real Viewer Case Open](0034-implement-real-viewer-case-open.md)
- [x] [0035 Add Multi-Case Regression Fixtures](0035-add-multi-case-regression-fixtures.md)

## FP2: View Parity

- [x] [0036 Implement Legacy-Inspired App Shell](0036-implement-legacy-inspired-app-shell.md)
- [x] [0037 Implement Heart View Controls](0037-implement-heart-view-controls.md)
- [x] [0038 Implement Thorax View Controls](0038-implement-thorax-view-controls.md)
- [x] [0039 Implement Leads View Controls](0039-implement-leads-view-controls.md)
- [x] [0040 Implement TMP View Controls](0040-implement-tmp-view-controls.md)
- [x] [0041 Add Linked Time Cursor And Playback State](0041-add-linked-time-cursor-and-playback-state.md)
- [x] [0042 Implement Surface Potential Maps And Animation](0042-implement-surface-potential-maps-and-animation.md)
- [x] [0043 Implement Lead System Switching](0043-implement-lead-system-switching.md)

## FP3: Source Editing Parity

- [x] [0044 Implement Selection Modes And Transition Zones](0044-implement-selection-modes-and-transition-zones.md)
- [x] [0045 Implement Endocardial Epicardial And Transmural Mapping](0045-implement-endocardial-epicardial-and-transmural-mapping.md)
- [x] [0046 Implement Accumulation Modes Undo And Redo](0046-implement-accumulation-modes-undo-and-redo.md)
- [x] [0047 Implement Source Edit Persistence Model](0047-implement-source-edit-persistence-model.md)

## FP4: Scientific Recomputation Parity

- [x] [0048 Capture Raw Legacy Exports For Numerical Parity](0048-capture-raw-legacy-exports-for-numerical-parity.md)
- [x] [0049 Implement Legacy TMP Generator Parity](0049-implement-legacy-tmp-generator-parity.md)
- [x] [0050 Implement Activation And Focus Construction](0050-implement-activation-and-focus-construction.md)
- [x] [0051 Wire Recompute Pipeline Into Viewer](0051-wire-recompute-pipeline-into-viewer.md)
- [x] [0052 Implement Fiducial And Filtering Parity](0052-implement-fiducial-and-filtering-parity.md)
- [x] [0053 Expand Numerical Parity Harness](0053-expand-numerical-parity-harness.md)

## FP5: Import Export And Interop

- [x] [0054 Implement Export Directory Writer](0054-implement-export-directory-writer.md)
- [x] [0055 Implement Case Save Or Adaptation Sidecar](0055-implement-case-save-or-adaptation-sidecar.md)
- [x] [0056 Implement Clipboard Image And Movie Exports](0056-implement-clipboard-image-and-movie-exports.md)
- [x] [0057 Document Import Export Compatibility](0057-document-import-export-compatibility.md)

## FP6: Productization

- [x] [0058 Profile And Optimize Large Case Workflows](0058-profile-and-optimize-large-case-workflows.md)
- [x] [0059 Implement Desktop Packaging](0059-implement-desktop-packaging.md)
- [x] [0060 Add End-To-End Release Validation](0060-add-end-to-end-release-validation.md)
- [x] [0061 Update User Documentation For Feature Parity](0061-update-user-documentation-for-feature-parity.md)
