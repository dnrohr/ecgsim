# Legacy Reference Exports

Task: `docs/tasks/0014-capture-legacy-reference-exports.md`

Status: screenshot baseline captured for the bundled `normal_male.ECGsimcase`. File exports remain unresolved in this environment.

## Local App

The ignored Windows app lives at:

```text
ECGsim-3.0.1/ECGsim.exe
```

The executable initially had a Windows `Zone.Identifier` alternate data stream and launch attempts were cancelled. Running `Unblock-File` on the ignored app directory allowed the app to start locally.

```powershell
Get-ChildItem ECGsim-3.0.1 -Recurse -File | Unblock-File
```

After unblocking, the app opens the bundled default case:

```text
ECGsim-3.0.1/cases/normal_male.ECGsimcase
```

It also accepts an explicit case path as a command-line argument. For example:

```powershell
Start-Process ECGsim-3.0.1/ECGsim.exe -ArgumentList ECGsim-3.0.1/cases/normal_male.ECGsimcase
```

## Automation Findings

- `ECGsim.exe --help` opens the GUI and does not print command-line help.
- Embedded executable strings include `actionExport`, `on_actionExport_triggered`, `.refECG`, and `user.source`, but no usage text.
- UI Automation can see the File menu and the `ECGsim.actionExport` menu item.
- Selecting `File -> Export` by coordinate/UI probing terminates the app in this environment before a folder picker appears. No export files were written.
- A 2026-06-29 bounded retry launched the app successfully, but UI Automation and `Alt+F` keyboard probing exposed only top-level menu shells. The `Export` action was not invokable and `research/legacy-exports/raw/normal-male/export-probe/` stayed empty. See `docs/feature-parity/raw-legacy-export-capture-notes.md`.

## Captured Baseline

The tracked baseline screenshot is:

```text
research/legacy-exports/screenshots/normal-male-main-window.png
```

It shows the legacy app's initial `normal_male.ECGsimcase` view with the heart activation map, thorax view, and 12-lead ECG plots. The checksum is tracked in:

```text
research/legacy-exports/screenshots-manifest.json
```

Regenerate the screenshot with:

```powershell
powershell -ExecutionPolicy Bypass -File tools/capture_legacy_screenshot.ps1
python tools/summarize_legacy_export.py research/legacy-exports/screenshots --output research/legacy-exports/screenshots-manifest.json
```

## Capture Matrix

Store large raw captures under ignored `research/legacy-exports/raw/`. Commit manifests and only promote small curated fixtures when a later parity task requires them.

| Artifact group | Type | Cases | Target path | Needed by | Capture method | Commit policy |
| --- | --- | --- | --- | --- | --- | --- |
| Main-window baseline | screenshot | `normal_male.ECGsimcase` | `research/legacy-exports/screenshots/normal-male-main-window.png` | GW-001 | `tools/capture_legacy_screenshot.ps1` | Commit screenshot and manifest. |
| Case-open baselines | screenshot | `normal_male.ECGsimcase`, WPW variants if launchable by legacy app | `research/legacy-exports/screenshots/<case>-main-window.png` | GW-001, GW-002 | `tools/capture_legacy_screenshot.ps1 -CasePath ... -OutputPath ...` | Commit screenshots only when they are small and visually useful; always commit manifest. |
| Heart view functions | screenshot sequence | normal male | `research/legacy-exports/raw/normal-male/screenshots/heart/` | GW-003, GW-005, GW-010 | Manual screenshot after selecting each Heart surface function and key mode. | Commit manifest; promote representative PNGs only if needed for visual tests. |
| Thorax maps | screenshot sequence | normal male | `research/legacy-exports/raw/normal-male/screenshots/thorax/` | GW-006, GW-009, GW-010 | Manual screenshot for geometry, measured BSPM, initial/adapted BSPM, sensitivity map, and time cursor positions. | Commit manifest; promote curated PNGs later. |
| TMP edit workflow | screenshot sequence plus raw export | normal male | `research/legacy-exports/raw/normal-male/tmp-edit/` | GW-003, GW-004, GW-009, GW-012 | Manual edit/reset sequence; export before/after if File -> Export succeeds. | Commit manifest and notes; raw files remain ignored until curated. |
| Leads and filtering | screenshot sequence plus raw export | normal male and WPW variants | `research/legacy-exports/raw/<case>/leads/` | GW-007, GW-008, GW-009 | Manual screenshots for lead systems/overlays/coupling; export ECG files if possible. | Commit manifest and notes; raw files remain ignored until curated. |
| Focus/activation | screenshot sequence plus raw export | WPW variants | `research/legacy-exports/raw/<case>/focus/` | GW-002, GW-011 | Manual screenshots of focus tools and activation state; export source data if possible. | Commit manifest and notes; raw files remain ignored until curated. |
| Export directory | raw export | normal male and WPW variants | `research/legacy-exports/raw/<case>/export-directory/` | GW-012 | Manual `File -> Export`; then run `tools/summarize_legacy_export.py`. | Commit manifest first; promote individual files only in a focused parity task. |
| Clipboard images | clipboard output | normal male | `research/legacy-exports/raw/normal-male/clipboard/` | GW-013 | Manual pane copy, paste into image editor, save PNG with pane/mode in filename. | Commit manifest; promote curated PNGs only for visual tests. |
| Movies | movie output or screen recording | normal male | `research/legacy-exports/raw/normal-male/movies/` | GW-006, GW-013 | Manual capture after confirming whether legacy exports a movie file or only plays animation. | Keep ignored unless a later task defines a small fixture. |
| Help/reference views | screenshot/text notes | any case | `research/legacy-exports/raw/help/` | GW-014 | Manual screenshots or notes for About, references, update, and download links. | Commit notes if small; keep screenshots ignored unless needed. |

