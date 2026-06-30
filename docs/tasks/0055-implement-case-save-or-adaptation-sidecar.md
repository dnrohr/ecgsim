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

## Progress

Completed with a modern sidecar as the first safe persistence path.

- Chose sidecar persistence over legacy `.ECGsimcase` write-back until the full object graph and raw export references are available.
- Reused the versioned `org.ecgsim.source-edits` snapshot from task `0047`.
- Added browser-side Export edits and Import edits controls for portable `.source-edits.json` files.
- Import validates the sidecar schema, case SHA-256, node count, and adapted vector lengths before applying values.
- Successful import also stores the sidecar in local storage so the existing Load edits path remains available.
- Browser workflow tests now verify download, JSON schema, reset, import, and adapted-value restoration.

Legacy `.ECGsimcase` write-back remains intentionally unsupported.
