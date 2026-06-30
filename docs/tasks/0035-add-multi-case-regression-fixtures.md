# 0035 Add Multi-Case Regression Fixtures

## Objective

Expand regression coverage beyond `normal_male2.ECGsimcase`.

## Minimal Context

Feature parity needs confidence across normal and abnormal/variant cases, not one happy path.

## Inputs

- Cases under `research/source/www.ecgsim.org/downloads/cases/`.
- `tests/test_parity_regression.py`.
- `docs/parity.md`.

## Deliverables

- Add compact fixture summaries for WPW cases.
- Add tests for case metadata, geometry/source/lead dimensions, and representative values.
- Document case-specific unsupported fields.

## Verification

- Python tests pass across all supported cases.
- Fixture sizes remain appropriate for the repo.

## Done When

Parser regressions are caught across the initial supported case set.
