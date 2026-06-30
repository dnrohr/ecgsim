# User Guide

Status: first modern viewer guide for the bundled `normal_male2` fixtures.

## What Works Today

The current app is a browser-based prototype with curated fixtures generated from:

```text
research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

Supported in the viewer:

- Case metadata summary for the bundled fixture.
- Opening supported web-bundled `.ECGsimcase` files by selecting the original local file. The browser verifies supported files by SHA-256 and loads the matching generated bundle.
- Heart geometry display with node and radius selection.
- Thorax/lung geometry display with visibility toggles.
- TMP waveform display for selected heart nodes.
- TMP parameter edits for depolarization time, repolarization time, resting potential, amplitude, plateau slope, and repolarization slope.
- Selected-parameter reset and beat reset.
- Surface-potential/lead trace plot with Baseline, AC, and DC coupling modes.

Supported from the Python package:

- `.ECGsimcase` metadata inspection.
- Known matrix/vector payload reads by offset.
- Legacy `.tri`, matrix, and vector readers.
- Provisional TMP waveform generation.
- Transfer-function application and WCT row referencing.
- ECG filtering/coupling helpers.

## First Run

From a clean checkout, install the viewer dependencies:

```powershell
npm --prefix app/viewer install
```

Start the local viewer:

```powershell
npm --prefix app/viewer run dev
```

Open:

```text
http://localhost:4173
```

The app loads the bundled `normal_male2` fixtures automatically. The current supported web-open cases are `normal_male2.ECGsimcase` and `WPW_ectopicbeat.ECGsimcase`.

## Basic Walkthrough

1. Confirm the top case summary shows `normal_male2.ECGsimcase`.
2. In Heart, click the surface to select a node.
3. Adjust the radius slider to change the selected region.
4. In TMP, choose a parameter, change the value, and select Apply.
5. Use Reset parameter to restore the selected parameter for the selected region.
6. Use Reset beat to restore all adapted TMP parameters in the current fixture.
7. In Thorax, toggle Thorax, Left lung, and Right lung visibility.
8. In Leads, switch Coupling between Baseline, AC, and DC.

## Case Metadata CLI

Run:

```powershell
python -m ecgsim.cli.case_info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

This prints the known marker inventory and unsupported payload categories for the case.

## Unsupported Or Partial Features

- Arbitrary `.ECGsimcase` files are not parsed in the browser yet. The file picker loads only cases present in the generated supported-case manifest and leaves the current case visible when a file is unsupported.
- Saving or exporting adapted cases is not implemented.
- TMP generation is deterministic but provisional; it is not yet parity-verified against legacy `.user.source` exports.
- ECG recomputation after TMP edits is not wired into the viewer yet.
- Baseline coupling reports whether it uses parsed fiducials or fallback signal endpoints. Bundled cases currently use the fallback because legacy P/T fiducial samples have not been located.
- Endocardial/epicardial switching and transmural edits are disabled per case until explicit wall pairings are parsed. TMP edits can be saved as modern sidecar state; source edit `.ECGsimcase` write-back, movie playback, and full legacy lead layout semantics are not implemented.
- The original Windows and macOS app packages are reference binaries and intentionally ignored by git.

## Developer Checks

Run these checks before committing changes:

```powershell
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
```
