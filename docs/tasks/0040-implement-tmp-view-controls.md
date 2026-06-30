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
