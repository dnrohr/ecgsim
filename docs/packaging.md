# Packaging Plan

Status: release-engineering plan for the current browser viewer plus Python parser package.

## Current App Stack

- Parser/core runtime: Python package `ecgsim`, distributed from `pyproject.toml`.
- Viewer runtime: browser-native HTML/CSS/JavaScript in `app/viewer`.
- Viewer rendering: Three.js plus Canvas.
- Development fixture flow: Python tools generate static JSON fixtures consumed by the viewer.

The viewer is not ready for production desktop installers because arbitrary `.ECGsimcase` parsing, full recomputation, and legacy write-back are not yet wired into the UI. It does have a repeatable static preview package for desktop/offline browser use.

## Distribution Targets

| Target | Status | Artifact |
| --- | --- | --- |
| Local development web app | Supported now | `app/viewer` served by `npm --prefix app/viewer run dev` |
| Static web preview | Supported now | `app/viewer/dist/viewer-static/` |
| Python parser/CLI package | Supported for development | source tree or future wheel/sdist for `ecgsim-modern` |
| Desktop app for Windows/macOS/Linux | Later | Tauri or Electron wrapper around the web app plus parser/simulation runtime |

## Recommended Sequence

1. Keep the current dev-server workflow while UI and data contracts are moving.
2. Use the static viewer package for local/offline preview distribution while the app remains fixture-bundled.
3. Package the Python parser as a wheel/sdist when the public API stabilizes beyond fixture readers.
4. Choose a desktop wrapper after arbitrary case loading, edit persistence, and recomputation are available.
5. Add signed installers only after the desktop wrapper and release checklist are stable.

## Static Web Preview

Build:

```powershell
npm --prefix app/viewer run build:static
```

Output:

```text
app/viewer/dist/viewer-static/
```

Contents:

- `index.html`
- viewer JavaScript and CSS under `src/`
- generated fixture JSON under `public/`
- Three.js runtime files under `node_modules/three/build/`
- `package-manifest.json`

Verification:

```powershell
npm --prefix app/viewer install
npm --prefix app/viewer test
npm --prefix app/viewer run test:package
python -m unittest discover -s tests
```

`test:package` builds the static package and runs the full browser workflow test against `dist/viewer-static`.

Before publishing a static preview, verify in a browser or with `test:package` that:

- the app loads without a local dev server dependency beyond static file serving,
- Heart and Thorax canvases render,
- TMP edits redraw,
- Leads coupling switches Baseline/AC/DC,
- source edit sidecar export/import works,
- PNG export works for primary panes,
- mobile width does not overflow.

The static package is a preview distribution, not a signed desktop installer.

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

Current decision: keep the production desktop wrapper open and ship only static preview packages for now.

Preferred wrapper decision point: after the app can load an arbitrary `.ECGsimcase`, edit adapted source parameters, recompute signals, and save/export useful output from the UI.

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

## Current Packaging Scripts

Current commands:

```powershell
npm --prefix app/viewer run build:static
npm --prefix app/viewer run test:package
```

The current artifact is still a fixture preview rather than a complete modern ECGSIM distribution.
