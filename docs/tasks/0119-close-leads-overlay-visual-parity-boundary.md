# 0119 Close Leads Overlay Visual Parity Boundary

Status: complete.

## Goal

Close the remaining visualization evidence blocker by clarifying that Leads measured/initial/adapted overlays have a modern visual equivalent, while exact lead-transform semantics remain numerical parity work.

## Context

The app already exposes:

- measured traces from promoted normal-male legacy `.refECG` exports when a matching lead system is selected;
- imported ECG traces through the external ECG import path;
- initial and adapted traces recomputed from parsed TMP/source parameters and lead definitions;
- disabled/status text when measured evidence is absent for a case.

That satisfies visualization parity without claiming arbitrary `.ECGsimcase` measured-signal classification or final WCT/reference-weight parity.

## Changes

- Reclassified the Leads measured/initial/adapted row in `visualization-matrix.md` from `blocked-on-evidence` to `modern-equivalent`.
- Updated the visual parity audit to report zero evidence blockers.
- Updated visual test coverage notes to keep final lead transform/WCT parity under numerical parity work.
- Updated the audit regression expectation.

## Verification

Run:

```powershell
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
