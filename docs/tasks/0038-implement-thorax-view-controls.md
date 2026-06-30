# 0038 Implement Thorax View Controls

## Objective

Implement key legacy Thorax view controls and overlays.

## Minimal Context

Current Thorax view only toggles thorax and lungs. Legacy ECGSIM includes electrode and potential-map workflows.

## Inputs

- `docs/feature-parity/inventory.md`
- `research/extracted-text/www.ecgsim.org/manual/thorax.txt`
- Parsed electrode/lead data from task `0032`.

## Deliverables

- Add electrode display where data exists.
- Add potential/map overlay controls where computed or parsed data exists.
- Add tests for toggles and selection behavior.

## Verification

- Thorax controls visibly change canvas output.
- Missing data is shown as unavailable rather than silently absent.

## Done When

Thorax view covers geometry, electrodes, and potential-map entry points.

## Result

- Added Thorax AP reset, auto-rotation, geometry scale, layer toggles, and thorax-node selection.
- Added visible electrode, BSPM, sensitivity, and lock-to-heart entry points with disabled/unavailable states where parsed data is missing.
- Documented current Thorax support and blocked parity items in `docs/feature-parity/thorax-view-notes.md`.
- Extended smoke and browser workflow tests to validate Thorax controls, canvas changes, unavailable data states, and selection behavior.
