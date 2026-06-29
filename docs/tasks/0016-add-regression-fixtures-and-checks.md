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

## Verification

- Regression command passes.
- Tests fail meaningfully if a known expected value is changed.

## Done When

Legacy parity has at least one automated guardrail.
