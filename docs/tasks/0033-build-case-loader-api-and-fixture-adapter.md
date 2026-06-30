# 0033 Build Case Loader API And Fixture Adapter

## Objective

Create one case-loading API used by tools, fixture export, and eventually the viewer.

## Minimal Context

Current code has separate readers and fixture export logic. Feature parity needs one normalized case object.

## Inputs

- Tasks `0029` through `0032`.
- `tools/export_viewer_fixtures.py`
- `ecgsim/io/`
- `ecgsim/core/`

## Deliverables

- Add a high-level `load_case` API.
- Update fixture export to use the new case object.
- Keep existing fixture JSON schema stable unless a schema update is documented.

## Verification

- Existing Python tests and viewer smoke tests pass.
- Fixture regeneration is byte-stable or differences are documented.

## Done When

There is one supported path from `.ECGsimcase` file to app-ready data.
