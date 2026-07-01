# 0070 Implement Focus Editing Workflow

## Objective

Expose activation/focus inspection and editing workflows for supported WPW cases.

## Minimal Context

Activation payload parsing and route-solving foundations exist, but the app does not yet provide legacy-like focus tools.

## Inputs

- `ecgsim/core/activation.py`
- Parsed activation data in case metadata fixtures
- `app/viewer/src/`
- WPW archived cases

## Deliverables

- Add focus/activation UI state for supported cases.
- Allow safe edits only where recomputation semantics are documented.
- Show unavailable state for unsupported focus fields.

## Verification

- Unit tests cover activation edits and route recomputation.
- Browser/app test inspects focus state in a WPW case and verifies supported edit behavior or unavailable messaging.

## Done When

WPW focus workflows are inspectable and no longer only parser-level data.
