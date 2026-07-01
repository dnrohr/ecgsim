# Raw Legacy Export Capture Notes

Status: task `0048` capture notes. The first raw export capture is complete for the ECGSIM 3.0.1 normal male case.

## 2026-06-29 Probe

The ignored Windows app was launched from:

```text
ECGsim-3.0.1/ECGsim.exe
```

with:

```text
ECGsim-3.0.1/cases/normal_male.ECGsimcase
```

The app opened successfully, but bounded UI Automation probes could not expose or invoke the legacy `File -> Export` action:

- Finding `ECGsim.actionExport` in the main window returned no element.
- Expanding the top-level `File` menu exposed only menu shells, not the `Export` action.
- Sending `Alt+F` exposed top-level menu items only.
- The ignored probe directory `research/legacy-exports/raw/normal-male/export-probe/` remained empty.

## Current Capture State

Task `0048` now has raw `.source`, `.adaptECG`, `.refECG`, and related legacy exports for the bundled ECGSIM 3.0.1 normal male case. The successful capture used Win32 automation against the native `export case data files to directory` folder picker and wrote files under:

```text
research/legacy-exports/raw/normal-male/final-export-win32-probe/normal_male/
```

Committed evidence and fixtures:

- `research/legacy-exports/normal-male-ecgsim301-manifest.json`
- `research/legacy-exports/normal-male-ecgsim301-validation.json`
- `research/legacy-exports/normal-male-ecgsim301-validation.md`
- `tests/fixtures/legacy-parity/normal-male-ecgsim301/`

## Future Capture Attempts

Use the manual workflow in `docs/legacy-reference-exports.md` for additional cases or edited workflows:

1. Launch the legacy app in a normal interactive Windows desktop session.
2. Load the target case.
3. Use `File -> Export`.
4. Save output under `research/legacy-exports/raw/<case-name>/export-directory/`.
5. Run `tools/summarize_legacy_export.py` and commit the manifest first.
6. Run `tools/validate_legacy_capture.py` with `--require-task <id>` for the downstream task being unblocked, or `--require-ready` when the full artifact set is expected.
7. For task fixtures, run `tools/promote_legacy_parity_fixtures.py` to copy only reviewed `.user.source`, `.refECG`, or `.adaptECG` files into `tests/fixtures/legacy-parity/<case-name>/`.
8. Verify promoted fixtures with `tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>` before committing them.

The ignored raw capture remains the source of truth for review, but parity tests should consume promoted fixtures and manifests rather than reaching directly into `research/legacy-exports/raw/`.
