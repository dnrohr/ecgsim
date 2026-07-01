# 0075 Implement ECGsimsource Import Export

## Objective

Support source-parameter interchange through an `.ECGsimsource`-style workflow.

## Minimal Context

Modern sidecars preserve source edits, but legacy `.ECGsimsource` compatibility remains unsupported.

## Inputs

- `docs/file-formats/export-formats.md`
- `docs/import-export-compatibility.md`
- `ecgsim/io/`
- Existing sidecar implementation

## Deliverables

- Document known `.ECGsimsource` structure or capture requirements.
- Implement import/export if the format is sufficiently understood.
- Otherwise add a validated modern interchange path and explicit legacy limitation.

## Verification

- Round-trip tests preserve edited source parameters.
- Compatibility smoke uses a real or documented fixture when available.

## Done When

Source interchange is explicit, tested, and no longer only a modern sidecar story.
