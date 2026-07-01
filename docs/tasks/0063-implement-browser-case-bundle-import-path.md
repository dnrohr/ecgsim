# 0063 Implement Browser Case Bundle Import Path

## Objective

Let the viewer open a user-selected modern case bundle file without rebuilding the app.

## Minimal Context

Task `0062` should define the boundary. Start with bundle import before full binary `.ECGsimcase` parsing if that is the safer architecture.

## Inputs

- `docs/tasks/0062-design-browser-case-loading-boundary.md`
- `app/viewer/src/main.js`
- `tools/export_viewer_fixtures.py`
- Existing viewer fixture JSON

## Deliverables

- Add an app import path for a generated case bundle.
- Validate bundle schema and show useful errors for unsupported input.
- Preserve current bundled case behavior.

## Verification

- Browser/app workflow test opens a generated bundle and confirms Heart, Thorax, TMP, and Leads update.
- Existing viewer tests still pass.

## Done When

Users can load a generated modern bundle through the app UI in the browser preview.

## Completion Note

Completed by adding an Open bundle JSON control to the viewer. The app now validates generated case bundles before rendering, loads valid user-selected bundles through the same `applyCaseBundle()` path as manifest-supported legacy cases, and preserves the current case with a visible error notice when JSON parsing or schema validation fails. Browser workflow coverage imports a generated normal case bundle, verifies Heart/TMP/Leads state updates, and verifies an invalid bundle is rejected without replacing the current case.
