# 0021 Implement TMP Generation

## Objective

Implement transmembrane potential waveform generation from source parameters.

## Minimal Context

TMP generation uses timing, amplitude, resting potential, and slope parameters. The exact behavior must follow `docs/simulation.md` and legacy parity data.

## Inputs

- `docs/simulation.md`
- Source parameter data from parser/editor.
- Legacy reference data.

## Deliverables

- TMP generation code.
- Unit tests for representative parameter sets.
- Documentation of numerical assumptions.

## Result

- Added `ecgsim.core.tmp` with a deterministic provisional TMP generator and vector adapter.
- Reused the core generator in viewer fixture export.
- Moved browser TMP generation into `app/viewer/src/tmp-generation.js`.
- Added unit tests for waveform shape, sample-rate handling, validation, vector conversion, and fixture agreement.
- Documented numerical assumptions in `docs/simulation.md` and parity status in `docs/parity.md`.

## Verification

- Tests compare generated TMPs against legacy/reference fixtures within documented tolerances.
- Test command passes.

## Done When

TMP waveforms can be generated from source parameters without relying on stored waveform matrices only.
