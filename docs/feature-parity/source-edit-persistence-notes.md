# Source Edit Persistence Notes

Status: task `0047` parity notes for source-edit persistence.

## Format

The web viewer serializes source edits as a versioned sidecar object:

```json
{
  "schema": "org.ecgsim.source-edits",
  "version": 1,
  "case": {
    "fileName": "normal_male2.ECGsimcase",
    "sha256": "..."
  },
  "sourceKind": "ventricles",
  "beatId": "beat1",
  "nodeCount": 576,
  "sampleCount": 576,
  "sampleRateHz": 1000,
  "adaptedValues": {
    "depolarizationMs": []
  },
  "undoStack": [],
  "redoStack": [],
  "nextTransactionId": 2
}
```

## Current Behavior

- Save/Load edits buttons persist the current TMP adapted values and transaction stacks in browser local storage.
- Snapshots are keyed by case SHA-256 and rejected when loaded into a different case.
- Loading a snapshot updates the adapted values used by TMP preview generation.

## Legacy Compatibility

This is not `.ECGsimcase` write-back. It is a stable modern sidecar format intended to feed recomputation and export tasks `0054` and `0055`. Legacy file compatibility still needs raw export evidence and a writer specification before case files are modified.
