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
python tools/summarize_legacy_export.py research/legacy-exports/screenshots > research/legacy-exports/screenshots-manifest.json
```

## Manual Export Workflow To Try Later

1. Launch `ECGsim-3.0.1/ECGsim.exe`.
2. Confirm the desired case is loaded.
3. Use `File -> Export`.
4. Choose an output directory under `research/legacy-exports/raw/<case-name>/`.
5. Run:

```powershell
python tools/summarize_legacy_export.py research/legacy-exports/raw/<case-name> > research/legacy-exports/<case-name>-manifest.json
```

Commit only manifests and small, justified reference files. Keep large raw exports ignored unless a later task explicitly promotes a small fixture.

## Remaining Export Gap

The project has a reproducible screenshot baseline, so task `0014` has a known legacy-app reference point. Raw file exports are still useful for later parity work, but need either manual confirmation in a normal desktop session or deeper Windows UI debugging.
