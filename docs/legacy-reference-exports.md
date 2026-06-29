# Legacy Reference Exports

Task: `docs/tasks/0014-capture-legacy-reference-exports.md`

Status: export workflow investigation in progress. No legacy export baseline has been captured yet.

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

## Automation Findings

- `ECGsim.exe --help` opens the GUI and does not print command-line help.
- Embedded executable strings include `actionExport`, `on_actionExport_triggered`, `.refECG`, and `user.source`, but no usage text.
- UI Automation can see the File menu and the `ECGsim.actionExport` menu item.
- Selecting `File -> Export` by coordinate/UI probing terminates the app in this environment before a folder picker appears. No export files were written.

## Manual Export Workflow To Try

1. Launch `ECGsim-3.0.1/ECGsim.exe`.
2. Confirm the desired case is loaded.
3. Use `File -> Export`.
4. Choose an output directory under `research/legacy-exports/raw/<case-name>/`.
5. Run:

```powershell
python tools/summarize_legacy_export.py research/legacy-exports/raw/<case-name> > research/legacy-exports/<case-name>-manifest.json
```

Commit only manifests and small, justified reference files. Keep large raw exports ignored unless a later task explicitly promotes a small fixture.

## Next Evidence Needed

Task `0014` is done only after at least one legacy app export or screenshot baseline is captured and can be reproduced from documented steps.
