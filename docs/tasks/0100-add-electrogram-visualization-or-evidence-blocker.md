# 0100 Add Electrogram Visualization Or Evidence Blocker

## Objective

Either add selected-heart-node electrogram visualization or document the evidence blocker that prevents a truthful implementation.

## Minimal Context

The legacy manual says the ECG menu/toolbutton can show the electrogram of the selected heart-surface node in the TMP pane. Current parser and parity docs do not identify a selected-node electrogram payload, lead/reference mapping, or derivation equation. Implementing a synthetic trace without that evidence would create a misleading visualization.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- `research/extracted-text/www.ecgsim.org/manual/membrane.txt`
- `docs/file-formats/ecgsimcase.md`
- `docs/feature-parity/inventory.md`
- `docs/feature-parity/tmp-view-notes.md`
- `docs/feature-parity/leads-view-notes.md`

## Deliverables

- Confirm whether selected-node electrogram data or equations are available in current source material.
- If not available, keep the EGM UI disabled and label the missing evidence.
- Update parity docs so future work knows what must be captured or parsed before enabling EGM.
- Add workflow coverage that the EGM blocker remains visible and disabled.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

The app either displays a data-backed selected-node electrogram or explicitly blocks the feature with documented missing evidence and automated coverage.

## Completion Notes

Status: complete as evidence blocker.

- Confirmed the manual names the selected-node electrogram behavior but current parsed case docs do not identify the required electrogram payload or derivation equation.
- Kept the TMP EGM control disabled and added a title naming the missing evidence.
- Added app workflow coverage that EGM remains disabled until selected-node electrogram evidence exists.
- Updated visualization parity docs to mark electrogram as blocked on evidence rather than merely unfinished.
