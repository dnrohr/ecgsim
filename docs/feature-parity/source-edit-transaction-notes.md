# Source Edit Transaction Notes

Status: task `0046` parity notes for source-edit transactions.

## Supported In Current Viewer

- TMP apply, increment/decrement, selected-parameter reset, and beat reset record deterministic transactions.
- Undo restores each transaction's previous adapted values.
- Redo reapplies each transaction's next adapted values.
- Single-selection and expand-selection modes store concrete node weights in transaction metadata.
- Save/Load edits persists adapted values and transaction stacks through the modern sidecar format.

## Current Limitations

- The legacy `resetPreviousThenApply` and independent named-region workflows are not exposed as separate controls yet.
- `.ECGsimcase` export/write-back is deferred to later export tasks.
- Undo/redo currently covers ventricular TMP parameter edits in the web viewer.

## Data Model

Each transaction stores source kind, beat ID, selection metadata, and concrete per-node adapted-value changes. This keeps undo/redo independent of future changes to radius or transition-zone math.
