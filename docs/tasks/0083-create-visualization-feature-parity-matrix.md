# 0083 Create Visualization Feature Parity Matrix

## Objective

Create a concrete visualization parity target that covers every legacy visual mode without requiring pixel-perfect UI parity.

## Minimal Context

The previous feature matrix mixes file workflows, parser work, and visual behavior. The new goal needs a matrix that focuses on what users can see, inspect, manipulate, and validate.

## Inputs

- `docs/feature-parity/inventory.md`
- `docs/feature-parity/golden-workflows.md`
- `docs/feature-parity/matrix.md`
- `docs/visualization-feature-parity-roadmap.md`

## Deliverables

- Add `docs/feature-parity/visualization-matrix.md`.
- Seed it with every major Heart, Thorax, TMP, Leads, workspace, and visual-output mode.
- Use statuses that distinguish supported modern equivalents from blocked legacy-evidence gaps.

## Verification

- Matrix includes at least one row for each core visual pane and visual-output workflow.
- Task index links the new visualization roadmap tasks.

## Done When

Future visualization work can start from a specific matrix row instead of rediscovering the legacy manual.

## Completion Notes

Status: complete.

- Added `docs/visualization-feature-parity-roadmap.md`.
- Added `docs/feature-parity/visualization-matrix.md` with workspace, Heart, Thorax, TMP, Leads, and visual-output rows.
- Updated the task index with visualization feature-parity workstreams and task-sized follow-ups.
