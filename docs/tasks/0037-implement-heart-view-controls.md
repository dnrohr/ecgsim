# 0037 Implement Heart View Controls

## Objective

Implement key legacy Heart view controls and display modes.

## Minimal Context

Current Heart view supports rotation and basic node/radius selection only.

## Inputs

- `docs/feature-parity/inventory.md`
- `research/extracted-text/www.ecgsim.org/manual/heart.txt`
- `docs/source-editing-model.md`
- `app/viewer/src/main.js`

## Deliverables

- Add view controls for heart orientation, source side/wall options, parameter coloring, and selection display where supported.
- Document unsupported heart modes.
- Add app workflow tests for visible state changes.

## Verification

- Heart controls update view state and metadata predictably.
- Existing selection/TMP tests still pass.

## Done When

Heart view parity gaps are limited to explicitly documented advanced editing modes.
