# 0078 Add MATLAB ReadECGsim Compatibility Smoke Tests

## Objective

Smoke-test modern exported files against the documented MATLAB/readECGsim expectations where practical.

## Minimal Context

The website archive includes MATLAB helpers, but the modern writer is a supported subset rather than a full legacy clone.

## Inputs

- `research/source/www.ecgsim.org/downloads/readECGsim.m`
- `docs/file-formats/export-formats.md`
- `ecgsim/io/export_directory.py`
- `tools/compare_export_directories.py`

## Deliverables

- Identify which exported files should be readable by archived MATLAB helpers.
- Add smoke tests or documented manual commands for compatible files.
- Document files intentionally outside compatibility.

## Verification

- Automated tests run where no MATLAB dependency is required.
- Manual verification notes are committed if MATLAB/Octave is required.

## Done When

Interoperability claims are backed by repeatable evidence.

## Completion Notes

Status: complete.

- Added `tools/read_ecgsim_compatibility.py` to report files readable by `loadmat.m`/`loadtri.m` ASCII conventions and files missing for full `readECGsim.m` compatibility.
- Added tests for a synthetic export and a generated normal-male modern export.
- Documented the repeatable smoke command and the manual MATLAB/Octave command in `docs/import-export-compatibility.md`.
- Current expected status is `partial` because transfer matrices, adjacency/distance matrices, cavity geometries, and electrode `.elec` files are not emitted yet.
