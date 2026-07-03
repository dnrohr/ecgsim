# 0114 Add Legacy Measured ECG Export Overlay

Status: complete.

## Goal

Expose measured Leads traces when there is promoted legacy export evidence, without claiming pixel-perfect UI parity or decoded arbitrary `.ECGsimcase` signal classification.

## Context

Task `0112` added initial/adapted recompute overlays, but the Measured checkbox still stayed disabled because the parser has not decoded measured/initial/adapted classification from every case payload. The promoted ECGSIM 3.0.1 normal-male export fixture includes `.refECG` matrices that can act as measured trace evidence for matching lead systems.

## Changes

- Added `legacyReferenceEcg` fixture data for `normal_male2.ECGsimcase` from `tests/fixtures/legacy-parity/normal-male-ecgsim301/ecgs/*.refECG`.
- Enabled the Leads `Measured` checkbox only when the selected lead system has a matching promoted `.refECG` matrix.
- Added provenance/status text so users can distinguish promoted legacy measured exports from parsed case traces and recomputed previews.
- Kept WPW measured overlays disabled because no promoted matching `.refECG` evidence is bundled for those case fixtures.
- Updated parity docs to narrow the blocker to arbitrary case-payload measured classification and final lead reference-weight equations.

## Evidence

The promoted normal-male measured export fixture currently covers:

| Lead system | Matrix |
| --- | --- |
| `standard_12` | `12 x 500` |
| `VCG_(Frank)` | `10 x 500` |
| `BSM_(nijmegen_64)` | `64 x 500` |
| `minimap_montage` | `12 x 500` |

These traces are export-backed measured ECG evidence. They are not derived from decoded `.ECGsimcase` signal role fields.

## Verification

Run:

```powershell
python tools/export_viewer_fixtures.py
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
