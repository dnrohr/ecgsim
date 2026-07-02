# 0084 Add Visual Mode Test Coverage Map

## Objective

Document which visualization modes are currently covered by automated tests and where coverage is missing or too indirect.

## Minimal Context

The app has a broad browser workflow test, parser tests, numerical tests, and visual smoke tools. The visualization parity goal needs mode-level coverage tracking so support claims do not outrun evidence.

## Inputs

- `app/viewer/scripts/app-test.mjs`
- `tests/test_visual_regression.py`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add `docs/feature-parity/visual-test-coverage.md`.
- Map current browser and Python tests to major Heart, Thorax, TMP, Leads, export, and Help/About visual modes.
- Identify coverage gaps that should feed later visualization tasks.

## Verification

- Coverage map references actual test files and visual modes.

## Done When

Future visual parity tasks can add coverage against a known gap instead of duplicating existing checks.

## Completion Notes

Status: complete.

- Added `docs/feature-parity/visual-test-coverage.md`.
- Mapped current browser, artifact, and visual-smoke tests to the major visualization modes.
- Identified priority coverage gaps for per-mode tests, visible node overlays, interval/beat zoom, VCG, and pane-level references.
