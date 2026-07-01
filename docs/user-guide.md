# User Guide

Status: current guide for the modern ECGSIM static viewer, Python tools, and known feature-parity limits.

## What This App Is Today

Modern ECGSIM is currently a static browser viewer plus Python parser/export tools. It can inspect supported legacy case data, render the main ECGSIM workspaces, edit ventricular TMP source parameters in a modern sidecar workflow, export useful data subsets, and validate release candidates.

It is not yet a full scientific replacement for the legacy ECGSIM application. Full TMP generation parity, recomputation after edits, arbitrary browser-side `.ECGsimcase` parsing, and legacy `.ECGsimcase` write-back remain unsupported.

## Install And Run

Install viewer dependencies:

```powershell
npm --prefix app/viewer install
```

Run the local viewer:

```powershell
npm --prefix app/viewer run dev
```

Open:

```text
http://localhost:4173
```

Build and test the static package:

```powershell
npm --prefix app/viewer run test:package
```

The static package is written to:

```text
app/viewer/dist/viewer-static/
```

`dist/` is ignored by git.

## Supported Browser Cases

The browser can open only cases listed in:

```text
app/viewer/public/fixtures/cases/manifest.json
```

Current supported browser-open cases:

- `normal_male2.ECGsimcase`
- `WPW_Bundleonly.ECGsimcase`
- `WPW_ectopicbeat.ECGsimcase`
- `WPW_fusionbeat.ECGsimcase`

Use the Open case control and select the original local `.ECGsimcase` file. The browser checks SHA-256 and byte size, then loads the matching generated bundle. Unsupported files leave the current case visible and show a notice.

Use the Open bundle control to load a generated case-bundle `.json` file directly. Bundle JSON must use the same top-level sections emitted by `tools/export_viewer_fixtures.py`: `caseMetadata`, `heart`, `thorax`, `ecgSignals`, and `tmpWaveforms`. Invalid bundles leave the current case visible and show a validation notice.

## Normal Case Walkthrough

Use any supported WPW variant, for example:

```text
research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

1. Confirm the case status shows `normal_male2.ECGsimcase`.
2. In Heart, switch Surface between Geometry, Depolarization, Repolarization, Amplitude, and Resting potential.
3. Click the Heart surface to select a node.
4. Adjust Radius and Transition to change the weighted source region.
5. In TMP, choose a parameter and change Value.
6. Select Apply, then use Undo, Redo, Reset parameter, and Reset beat.
7. Use Save edits and Load edits for browser-local persistence.
8. Use Export edits to download a `.source-edits.json` sidecar.
9. Use Import edits to reload that sidecar into the same case.
10. In Thorax, switch between geometry and measured BSPM where available, toggle lungs/electrodes, and adjust Scale.
11. In Leads, switch Coupling between Baseline, AC, and DC; change Scale; toggle Grid and RMS.
12. Use the shared time cursor or arrow keys on TMP/Leads canvases to step through time.
13. Use each pane's PNG button to download the current Heart, Thorax, TMP, or Leads image.

## WPW Case Walkthrough

Use:

```text
research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase
```

1. Open the WPW case with the Open case control.
2. Confirm the case status changes to the selected WPW file.
3. Review Heart and Thorax geometry counts and lead-system metadata.
4. Repeat the Heart selection and TMP edit workflow.
5. Save a `.source-edits.json` sidecar for the WPW case.
6. Switch back to `normal_male2.ECGsimcase` and confirm the sidecar is rejected if imported into the wrong case.

## Python CLI Tools

Inspect legacy case metadata:

```powershell
python -m ecgsim.cli.case_info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

Export a supported legacy-style directory subset:

```powershell
python -m ecgsim.cli.export_case research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase scratch/normal-export
```

Profile supported workflows:

```powershell
python tools/profile_supported_workflows.py --skip-export
```

Run release validation:

```powershell
python tools/run_release_validation.py
```

Release evidence is written to:

```text
dist/release-validation/latest/
```

## Import And Export Compatibility

See `docs/import-export-compatibility.md` for the full compatibility table.

Current supported outputs:

- Static viewer package under `app/viewer/dist/viewer-static/`.
- Legacy-style export-directory subset from Python.
- Modern `.source-edits.json` sidecars from the browser.
- PNG captures for Heart, Thorax, TMP, and Leads.
- Browser-permitted image clipboard copy.

Current unsupported outputs:

- Full legacy `File -> Export` parity.
- Legacy `.ECGsimcase` write-back.
- `.ECGsimsource` import/export.
- ECG file import.
- Movie export.
- Signed native installers.

## Scientific Assumptions And Limits

- TMP waveform generation is calibrated against the normal male ECGSIM 3.0.1 `.user.source` export; additional cases and edited-source workflows still need parity coverage.
- ECG/BSPM recomputation after TMP edits is not wired into the viewer yet.
- Baseline coupling reports whether parsed fiducials are available. Bundled cases currently use fallback signal endpoints because P-wave/T-wave samples have not been located.
- Endocardial/epicardial and transmural controls are disabled until explicit wall pairings are parsed.
- Surface-potential matrix values are parsed and displayed, but measured/initial/adapted signal classification remains incomplete.
- The first normal male ECGSIM 3.0.1 raw legacy export has been captured and promoted into small parity fixtures; full export parity still needs scenario-level comparisons and additional case coverage.

## Validation Status

Automated coverage includes:

- Python parser/core/export regression tests.
- Viewer smoke tests.
- Full browser workflow tests against the source viewer.
- Full browser workflow tests against the static package.
- PNG export checks for all primary panes.
- Source edit sidecar download/import checks.
- Release validation logs and packaged screenshot capture.

No workflow is currently marked `parity-tested` against raw legacy numerical exports.

## Developer Checks

Run before committing:

```powershell
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
git diff --check
```

For package/release work, also run:

```powershell
npm --prefix app/viewer run test:package
python tools/run_release_validation.py
```
