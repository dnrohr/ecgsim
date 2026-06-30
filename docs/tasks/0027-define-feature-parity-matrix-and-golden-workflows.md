# 0027 Define Feature Parity Matrix And Golden Workflows

## Objective

Create a parity matrix and select golden workflows/cases for future validation.

## Minimal Context

Feature parity must be measurable. The matrix should track status across legacy features and the golden workflows should become end-to-end tests.

## Inputs

- `docs/feature-parity-roadmap.md`
- `docs/feature-parity/inventory.md`
- `docs/parity.md`
- `docs/user-guide.md`

## Deliverables

- Add `docs/feature-parity/matrix.md`.
- Add `docs/feature-parity/golden-workflows.md`.
- Define statuses: unsupported, partial, supported, parity-tested, deferred.
- Choose initial cases: normal male plus WPW variants.

## Verification

- Every inventory item has a matrix row.
- Golden workflows have clear starting files, actions, expected outputs, and validation method.

## Done When

The team can prioritize work by parity gap instead of by intuition.
