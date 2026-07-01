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
