# 0095 Expand Thorax Probe And Electrode Target Workflows

## Objective

Add a parsed-electrode target workflow for Thorax probe/contribution inspection.

## Minimal Context

Thorax node selection already drives Heart contribution maps. Legacy workflows also let users reason in terms of lead/electrode targets. Parsed lead-system electrodes include nearest thorax-node indexes, so the modern app can expose a direct target shortcut.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/golden-workflows.md`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add a Thorax electrode-target selector for the active lead system.
- Selecting an electrode should select its mapped thorax node and update probe/contribution state.
- Keep the selector synchronized with lead-system changes.
- Add workflow coverage for electrode target selection and Heart contribution redraw.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

A user can target a parsed electrode in the Thorax pane and use that target for Heart contribution inspection, with automated coverage.

## Completion Notes

Status: complete.

- Added a Thorax electrode-target selector and `Target` action populated from the active parsed lead system.
- Targeting an electrode selects its mapped thorax node, updates probe state, and drives Heart contribution maps.
- Added app workflow assertions for selector availability, parsed electrode-to-node targeting, and Heart contribution redraw from an electrode target.
