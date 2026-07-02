# 0070 Implement Focus Editing Workflow

## Objective

Expose activation/focus inspection and editing workflows for supported WPW cases.

## Minimal Context

Activation payload parsing and route-solving foundations exist. Task `0070` adds conservative viewer controls for WPW activation/focus inspection without claiming raw legacy field parity.

## Inputs

- `ecgsim/core/activation.py`
- Parsed activation data in case metadata fixtures
- `app/viewer/src/`
- WPW archived cases

## Deliverables

- Add focus/activation UI state for supported WPW cases.
- Allow safe preview edits only where recomputation semantics are documented.
- Show unavailable state for unsupported focus fields.

## Verification

- Unit tests cover activation edits and route recomputation.
- Browser/app test inspects focus state in a WPW case and verifies supported edit behavior or unavailable messaging.

## Done When

WPW focus workflows are inspectable and no longer only parser-level data.

## Completion Notes

Status: complete.

- Added TMP pane Focus controls that show WPW ventricular activation record counts.
- Added selected-heart-node focus preview with editable start time and velocity using a documented `linear-index-preview` fastest-route calculation.
- Left Opposite wall and raw activation-field writes disabled with tooltips because wall-pair and raw field semantics remain unresolved.
- Updated smoke/browser tests and docs to describe the preview limits.
