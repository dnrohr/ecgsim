# 0060 Add End-To-End Release Validation

## Objective

Add release-level validation for packaged or hosted app builds.

## Minimal Context

Unit and app tests are not enough for release confidence once packaging exists.

## Inputs

- `docs/feature-parity/golden-workflows.md`
- Desktop/static packaging outputs.
- Existing app workflow tests.

## Deliverables

- Add release validation checklist and automated tests.
- Cover install/open case/edit/recompute/export workflows.
- Capture screenshots/artifacts for review.

## Verification

- Release validation runs on a packaged or release-like artifact.
- Failures point to workflow step and expected parity artifact.

## Done When

Release candidates can be accepted or rejected using repeatable evidence.

## Progress

Completed release validation for the current static package workflow.

- Added `tools/run_release_validation.py` as the one-command release-candidate gate.
- Added packaged screenshot capture via `npm --prefix app/viewer run capture:package`.
- The release gate runs Python tests, viewer smoke, packaged browser workflow, packaged screenshot capture, and `git diff --check`.
- Evidence is written to ignored `dist/release-validation/latest/` as logs, `summary.json`, `summary.md`, and `packaged-viewer.png`.
- Added `docs/release-validation.md` with coverage, review steps, and known gaps.

Latest local run passed on 2026-06-30.
