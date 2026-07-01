# Modernization Roadmap

Status: active roadmap. The feature-parity task list through `0061` is complete. This roadmap turns the remaining known gaps into the next task queue, focused on making ECGSIM useful as a modern web-capable scientific application while continuing to improve beyond the legacy app where evidence supports it.

## Goal

Move from parity-oriented prototype to a broadly usable modern ECGSIM:

- Open more real cases directly in the app, including arbitrary user-selected `.ECGsimcase` files where practical.
- Recompute TMP, ECG, BSPM, sensitivity, and contribution views from edited source data with documented numerical evidence.
- Fill remaining legacy workflow gaps such as ARI/TMP-at-time surfaces, isofunction contours, focus tools, richer import/export, movie export, and in-app help.
- Add new captures and tests only when they make scientific behavior more verifiable.
- Keep every new capability documented with limitations, tolerances, and repeatable verification.

## Current Starting Point

- Python parsing, generated viewer bundles, source editing, sidecars, export subset, PNG export, app tests, packaging checks, and numerical fixture harnesses exist.
- The viewer loads generated bundles for `normal_male2` and `WPW_ectopicbeat`, not arbitrary browser-side `.ECGsimcase` files.
- TMP generation is calibrated against one normal male ECGSIM 3.0.1 legacy export.
- Filtering modes are tested against promoted `standard_12.adaptECG`; decoded P/T fiducials remain unavailable in `.ECGsimcase`.
- Adapted Thorax BSPM recomputation exists for a shape-matched transfer candidate, but lead ECG recomputation, initial/adapted BSPM parity, sensitivity maps, and contribution maps remain incomplete.
- Full legacy export-directory parity, `.ECGsimsource` interchange, ECG import, movie export, in-app help, visual regression, and signed release delivery remain incomplete.

## NF1: Browser-Native Case Loading

Goal: reduce dependence on pre-generated bundles while preserving parser correctness.

Exit criteria:

- The app can open additional supported cases through a documented browser/runtime path.
- Unsupported payloads fail with useful user-facing diagnostics and developer-facing evidence.
- Bundle generation and browser parsing share schema contracts.

Tasks:

- `0062` Design Browser Case Loading Boundary.
- `0063` Implement Browser Case Bundle Import Path.
- `0064` Add WPW Variant Viewer Fixtures.
- `0065` Add Case Validation And Error Reporting UI.

## NF2: Recomputed Scientific Outputs

Goal: make edited source data drive all scientific views that users expect.

Exit criteria:

- Lead ECG, BSPM, sensitivity, and contribution outputs update from edited source data where transfer data supports it.
- Fiducial handling is decoded or documented with stronger evidence.
- Numerical parity tests cover every recomputed output that has a legacy reference.

Tasks:

- `0066` Wire Lead ECG Recompute Path.
- `0067` Implement Initial Adapted And Sensitivity BSPM Modes.
- `0068` Decode Or Derive Case Fiducials.
- `0069` Capture Additional Numerical Parity Scenarios.
- `0070` Implement Focus Editing Workflow.

## NF3: Visualization And Workflow Depth

Goal: close important visual and interaction gaps in the four primary workspaces.

Exit criteria:

- Heart and Thorax expose the remaining high-value legacy functions.
- Time-linked views make edited output differences inspectable.
- Visual tests catch broken rendering without claiming false scientific parity.

Tasks:

- `0071` Implement ARI And TMP At Time Heart Surfaces.
- `0072` Implement Isofunction Contours And Colormap Parity.
- `0073` Implement Thorax Probe Contribution Views.
- `0074` Expand Linked Time And Playback Coverage.

## NF4: Import Export And Interoperability

Goal: make ECGSIM useful in existing research workflows and improve on legacy export limitations.

Exit criteria:

- Modern exports include the highest-value legacy artifacts that can be generated honestly.
- Source and ECG interchange workflows are tested.
- Compatibility with documented MATLAB/readECGsim paths is smoke-tested where possible.

Tasks:

- `0075` Implement ECGsimsource Import Export.
- `0076` Expand Legacy Export Directory Writer.
- `0077` Implement ECG Signal Import.
- `0078` Add MATLAB ReadECGsim Compatibility Smoke Tests.

## NF5: Product Experience And Release Hardening

Goal: make the application easier to trust, distribute, and inspect.

Exit criteria:

- Help/reference material is available in-app.
- Visual and movie exports cover expected teaching workflows.
- Release checks exercise representative workflows on packaged builds.

Tasks:

- `0079` Add In App Help About And References.
- `0080` Implement Movie Export.
- `0081` Add Legacy Visual Regression Harness.
- `0082` Harden Signed Release Pipeline.

## Development Rule

Each task should finish with:

- Relevant docs updated.
- Automated verification where possible.
- A focused commit.
- Push to `main` following the established project process.
