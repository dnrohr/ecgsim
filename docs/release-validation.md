# Release Validation

Status: updated through task `0082` for release-candidate validation, visual smoke evidence, and signing/notarization planning.

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
| `visual-regression` | `visual-regression.log`, `visual-regression.json` | Runs broad PNG visual smoke comparison against the captured legacy baseline. |
| `whitespace` | `whitespace.log` | Runs `git diff --check` against the release-candidate worktree. |

The runner writes:

- `summary.json`
- `summary.md`
- one log per step
- `packaged-viewer.png`
- `visual-regression.json`

The summary includes platform, Python, Node, npm, Git branch, Git commit, and dirty-worktree status so release evidence can be audited later.

## Release Channels

Use these channels until native installers are signed and notarized:

| Channel | Artifact | Audience | Signing status |
| --- | --- | --- | --- |
| `internal-dev` | Static viewer package under `app/viewer/dist/viewer-static/` plus validation evidence | Project collaborators and agent-driven testing | Unsigned; local filesystem/browser run only. |
| `external-preview` | Versioned static package archive plus `dist/release-validation/latest/summary.*` | Trusted external testers | Allowed only after validation passes and known limitations are included in release notes. |
| `desktop-signed` | Future Windows/macOS/Linux desktop installers | Broader users | Blocked until signing, notarization, installer update policy, and first-run checks are implemented. |

## Signing And Notarization Requirements

Before publishing a native desktop artifact:

- Windows: sign installer and executable with an organization code-signing certificate; verify with `Get-AuthenticodeSignature`.
- macOS: sign and notarize the `.app`/DMG with an Apple Developer ID; verify Gatekeeper first-run behavior.
- Linux: publish checksums and, if a package repository is used, sign repository metadata.
- All platforms: publish SHA-256 checksums, release notes, validation summary, and exact Git commit.

Manual steps that remain outside automation:

- Certificate/key custody and signing account access.
- macOS notarization submission and stapling.
- Clean-machine installer first-run checks.
- Browser/OS warning review for unsigned preview artifacts.

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
- WebM movie export for Leads in the browser workflow.
- In-app Help/About references and status.
- Broad visual smoke comparison of the packaged screenshot.
- Mobile layout overflow check.
- Browser console/page-error check.

## Manual Review

Before accepting a release candidate:

1. Open `dist/release-validation/latest/summary.md`.
2. Confirm every step has exit code `0`.
3. Inspect `dist/release-validation/latest/packaged-viewer.png`.
4. Inspect `dist/release-validation/latest/visual-regression.json`.
5. Confirm `docs/user-guide.md`, `docs/import-export-compatibility.md`, and release notes match the candidate behavior.
6. Confirm no ignored legacy app binaries, generated package output, or raw legacy captures are staged.

## Known Gaps

This validates the current static package workflow, not a signed native installer. It does not prove:

- Full legacy `File -> Export` parity.
- Arbitrary browser-side `.ECGsimcase` parsing.
- `.ECGsimcase` write-back.
- Full recomputation parity.
- Signing, notarization, or installer first-run behavior.
