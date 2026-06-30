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
