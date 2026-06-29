# 0014 Capture Legacy Reference Exports

## Objective

Use the original Windows app to produce reference exports and screenshots for parity testing.

## Minimal Context

The local `ECGsim-3.0.1/` app is ignored by Git and can be used as a behavioral oracle. Do not commit the app itself.

## Inputs

- Local `ECGsim-3.0.1/`
- Downloaded `.ECGsimcase` files.
- Existing read-only viewer/parser behavior.

## Deliverables

- Create a documented reference-export workflow.
- Store only useful, appropriately sized reference outputs or checksums.
- Capture baseline screenshots if feasible and useful.

## Result

- Added a reproducible screenshot baseline for the bundled `normal_male.ECGsimcase`.
- Added `tools/capture_legacy_screenshot.ps1` for handle-based legacy app screenshots.
- Added `research/legacy-exports/screenshots-manifest.json` for checksum verification.
- Documented that `File -> Export` currently exits the app before a folder picker appears in this environment, so raw export capture remains a later investigation gap.

## Verification

- Reference outputs can be reproduced from documented steps.
- Large/generated artifacts are either justified or ignored.
- Git status confirms the app binary remains ignored.

## Done When

The project has a known baseline from the legacy app for at least one case.
