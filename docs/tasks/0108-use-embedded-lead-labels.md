# 0108 Use Embedded Lead Labels

Status: complete.

## Goal

Promote the decoded lead-object labels from task `0107` into the high-level lead-system parser so modern views and fixtures can use legacy labels instead of fallback names.

## Scope

- Update `read_ecgsimcase_lead_systems()` to read embedded labels from `PLead`, `PLeadReference`, and `PShowLead` payloads.
- Preserve fallback labels only when a labeled payload cannot be decoded.
- Update parser regression tests so standard 12-lead label `I` is exposed instead of fallback `lead1`.
- Document that label parsing is now confirmed while polarity/reference equations remain unresolved.

## Out Of Scope

- Enabling measured/initial clinical ECG overlays.
- Decoding WCT/reference equations from trailing fields.
- Regenerating viewer fixtures; current fixture metadata serializes lead-system counts and electrodes, not the lead label arrays.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python -m unittest discover -s tests`
- `python tools/audit_visual_parity.py docs\feature-parity\visualization-matrix.md`
- `git diff --check`
