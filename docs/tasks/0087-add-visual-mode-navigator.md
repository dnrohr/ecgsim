# 0087 Add Visual Mode Navigator

## Objective

Add a compact navigator that lets users jump directly to important visual modes across Heart, Thorax, TMP, and Leads panes.

## Minimal Context

The app has per-pane controls, but users still need to know where to look. A modern equivalent of ECGSIM's visual mode discoverability should expose common modes from one place without changing the visual-first workspace.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/src/styles.css`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add a toolbar-level visual mode navigator.
- Navigator choices should set the corresponding pane controls and scroll/focus the target pane.
- Include Heart, Thorax, TMP, and Leads destinations.
- Add app workflow assertions for representative navigator paths.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

A user can select common visual modes from one navigator and the relevant pane updates with the correct mode badge/status.

## Completion Notes

Status: complete.

- Added a toolbar-level visual mode navigator covering representative Heart, Thorax, TMP, and Leads modes.
- Wired navigator choices to existing pane controls, including Heart surfaces, Thorax BSPM/sensitivity, TMP traces, Leads adapted recompute, and Frank VCG lead traces.
- Added app workflow assertions that navigator selections update pane modes, badges, and backing controls.
