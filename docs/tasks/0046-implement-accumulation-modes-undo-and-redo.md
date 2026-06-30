# 0046 Implement Accumulation Modes Undo And Redo

## Objective

Implement legacy accumulation modes plus undo/redo for source edits.

## Minimal Context

The source editing model already names edit policies, but the viewer only applies direct current-region edits.

## Inputs

- `docs/source-editing-model.md`
- Inventory from task `0026`.
- `app/viewer/src/tmp-editing.js`.

## Deliverables

- Add edit transaction stack.
- Add undo/redo controls.
- Implement required accumulation policies.

## Verification

- Unit tests cover transaction apply/undo/redo.
- App tests verify visible TMP values after undo/redo and mode changes.

## Done When

Users can reproduce multi-region edit workflows deterministically.

## Completion Note

Completed by adding in-memory TMP edit transactions with undo/redo stacks. Apply, increment/decrement, selected-parameter reset, and beat reset now record concrete adapted-value changes; single and expand selection modes preserve node-weight metadata for deterministic multi-region edits.
