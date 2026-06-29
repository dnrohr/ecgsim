# 0004 Implement Matrix And Vector Readers

## Objective

Implement readers for legacy matrix and ASCII vector files.

## Minimal Context

The manual documents matrix files as row/column numeric data and ASCII files as one-column vectors. These are primitive formats used by ECG, TMP, source, and transfer data.

## Inputs

- `docs/file-formats/export-formats.md`
- `research/source/www.ecgsim.org/downloads/loadmat.m`
- Example files identified in task 0002.

## Deliverables

- Add matrix and vector reader functions in the parser package.
- Add focused tests with small fixtures.
- Document any parsing tolerances, numeric types, or delimiter assumptions.

## Verification

- Tests cover happy path and at least one malformed input.
- Fixture expected dimensions and representative numeric values are asserted.
- Test command passes.

## Done When

Other parser code can call a stable matrix/vector API with documented behavior.
