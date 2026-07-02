# 0076 Expand Legacy Export Directory Writer

## Objective

Emit more of the legacy `File -> Export` directory structure from modern data.

## Minimal Context

The current writer emits a supported subset. Missing high-value artifacts include generated TMP `.user.source`, electrodes, adapted ECG, and broader model files.

## Inputs

- `ecgsim/io/export_directory.py`
- `docs/file-formats/export-formats.md`
- Promoted legacy export fixtures
- `tools/compare_export_directories.py`

## Deliverables

- Add supported output files only where values and units are understood.
- Record unsupported legacy members in metadata.
- Compare against captured legacy exports where paths are comparable.

## Verification

- Export writer tests read emitted files back.
- Directory comparison tests cover new emitted paths.
- Fixture manifest and numerical tests pass.

## Done When

Modern export directories contain the highest-value scientifically honest legacy-style outputs.

## Completion Notes

Status: complete.

- Added generated `ventricular_beats/beat1/user.source` TMP waveform matrix output when all adapted TMP source parameters are available.
- Kept the writer on documented ASCII matrix format and continued recording unsupported legacy members in `metadata.json`.
- Updated export compatibility docs to identify `user.source` as generated modern output from the calibrated TMP generator, not broad byte/value parity for every legacy case.
- Expanded export-directory tests to read the emitted `user.source` matrix back and verify dimensions and representative values.
