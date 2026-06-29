# Packaging Plan

Status: release-engineering plan for the current browser viewer plus Python parser package.

## Current App Stack

- Parser/core runtime: Python package `ecgsim`, distributed from `pyproject.toml`.
- Viewer runtime: browser-native HTML/CSS/JavaScript in `app/viewer`.
- Viewer rendering: Three.js plus Canvas.
- Development fixture flow: Python tools generate static JSON fixtures consumed by the viewer.

The viewer is not ready for production desktop packaging because arbitrary `.ECGsimcase` parsing, save/export, and full recomputation are not yet wired into the UI.

## Distribution Targets

| Target | Status | Artifact |
| --- | --- | --- |
| Local development web app | Supported now | `app/viewer` served by `npm --prefix app/viewer run dev` |
| Static web preview | Next packaging target | copied `index.html`, `src/`, `public/fixtures/`, and installed dependency assets or bundled JS/CSS |
| Python parser/CLI package | Supported for development | source tree or future wheel/sdist for `ecgsim-modern` |
| Desktop app for Windows/macOS/Linux | Later | Tauri or Electron wrapper around the web app plus parser/simulation runtime |

## Recommended Sequence

1. Keep the current dev-server workflow while UI and data contracts are moving.
2. Add a static viewer build only after module bundling is introduced or the current module graph is intentionally copied as a release artifact.
3. Package the Python parser as a wheel/sdist when the public API stabilizes beyond fixture readers.
4. Choose a desktop wrapper after arbitrary case loading, edit persistence, and recomputation are available.
5. Add signed installers only after the desktop wrapper and release checklist are stable.

## Static Web Preview

Minimum release contents:

- `app/viewer/index.html`
- viewer JavaScript and CSS
- `app/viewer/public/fixtures/*.json`
- Three.js runtime dependency
- release notes that state the preview uses bundled fixtures

Verification:

```powershell
npm --prefix app/viewer install
npm --prefix app/viewer test
python -m unittest discover -s tests
```

Before publishing a static preview, verify in a browser that:

- the app loads without a local dev server dependency beyond static file serving,
- Heart and Thorax canvases render,
- TMP edits redraw,
- Leads coupling switches Baseline/AC/DC,
- mobile width does not overflow.

## Python Package

Current package command:

```powershell
python -m ecgsim.cli.case_info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

Future package artifacts:

- source distribution (`sdist`)
- wheel (`.whl`)

Do not promise stable parser APIs until `.ECGsimcase` object-graph parsing replaces offset-driven fixture readers.

## Desktop Wrapper Decision

Preferred decision point: after the app can load an arbitrary `.ECGsimcase`, edit adapted source parameters, recompute signals, and save/export useful output.

Options:

- Tauri: smaller installers and native shell, but requires a Rust build/signing pipeline.
- Electron: larger artifacts, simpler Node/web integration, broad packaging ecosystem.
- Hosted web app only: easiest updates, but local file access and offline research workflows need deliberate design.

The current architecture keeps this choice open by keeping parsing/simulation outside browser rendering code.

## Signing And Notarization

Windows:

- Code-sign `.exe`/`.msi` artifacts before release.
- Keep signing keys outside the repository and CI logs.
- Add installer reputation notes to release documentation.

macOS:

- Sign the app bundle with an Apple Developer ID.
- Notarize and staple the notarization ticket.
- Test first launch on a clean macOS account.

Linux:

- Prefer unsigned tarball/AppImage/deb/rpm only after the desktop wrapper exists.
- Document distribution-specific dependencies.

## Release Checklist

For every release candidate:

- Run `python -m unittest discover -s tests`.
- Run `npm --prefix app/viewer test`.
- Regenerate viewer fixtures only when source data or fixture schema changes.
- Confirm `docs/user-guide.md` matches the released behavior.
- Record unsupported legacy features in release notes.
- Preserve research/source provenance and checksums.
- Do not include ignored legacy app binaries or local `downloads/` scratch files.

## No Packaging Scripts Yet

This task intentionally adds no new packaging command. The current viewer is useful as a local prototype, but release artifacts would still be fixture previews rather than a complete modern ECGSIM distribution.
