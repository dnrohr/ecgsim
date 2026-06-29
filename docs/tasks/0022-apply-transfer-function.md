# 0022 Apply Transfer Function

## Objective

Apply transfer functions to source data to compute body-surface potentials or ECG signals.

## Minimal Context

The transfer function maps myocardial source behavior to thorax/body-surface potentials. This is core scientific behavior and must be parity-tested.

## Inputs

- `docs/simulation.md`
- Parsed transfer matrix data.
- TMP/source outputs.
- Legacy reference data.

## Deliverables

- Transfer-function application code.
- Tests against legacy/reference fixtures.
- Performance notes for large matrices.

## Result

- Added `ecgsim.core.apply_transfer_function` for `B = A * S` matrix application.
- Added `ecgsim.core.apply_wct_reference` for Wilson central terminal row subtraction.
- Added unit tests for computed values, shape validation, WCT referencing, and archived `wct.tra` dimensions/sample coefficients.
- Documented the shape contract and performance notes in `docs/simulation.md`.

## Verification

- Computed output dimensions match expected thorax/lead dimensions.
- Numerical comparisons use documented tolerances.
- Test command passes.

## Done When

The project can compute first-pass potentials from source data and transfer matrices.
