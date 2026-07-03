# 0101 Add Per Mode Canvas Smoke Tests

## Objective

Add dedicated per-mode canvas smoke tests for supported Heart and Thorax visual modes.

## Minimal Context

The main app workflow already touches many visual modes, but it is a long scenario with interaction side effects. The visualization parity roadmap needs direct evidence that each supported Heart and Thorax mode is discoverable, mode-labeled, and nonblank.

## Inputs

- `docs/feature-parity/visual-test-coverage.md`
- `app/viewer/scripts/app-test.mjs`
- `app/viewer/package.json`

## Deliverables

- Add a focused browser smoke script that iterates supported Heart modes.
- Add the same focused coverage for supported Thorax modes.
- Assert mode/status labels and nonblank canvases for every iterated mode.
- Add a named npm script and update visual-test documentation.

## Verification

- `npm --prefix app/viewer run test:visual-modes`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Supported Heart and Thorax visual modes have focused browser smoke coverage separate from the long app workflow.

## Completion Notes

Status: complete.

- Added `app/viewer/scripts/visual-mode-smoke.mjs`.
- Added `npm --prefix app/viewer run test:visual-modes`.
- The new script iterates Heart geometry, scalar source surfaces, TMP-at-time, thorax contribution, and Thorax geometry/measured/initial/adapted/sensitivity modes.
- Each mode checks status/mode labels and nonblank canvas output.
