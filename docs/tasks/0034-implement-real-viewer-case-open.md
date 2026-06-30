# 0034 Implement Real Viewer Case Open

## Objective

Make the viewer load selected `.ECGsimcase` files instead of only comparing metadata to bundled fixtures.

## Minimal Context

The current browser file picker keeps displaying bundled fixtures. Real loading may require a local backend, desktop wrapper bridge, or browser-compatible parser strategy.

## Inputs

- `docs/architecture.md`
- `docs/packaging.md`
- `docs/file-formats/ecgsimcase-object-model.md`
- `app/viewer/`

## Deliverables

- Choose and document the loading architecture.
- Implement real case opening for supported cases.
- Show clear unsupported payload warnings for partial loads.
- Update app workflow tests.

## Verification

- Opening normal and at least one WPW case changes displayed metadata and available views.
- Unsupported cases fail gracefully without stale data.

## Done When

Users can open real supported legacy cases in the modern app.

## Result

Chose a supported-case bundle architecture for the web app: Python parses supported `.ECGsimcase` files with `load_case`, writes app-ready JSON bundles plus a SHA-256 manifest, and the browser file picker hashes selected files to load matching bundles. The viewer now swaps case metadata, geometry, TMP, thorax, and lead preview data for supported normal and WPW cases, while unsupported files keep the current loaded case visible with a clear unsupported notice.
