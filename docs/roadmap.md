# Roadmap

## M0: Research Archive

Status: mostly complete.

Deliverables:

- Website/manual/paper/case archive.
- Download manifest and checksums.
- Development notes.

## M1: Data Inventory And Parsers

Goal: understand and read the legacy data.

Tasks:

- Inspect `.ECGsimcase` structure.
- Document case file schema.
- Port or replace `loadmat.m`, `loadtri.m`, and `readECGsim.m`.
- Implement readers for matrix, ASCII vector, `.tri`, `.tra`, electrode, ECG, and source-parameter data.
- Add fixture tests using small extracted examples.

Exit criteria:

- A command can load at least `normal_male2.ECGsimcase` and print model/signal metadata.
- Geometry node/triangle counts and signal dimensions are covered by tests.

## M2: Read-Only Viewer

Goal: visually inspect legacy cases.

Tasks:

- Render heart geometry.
- Render thorax/lungs/electrodes.
- Plot ECG lead signals.
- Plot TMP waveform for a selected node.
- Add basic time selection shared across plots/maps.

Exit criteria:

- A user can open a legacy case and inspect the four core views without editing data.

## M3: Legacy Parity Harness

Goal: compare the modern implementation against the original Windows app.

Tasks:

- Export reference data from the legacy app.
- Capture baseline screenshots for known cases.
- Define numerical and visual tolerances.
- Add regression tests for parsed/exported values.

Exit criteria:

- Differences between legacy and modern outputs are measurable and documented.

## M4: Parameter Editing

Goal: support source inspection and controlled adaptation.

Tasks:

- Select heart nodes and regions.
- Adjust TMP timing/amplitude/slope parameters.
- Reset beat or selected parameter.
- Compare initial vs adapted data in plots.

Exit criteria:

- Simple edits update TMP and relevant displayed data predictably.

## M5: Simulation/Recomputation

Goal: recompute ECG/body-surface potentials from adapted source data.

Tasks:

- Implement or port TMP generation.
- Apply transfer functions.
- Support filtering/coupling modes.
- Validate against legacy exports.

Exit criteria:

- Known adaptations reproduce legacy behavior within documented tolerances.

## M6: Product Polish

Goal: package a maintainable app.

Tasks:

- Modern navigation and controls.
- Documentation and examples.
- Cross-platform packaging.
- Performance tuning for large cases.

Exit criteria:

- The app is usable by someone who has not read the legacy manual.
