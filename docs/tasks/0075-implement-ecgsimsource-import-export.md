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

## Completion Notes

Status: complete.

- Documented the known legacy `.ECGsimsource` evidence from the manual and the missing byte-level fixture/specification in `docs/file-formats/ecgsimsource.md`.
- Added a validated modern `.ECGsimsource.json` source-info interchange with schema `org.ecgsim.source-info`.
- Added Python I/O helpers and `python -m ecgsim.cli.source_info` / `ecgsim-source-info` for exporting source info from supported cases.
- Added round-trip and validation tests proving source parameters are preserved and incompatible case/vector shapes are rejected.
- Kept byte-compatible legacy `.ECGsimsource` explicitly unsupported until a real fixture is captured.
