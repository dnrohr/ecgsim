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
