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
