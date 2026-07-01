# 0077 Implement ECG Signal Import

## Objective

Allow users to import external ECG signal matrices for comparison or display.

## Minimal Context

The legacy app supports ECG workflows beyond bundled signals. Modern import should be explicit about units, sample rate, and lead labels.

## Inputs

- `docs/file-formats/export-formats.md`
- `ecgsim/io/matrix.py`
- `app/viewer/src/main.js`
- Leads view code

## Deliverables

- Define accepted ECG import formats.
- Load imported signals into the Leads view with metadata and validation.
- Keep imported data separate from recomputed/model outputs.

## Verification

- Unit tests cover accepted/rejected import files.
- Browser/app test imports a small ECG fixture and verifies lead traces render.

## Done When

External ECG data can be inspected without confusing it with model-generated signals.
