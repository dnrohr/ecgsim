# Raw Legacy Export Capture Notes

Status: task `0048` blocker notes.

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

## Current Blocker

Task `0048` needs raw `.source`, `.adaptECG`, `.refECG`, and related legacy exports. Those artifacts still require a manual desktop capture session or deeper native Qt automation outside the current reliable command-line/UIA path.

## Next Capture Attempt

Use the manual workflow in `docs/legacy-reference-exports.md`:

1. Launch the legacy app in a normal interactive Windows desktop session.
2. Load the target case.
3. Use `File -> Export`.
4. Save output under `research/legacy-exports/raw/<case-name>/export-directory/`.
5. Run `tools/summarize_legacy_export.py` and commit the manifest first.
6. Run `tools/validate_legacy_capture.py` with `--require-task <id>` for the downstream task being unblocked, or `--require-ready` when the full artifact set is expected.
7. For task fixtures, run `tools/promote_legacy_parity_fixtures.py` to copy only reviewed `.user.source`, `.refECG`, or `.adaptECG` files into `tests/fixtures/legacy-parity/<case-name>/`.
8. Verify promoted fixtures with `tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>` before committing them.

The ignored raw capture remains the source of truth for review, but parity tests should consume promoted fixtures and manifests rather than reaching directly into `research/legacy-exports/raw/`.
