# 0055 Implement Case Save Or Adaptation Sidecar

## Objective

Define and implement safe persistence for adapted source edits.

## Minimal Context

Writing legacy `.ECGsimcase` files may be risky until the object graph is fully understood. A sidecar may be safer.

## Inputs

- `docs/source-editing-model.md`
- `docs/file-formats/ecgsimcase-object-model.md`
- Task `0047`.

## Deliverables

- Decide between legacy write-back, sidecar, or both.
- Implement the chosen first persistence path.
- Add import/apply support for saved adaptations.

## Verification

- Round-trip tests preserve adapted values and metadata.
- Original case files are not modified unless explicitly requested.

## Done When

Users can save and reload adaptation work safely.
