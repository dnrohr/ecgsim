# Release Validation

Status: task `0060` release-candidate validation for the current static package workflow.

## Command

Run from the repository root:

```powershell
python tools/run_release_validation.py
```

The command writes ignored evidence artifacts under:

```text
dist/release-validation/latest/
```

## Automated Gate

The release validation runner performs these steps:

| Step | Evidence | Purpose |
| --- | --- | --- |
| `python-tests` | `python-tests.log` | Parser, IO, core, export, and parity unit/regression tests. |
| `viewer-smoke` | `viewer-smoke.log` | Browser module and fixture smoke checks. |
| `packaged-workflow` | `packaged-workflow.log` | Builds the static package and runs the full app workflow against packaged output. |
| `packaged-screenshot` | `packaged-screenshot.log`, `packaged-viewer.png` | Captures a full-page screenshot of the packaged viewer for review. |
| `whitespace` | `whitespace.log` | Runs `git diff --check` against the release-candidate worktree. |

The runner writes:

- `summary.json`
- `summary.md`
- one log per step
- `packaged-viewer.png`

## Current Coverage

The packaged workflow test covers:

- App boot from static package output.
- Supported case bundle load.
- Normal and WPW case-open workflow.
- Heart and thorax WebGL rendering.
- Heart selection, region controls, TMP edits, undo/redo/reset.
- Source edit local save/load and `.source-edits.json` export/import.
- Shared time cursor and playback state.
- Thorax map/time controls.
- Leads coupling, scale, grid, RMS, and lead-system controls.
- PNG export for Heart, Thorax, TMP, and Leads.
- Mobile layout overflow check.
- Browser console/page-error check.

## Manual Review

Before accepting a release candidate:

1. Open `dist/release-validation/latest/summary.md`.
2. Confirm every step has exit code `0`.
3. Inspect `dist/release-validation/latest/packaged-viewer.png`.
4. Confirm `docs/user-guide.md`, `docs/import-export-compatibility.md`, and release notes match the candidate behavior.
5. Confirm no ignored legacy app binaries, generated package output, or raw legacy captures are staged.

## Known Gaps

This validates the current static package workflow, not a signed native installer. It does not prove:

- Full legacy `File -> Export` parity.
- Arbitrary browser-side `.ECGsimcase` parsing.
- `.ECGsimcase` write-back.
- Full recomputation parity.
- Movie export.
- Signing, notarization, or installer first-run behavior.
