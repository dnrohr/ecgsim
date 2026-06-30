# 0059 Implement Desktop Packaging

## Objective

Package the modern app for desktop use.

## Minimal Context

Legacy ECGSIM shipped Windows and Mac packages. The modern app should package only after real case loading, editing, recomputation, and export are useful.

## Inputs

- `docs/packaging.md`
- Completed parity workflows.
- Current app architecture.

## Deliverables

- Choose desktop wrapper.
- Add build scripts and packaging config.
- Document platform prerequisites and signing/notarization steps.

## Verification

- Build succeeds locally for at least the current OS.
- Packaged app opens a real case and runs golden workflow smoke tests.

## Done When

There is a repeatable desktop packaging path.

## Progress

Completed the first repeatable packaging path as a static desktop/offline browser preview.

- Kept the desktop wrapper decision open; signed Tauri/Electron installers remain premature until arbitrary case loading, UI export, recomputation, and release validation are stronger.
- Added `npm --prefix app/viewer run build:static`, which creates `app/viewer/dist/viewer-static/`.
- The static package includes `index.html`, viewer source files, generated fixtures, Three.js runtime build files, and `package-manifest.json`.
- Added `npm --prefix app/viewer run test:package`, which builds the static package and runs the full browser workflow test against the packaged output.
- Updated `docs/packaging.md` with package contents, verification, wrapper decision, and signing/notarization notes.

This is not a production installer or signed desktop app.
