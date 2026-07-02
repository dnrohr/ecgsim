# 0086 Add Pane Mode Badges And Data Provenance Labels

## Objective

Make each visual pane declare what it is showing and where the displayed data came from.

## Minimal Context

Visualization parity does not require ECGSIM's exact layout, but it does require discoverability. Users should be able to tell whether a pane is showing parsed geometry, case signals, derived source parameters, recomputed transfer-function output, or imported data.

## Inputs

- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/src/styles.css`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/visualization-matrix.md`

## Deliverables

- Add compact mode and provenance badges to Heart, Thorax, TMP, and Leads pane headers.
- Keep badge text short enough for the compact visual-first workspace.
- Update badges when the active visual mode, source, or recomputation path changes.
- Add workflow assertions that badges exist at launch and update for representative mode changes.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

Each pane visibly names the current mode and data provenance, and automated workflow tests fail if those labels stop updating.

## Completion Notes

Status: complete.

- Added compact mode and provenance badges to Heart, Thorax, TMP, and Leads pane headers.
- Wired badges to Heart surface modes, Thorax BSPM/sensitivity modes, TMP trace visibility, and Leads source/filter/recompute paths.
- Added app workflow assertions for launch badges and representative mode/provenance transitions.
