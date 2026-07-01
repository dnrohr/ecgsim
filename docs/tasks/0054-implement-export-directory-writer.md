# 0054 Implement Export Directory Writer

## Objective

Implement modern export-directory output compatible with legacy ECGSIM conventions where possible.

## Minimal Context

Legacy File -> Export writes structured model/source/ECG outputs. Modern app currently has no export writer.

## Inputs

- `docs/file-formats/export-formats.md`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`
- Captured raw exports from task `0048`.

## Deliverables

- Add export writer for supported matrices, vectors, geometry, ECG, source, and metadata.
- Add CLI or app entry point for export.
- Document unsupported export members.

## Verification

- Exported files can be read by project readers.
- Where legacy references exist, output shape/values match tolerance.

## Done When

Users can export useful data from modern ECGSIM for supported cases.

## Progress

Completed the first useful export-directory writer slice.

- Added `ecgsim.io.export_case_directory()` plus ASCII matrix, vector, and `.tri` writer helpers.
- Added `python -m ecgsim.cli.export_case <case-file> <output-dir>` and the installed `ecgsim-export-case` script entry.
- Exported supported parsed content into legacy-style directories: model geometry `.tri` files, source parameter `user.*` vectors, `ecgs/thorax.refECG`, and `metadata.json`.
- Documented unsupported legacy export members in `docs/feature-parity/export-directory-writer-notes.md`.
- Added regression coverage that exports `normal_male2.ECGsimcase` to a temp directory and reads exported files back through project readers.

This is a supported modern subset, not a full legacy `File -> Export` clone. Exact export parity should be expanded against promoted raw legacy fixtures, starting with the normal male ECGSIM 3.0.1 capture from task `0048`.
