# 0016 Add Regression Fixtures And Checks

## Objective

Add automated checks that compare parsed or generated outputs against legacy references.

## Minimal Context

This task should turn the parity work into repeatable tests. Keep fixtures small when possible.

## Inputs

- `docs/parity.md`
- Reference exports from task 0014.
- Parser/viewer outputs.

## Deliverables

- Add regression tests or scripts for stable parsed values.
- Add fixture generation notes.
- Update task/check docs if a new verification command is introduced.

## Result

- Added `tests/test_parity_regression.py` for screenshot manifest integrity, viewer fixture dimensions, rounded geometry parity, parsed surface-potential samples, and TMP parameter-vector samples.
- Updated `docs/development.md` with fixture-regeneration verification notes.

## Verification

- Regression command passes.
- Tests fail meaningfully if a known expected value is changed.

## Done When

Legacy parity has at least one automated guardrail.
