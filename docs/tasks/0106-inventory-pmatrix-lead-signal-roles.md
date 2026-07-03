# 0106 Inventory PMatrix Lead Signal Roles

Status: complete.

## Goal

Create repeatable evidence for case `PMatrix` roles that affect Leads visualization parity, especially measured/initial/adapted overlay and lead-transform blockers.

## Scope

- Add a parser-facing `read_ecgsimcase_matrix_inventory()` API.
- Record `PMatrix` index, offset, version, shape, parse status, owner hint, and conservative role hint.
- Generate a JSON inventory for all archived `.ECGsimcase` files.
- Pin root signal, thorax-by-source transfer, and lead-system matrix patterns in tests.

## Findings

- The first `PMatrix` is the root thorax-node surface-potential time series.
- Matrix 21 is a thorax-by-source transfer candidate: `300x576` for `normal_male2` and `500x697` for WPW cases.
- The standard 12-lead and BSPM lead-system matrix slots are empty placeholders in the archived cases.
- The VCG and minimap lead-system matrix slots parse as small transform candidates: `3x7` and `3x9`.

## Out Of Scope

- Declaring measured, initial, and adapted ECG overlays fully decoded.
- Enabling standard 12-lead or BSPM WCT/reference transforms from empty matrix slots.
- Resolving `PLead` and `PLeadReference` polarity/reference fields.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python tools/inspect_case_matrices.py research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase --output research/pmatrix-inventory.json`
