# 0081 Add Legacy Visual Regression Harness

## Objective

Automate useful visual regression checks without claiming pixel-perfect legacy parity.

## Minimal Context

The project has a legacy screenshot and browser rendering tests, but no stable visual comparison harness against reference screenshots.

## Inputs

- `research/legacy-exports/screenshots/`
- `research/legacy-exports/screenshots-manifest.json`
- Browser/app test scripts
- `docs/parity.md`

## Deliverables

- Capture modern screenshots for key workflows.
- Add thresholded visual or perceptual checks where stable.
- Document what visual checks do and do not prove.

## Verification

- Test intentionally fails or reports a useful diagnostic for a blank/incorrect screenshot fixture.
- Normal browser workflow screenshots pass on supported environments.

## Done When

Visual regressions are caught earlier while scientific numerical parity remains separately tested.

## Completion Notes

Status: complete.

- Added `tools/visual_regression.py` for PNG metrics, blank-image detection, sampled edge/color checks, and broad reference comparison.
- Added unit tests for generated passing/failing screenshots and the tracked legacy normal-male screenshot.
- Documented commands and interpretation in `docs/feature-parity/visual-regression-notes.md`.
- Updated parity and GW-001 docs to describe this as loose visual smoke coverage, not pixel-perfect legacy parity.
