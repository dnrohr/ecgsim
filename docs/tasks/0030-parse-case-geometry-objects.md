# 0030 Parse Case Geometry Objects

## Objective

Parse named geometry objects directly from `.ECGsimcase` files.

## Minimal Context

Current viewer geometry comes from archived `.tri` files. Real case loading needs geometry from each selected case.

## Inputs

- `docs/file-formats/ecgsimcase-object-model.md`
- `ecgsim/io/ecgsimcase.py`
- `ecgsim/io/geometry.py`
- Cases under `research/source/www.ecgsim.org/downloads/cases/`.

## Deliverables

- Add parser support for case-contained geometry objects.
- Return named heart/thorax/lung/electrode geometry where available.
- Add tests for normal and WPW cases.

## Verification

- Parsed counts match known geometry fixtures or documented case metadata.
- Parser fails with clear errors for unsupported geometry payloads.

## Done When

Viewer fixtures no longer need external `.tri` files for supported case geometry.
