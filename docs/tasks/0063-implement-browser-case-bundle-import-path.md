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
