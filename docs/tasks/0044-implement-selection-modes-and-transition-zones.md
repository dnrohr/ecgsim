# 0044 Implement Selection Modes And Transition Zones

## Objective

Implement legacy source selection modes, including transition zones where documented.

## Minimal Context

Current selection is a hard radius around one node. Legacy ECGSIM supports multiple selection and transition workflows.

## Inputs

- `docs/source-editing-model.md`
- `research/extracted-text/www.ecgsim.org/manual/heart.txt`
- Inventory from task `0026`.

## Deliverables

- Add selection modes identified as required for parity.
- Represent transition-zone weights explicitly.
- Update edit transactions to store concrete affected nodes/weights.

## Verification

- Unit tests cover selection math.
- App tests verify selection mode changes alter selected regions.

## Done When

Selection behavior is expressive enough for legacy editing workflows.
