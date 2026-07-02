# Task Index

These task descriptions split the roadmap into agent-sized units. Start with the lowest unfinished task number unless the user explicitly chooses a different one.

Tasks `0001` through `0025` completed the initial prototype roadmap. Tasks `0026` through `0061` follow the feature-parity roadmap in `docs/feature-parity-roadmap.md`. Tasks `0062` through `0082` follow the modernization roadmap in `docs/modernization-roadmap.md`. Tasks `0083` and later follow the visualization feature-parity roadmap in `docs/visualization-feature-parity-roadmap.md`.

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

## NF1: Browser-Native Case Loading

- [x] [0062 Design Browser Case Loading Boundary](0062-design-browser-case-loading-boundary.md)
- [x] [0063 Implement Browser Case Bundle Import Path](0063-implement-browser-case-bundle-import-path.md)
- [x] [0064 Add WPW Variant Viewer Fixtures](0064-add-wpw-variant-viewer-fixtures.md)
- [x] [0065 Add Case Validation And Error Reporting UI](0065-add-case-validation-and-error-reporting-ui.md)

## NF2: Recomputed Scientific Outputs

- [x] [0066 Wire Lead ECG Recompute Path](0066-wire-lead-ecg-recompute-path.md)
- [x] [0067 Implement Initial Adapted And Sensitivity BSPM Modes](0067-implement-initial-adapted-and-sensitivity-bspm-modes.md)
- [x] [0068 Decode Or Derive Case Fiducials](0068-decode-or-derive-case-fiducials.md)
- [x] [0069 Capture Additional Numerical Parity Scenarios](0069-capture-additional-numerical-parity-scenarios.md)
- [x] [0070 Implement Focus Editing Workflow](0070-implement-focus-editing-workflow.md)

## NF3: Visualization And Workflow Depth

- [x] [0071 Implement ARI And TMP At Time Heart Surfaces](0071-implement-ari-and-tmp-at-time-heart-surfaces.md)
- [x] [0072 Implement Isofunction Contours And Colormap Parity](0072-implement-isofunction-contours-and-colormap-parity.md)
- [x] [0073 Implement Thorax Probe Contribution Views](0073-implement-thorax-probe-contribution-views.md)
- [x] [0074 Expand Linked Time And Playback Coverage](0074-expand-linked-time-and-playback-coverage.md)

## NF4: Import Export And Interoperability

- [x] [0075 Implement ECGsimsource Import Export](0075-implement-ecgsimsource-import-export.md)
- [x] [0076 Expand Legacy Export Directory Writer](0076-expand-legacy-export-directory-writer.md)
- [x] [0077 Implement ECG Signal Import](0077-implement-ecg-signal-import.md)
- [x] [0078 Add MATLAB ReadECGsim Compatibility Smoke Tests](0078-add-matlab-read-ecgsim-compatibility-smoke-tests.md)

## NF5: Product Experience And Release Hardening

- [x] [0079 Add In App Help About And References](0079-add-in-app-help-about-and-references.md)
- [x] [0080 Implement Movie Export](0080-implement-movie-export.md)
- [x] [0081 Add Legacy Visual Regression Harness](0081-add-legacy-visual-regression-harness.md)
- [x] [0082 Harden Signed Release Pipeline](0082-harden-signed-release-pipeline.md)

## VF0: Visual Inventory And Evidence

- [x] [0083 Create Visualization Feature Parity Matrix](0083-create-visualization-feature-parity-matrix.md)
- [x] [0084 Add Visual Mode Test Coverage Map](0084-add-visual-mode-test-coverage-map.md)

## VF1: Visual-First Workspace

- [x] [0085 Make Core Visual Workspace Prominent](0085-make-core-visual-workspace-prominent.md)
- [x] [0086 Add Pane Mode Badges And Data Provenance Labels](0086-add-pane-mode-badges-and-data-provenance-labels.md)
- [x] [0087 Add Visual Mode Navigator](0087-add-visual-mode-navigator.md)

## VF2: Heart View Completeness

- [x] [0088 Add Heart Node Overlay And Selection Rings](0088-add-heart-node-overlay-and-selection-rings.md)
- [x] [0089 Add Heart Cross Section Plane Prototype](0089-add-heart-cross-section-plane-prototype.md)
- [x] [0090 Add Heart Electrode And Vector Overlays](0090-add-heart-electrode-and-vector-overlays.md)
- [ ] [0091 Expand Heart Surface Mode Tests Across Initial Adapted And Time](0091-expand-heart-surface-mode-tests-across-initial-adapted-and-time.md)

## VF3: Thorax View Completeness

- [ ] [0092 Add Thorax Heart Context Overlay](0092-add-thorax-heart-context-overlay.md)
- [ ] [0093 Add Thorax Line Only Isofunction Mode](0093-add-thorax-line-only-isofunction-mode.md)
- [ ] [0094 Add Thorax Lock To Heart Orientation](0094-add-thorax-lock-to-heart-orientation.md)
- [ ] [0095 Expand Thorax Probe And Electrode Target Workflows](0095-expand-thorax-probe-and-electrode-target-workflows.md)

## VF4: TMP And ECG View Completeness

- [ ] [0096 Add TMP Handler Style Visual Controls](0096-add-tmp-handler-style-visual-controls.md)
- [ ] [0097 Add Leads Interval Selection And TMP Highlight](0097-add-leads-interval-selection-and-tmp-highlight.md)
- [ ] [0098 Add Beat Zoom Workflow](0098-add-beat-zoom-workflow.md)
- [ ] [0099 Add VCG Visualization Mode](0099-add-vcg-visualization-mode.md)
- [ ] [0100 Add Electrogram Visualization Or Evidence Blocker](0100-add-electrogram-visualization-or-evidence-blocker.md)

## VF5: Validation And Reference Capture

- [ ] [0101 Add Per Mode Canvas Smoke Tests](0101-add-per-mode-canvas-smoke-tests.md)
- [ ] [0102 Capture Curated Legacy Pane References](0102-capture-curated-legacy-pane-references.md)
- [ ] [0103 Add Visual Parity Completion Audit](0103-add-visual-parity-completion-audit.md)
