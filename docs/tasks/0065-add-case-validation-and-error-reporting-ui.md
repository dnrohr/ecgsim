# 0065 Add Case Validation And Error Reporting UI

## Objective

Expose clear app diagnostics when a case or bundle cannot be loaded completely.

## Minimal Context

Unsupported payloads are currently mostly developer-facing. Users need actionable messages, and agents need structured diagnostics for tests.

## Inputs

- `ecgsim/io/ecgsimcase.py`
- `tools/export_viewer_fixtures.py`
- `app/viewer/src/main.js`
- Existing case metadata fixture fields

## Deliverables

- Add structured validation/status data to case bundles.
- Display unsupported or partial-load state in the app.
- Keep successful case paths quiet and work-focused.

## Verification

- Unit tests cover validation summaries.
- Browser/app test opens a fixture with known unsupported fields and verifies visible status without breaking primary views.

## Done When

Partial support is visible, understandable, and testable instead of buried in logs.

## Completion Note

Completed by adding structured `caseMetadata.validation` data to generated viewer bundles and showing a concise Validation field in the case summary. The bundle validator now requires validation metadata, generated fixtures describe partial support with unsupported payload counts and unavailable capabilities, and tests cover both the structured bundle data and the visible browser summary.
