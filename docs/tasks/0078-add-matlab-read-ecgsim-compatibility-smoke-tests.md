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
