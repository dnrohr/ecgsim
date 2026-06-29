# 0018 Implement Node And Region Selection

## Objective

Implement heart-node selection and region radius selection.

## Minimal Context

Legacy ECGSIM selects the nearest heart node and applies edits within a radius, with transition-zone behavior later. Start with deterministic selection and region membership.

## Inputs

- Source editing model from task 0017.
- Heart geometry rendering from task 0009.

## Deliverables

- Select nearest visible/eligible heart node.
- Compute region membership by radius.
- Display selected node and region.
- Add tests for selection math where possible.

## Verification

- Selection works on known geometry.
- Region radius behavior is deterministic and documented.
- Tests or visual smoke checks pass.

## Done When

Users/developers can select a heart node and see the affected region.
