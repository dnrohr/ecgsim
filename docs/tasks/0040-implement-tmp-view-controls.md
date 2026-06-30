# 0040 Implement TMP View Controls

## Objective

Implement legacy TMP view controls beyond the initial parameter editor.

## Minimal Context

Current TMP view shows initial/adapted generated previews for selected nodes and basic parameter edits.

## Inputs

- `docs/feature-parity/inventory.md`
- `research/extracted-text/www.ecgsim.org/manual/membrane.txt`
- `docs/source-editing-model.md`

## Deliverables

- Add TMP display modes and parameter handlers identified in inventory.
- Show initial/adapted/source values clearly.
- Add tests for control state, edits, and redraws.

## Verification

- Edits preserve source state and redraw expected curves.
- Unsupported stored-only parameters remain clear.

## Done When

TMP workflows match the documented legacy controls that current data supports.

## Result

- Added TMP trace visibility controls for initial/adapted curves and grid display.
- Added handler-style increment/decrement controls using each editable parameter step.
- Added parameter status text showing initial/adapted values, units, and selected-node count.
- Added visible disabled entry points for combined resting/amplitude handlers, keep-constant-APD, and electrogram display where backing data/semantics are unavailable.
- Documented current TMP support and remaining blockers in `docs/feature-parity/tmp-view-notes.md`.
