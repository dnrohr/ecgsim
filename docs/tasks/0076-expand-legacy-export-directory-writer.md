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
