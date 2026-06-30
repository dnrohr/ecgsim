# 0047 Implement Source Edit Persistence Model

## Objective

Persist source edits across recomputation, reload, and export workflows.

## Minimal Context

Current edits exist only in browser memory for the fixture session.

## Inputs

- `docs/source-editing-model.md`
- Case loader API from task `0033`.
- Export/save tasks `0054` and `0055`.

## Deliverables

- Define serialized edit/adaptation format.
- Implement load/save of adapted values in app state.
- Document compatibility with legacy save/export.

## Verification

- Tests round-trip edits through the chosen persistence format.
- Recomputed outputs use adapted values after reload.

## Done When

Edits are durable enough to support recomputation and export.

## Completion Note

Completed by defining a versioned `org.ecgsim.source-edits` sidecar snapshot and wiring Save/Load edits controls to browser local storage keyed by case SHA-256. The snapshot persists adapted TMP values plus undo/redo transaction stacks for recomputation/export plumbing; legacy `.ECGsimcase` write-back remains deferred to export/save tasks.