## Golden Workflow Artifact Checklist

| Workflow | Required legacy references |
| --- | --- |
| GW-001 | Main-window screenshot for normal male; screenshot manifest. |
| GW-002 | Case-open screenshots and metadata/export manifests for each WPW case that the legacy app can open. |
| GW-003 | Heart node-selection screenshots and, later, exported source/TMP data for selected nodes. |
| GW-004 | Before/edit/reset screenshots plus before/after source and TMP raw exports. |
| GW-005 | Heart surface-function screenshot sequence for geometry, depolarization, repolarization, ARI, amplitude, resting potential, and TMP-at-time. |
| GW-006 | Thorax BSPM/sensitivity screenshot sequence plus raw BSPM exports when available. |
| GW-007 | Lead-system and overlay screenshots plus exported ECG files. |
| GW-008 | Baseline/AC/DC coupling screenshots and raw ECG exports with fiducial evidence if present. |
| GW-009 | Time-cursor screenshots across panes and any movie/playback artifact. |
| GW-010 | Thorax probe/contribution screenshots plus transfer/sensitivity raw exports if available. |
| GW-011 | WPW focus/activation screenshots and exported source/activation data. |
| GW-012 | Export-directory manifest and curated raw files selected by later numerical parity tasks. |
| GW-013 | Clipboard PNGs for Heart, Thorax, TMP, and Leads; movie artifact if legacy produces one. |
| GW-014 | About, reference, update, and case-download screenshots or notes. |

## Raw Export Manual Workflow

1. Launch `ECGsim-3.0.1/ECGsim.exe`.
2. Confirm the desired case is loaded.
3. Use `File -> Export`.
4. Choose an output directory under `research/legacy-exports/raw/<case-name>/`.
5. Run:

```powershell
python tools/summarize_legacy_export.py research/legacy-exports/raw/<case-name> --output research/legacy-exports/<case-name>-manifest.json
```

The manifest records checksums, file classifications, readable matrix/vector/geometry shapes, and a `readyForNumericalParity` flag. For downstream numerical parity work, confirm the manifest reports `.user.source`, `.adaptECG`, and `.refECG` artifacts under `parityArtifacts`.

Compare matching legacy and modern supported-export files with:

```powershell
python tools/compare_export_directories.py research/legacy-exports/raw/<case-name>/export-directory --case research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase --output research/legacy-exports/<case-name>-comparison.json
```

The comparison only checks relative paths the modern supported export writer currently emits. Missing legacy files, shape mismatches, and value mismatches are reported explicitly.

Run the full capture handoff validator with:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --case research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase --output research/legacy-exports/<case-name>-validation.json
```

The validation report embeds the checksum/shape manifest, optional modern-export comparison, and `taskReadiness` for tasks `0049`, `0051`, `0052`, and `0053`.

Commit only manifests and small, justified reference files. Keep large raw exports ignored unless a later task explicitly promotes a small fixture.

## Screenshot Manual Workflow

Use automation where possible:

```powershell
powershell -ExecutionPolicy Bypass -File tools/capture_legacy_screenshot.ps1 -CasePath ECGsim-3.0.1/cases/normal_male.ECGsimcase -OutputPath research/legacy-exports/screenshots/normal-male-main-window.png
```

For mode-specific captures that cannot be automated yet:

1. Launch the legacy app and navigate to the target view/mode.
2. Capture only the app window or active pane.
3. Save under `research/legacy-exports/raw/<case-name>/screenshots/<view>/<mode>.png`.
4. Add a short `notes.md` beside the images with the exact menu choices, selected node/electrode/time, and any visible values.
5. Run `tools/summarize_legacy_export.py` on the capture directory.

## Clipboard Manual Workflow

1. Use the legacy pane clipboard command.
2. Paste into a local image editor without resizing.
3. Save as PNG under `research/legacy-exports/raw/<case-name>/clipboard/<pane>-<mode>.png`.
4. Record whether the app needed to stay open for paste to work.
5. Generate a manifest for the clipboard directory.

## Movie Manual Workflow

The manual confirms movie/playback behavior, but this project has not confirmed whether the legacy app writes movie files or only animates in place.

1. Test the movie command for Heart and Thorax views.
2. If it writes a file, save under `research/legacy-exports/raw/<case-name>/movies/`.
3. If it only plays animation, record a short screen capture and note the selected view, time range, and playback speed.
4. Keep movie files ignored unless a later task defines size limits and a stable comparison method.

## Remaining Export Gap

The project has a reproducible screenshot baseline, so task `0014` has a known legacy-app reference point. Raw file exports are still useful for later parity work, but need either manual confirmation in a normal desktop session or deeper Windows UI debugging.
