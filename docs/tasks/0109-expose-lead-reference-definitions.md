# 0109 Expose Lead Reference Definitions

Status: complete.

## Goal

Promote decoded `PLead`, `PLeadReference`, and `PShowLead` trailing fields into structured lead-system definitions so modern visualization work can use parsed electrode/reference/display indices instead of raw inventories.

## Scope

- Add typed lead, reference, and shown-lead definition objects to `ECGsimCaseLeadSystem`.
- Decode `PLead` trailing fields as signal-electrode and reference indices, preserving extra fields.
- Decode `PLeadReference` trailing fields as reference electrode membership plus extra fields.
- Decode `PShowLead` trailing fields as displayed lead indices and grid placement coordinates.
- Export these definitions in viewer fixture metadata.
- Update parser, compact summary, and fixture regression tests.

## Findings

- Standard 12-lead definitions decode consistently across archived cases, for example `I` maps to electrode index `7` and reference index `2`, while `V1` maps to electrode index `0` and reference index `1`.
- `PLeadReference` fields use a leading member count followed by electrode indices; extra fields remain preserved when present.
- `PShowLead` fields expose primary/secondary lead indices and grid positions used by standard, VCG, BSPM, and minimap displays.

## Out Of Scope

- Decoding the final lead polarity or reference-weight equations.
- Enabling measured/initial ECG overlays.
- Claiming clinical standard 12-lead or BSPM transform parity.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python -m unittest tests.test_parity_regression`
- `python -m unittest discover -s tests`
- `python tools/audit_visual_parity.py docs\feature-parity\visualization-matrix.md`
- `npm --prefix app/viewer test`
- `git diff --check`
