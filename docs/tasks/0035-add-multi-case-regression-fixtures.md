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

## Result

Added `tests/fixtures/case-summaries.json` with compact parser-derived summaries for `normal_male2.ECGsimcase`, `WPW_Bundleonly.ECGsimcase`, `WPW_ectopicbeat.ECGsimcase`, and `WPW_fusionbeat.ECGsimcase`. Added regression coverage that verifies metadata, signal shapes, geometry/source/lead dimensions, representative source parameter values, activation entry counts, and documented unsupported fields against the current parser.
