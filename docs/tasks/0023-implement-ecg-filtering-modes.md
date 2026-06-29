# 0023 Implement ECG Filtering Modes

## Objective

Implement ECG coupling/filtering modes described by legacy ECGSIM.

## Minimal Context

The manual describes baseline correction, AC coupling, and DC coupling.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- `docs/simulation.md`
- Computed or parsed ECG signal data.

## Deliverables

- Filtering/coupling functions.
- Tests for baseline correction, AC coupling, and DC pass-through.
- UI or CLI exposure if the viewer/simulation shell exists.

## Result

- Added `ecgsim.core.filter_signal` and `ecgsim.core.filter_matrix` for `baseline`, `ac`, and `dc` modes.
- Added viewer-side filtering helpers and a Leads coupling selector.
- Added unit and smoke tests for DC pass-through, AC mean subtraction, and baseline correction.
- Documented that baseline fiducials fall back to first/last samples until legacy P/T fiducial handling is known.

## Verification

- Tests assert mean/baseline behavior for representative signals.
- Documentation states any ambiguity in P/T interval handling.
- Test command passes.

## Done When

Users/developers can switch between documented ECG filtering modes.
