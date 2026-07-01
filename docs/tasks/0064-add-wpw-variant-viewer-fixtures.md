# 0064 Add WPW Variant Viewer Fixtures

## Objective

Add viewer fixtures for the remaining archived WPW cases.

## Minimal Context

Parser regression covers WPW bundle-only, ectopic beat, and fusion beat cases, but the browser bundle currently supports only a subset.

## Inputs

- `research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase`
- `research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase`
- `research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase`
- `tools/export_viewer_fixtures.py`
- `app/viewer/public/fixtures/`

## Deliverables

- Generate committed fixtures or bundles for all supported WPW variants.
- Document unsupported data differences per case.
- Add UI selection or import coverage as appropriate.

## Verification

- Python fixture regression passes for all WPW cases.
- Browser/app workflow test switches among available WPW variants and confirms metadata, geometry, source, and lead state changes.

## Done When

The viewer can inspect each archived WPW variant that the parser supports.

## Completion Note

Completed by adding `WPW_Bundleonly.ECGsimcase` and `WPW_fusionbeat.ECGsimcase` to the generated supported-case bundle manifest alongside the existing normal and WPW ectopic bundles. Browser workflow tests now open all three WPW variants from their original `.ECGsimcase` files and verify case identity, byte size, lead-system state, Heart geometry, TMP metadata, and Leads metadata. Parser/bundle regression tests verify every manifest bundle matches parsed case metadata and core dimensions.
