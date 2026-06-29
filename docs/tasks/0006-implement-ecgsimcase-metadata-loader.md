# 0006 Implement ECGsimcase Metadata Loader

## Objective

Implement a metadata-only loader for `.ECGsimcase` files.

## Minimal Context

Task 0001 should identify the case container structure. This task should not attempt full simulation data loading. It should expose stable metadata and section inventory.

## Inputs

- `docs/file-formats/ecgsimcase.md`
- `research/source/www.ecgsim.org/downloads/cases/*.ECGsimcase`

## Deliverables

- Add a loader that opens each case and returns metadata plus internal section inventory.
- Add tests covering all four downloaded cases.
- Document unsupported sections.

## Verification

- Tests assert each case can be opened.
- Tests assert expected section/file names and sizes from task 0001.
- Test command passes.

## Done When

Code can inspect `.ECGsimcase` files programmatically without loading every data payload.
