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

## Verification

- Tests assert mean/baseline behavior for representative signals.
- Documentation states any ambiguity in P/T interval handling.
- Test command passes.

## Done When

Users/developers can switch between documented ECG filtering modes.
