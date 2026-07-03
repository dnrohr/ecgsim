# 0099 Add VCG Visualization Mode

## Objective

Add a discoverable VCG loop visualization for Frank VCG lead-system cases.

## Minimal Context

The ECGSIM manual describes the VCG view as three projections of a 3D vector loop derived from the Frank lead system: horizontal, frontal, and sagittal. The current parser exposes Frank lead-system electrode traces, but exact legacy Frank transform/reference semantics are still unresolved. This task adds a data-backed modern preview while documenting that limitation.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- `app/viewer/index.html`
- `app/viewer/src/main.js`
- `app/viewer/scripts/app-test.mjs`
- `docs/feature-parity/leads-view-notes.md`

## Deliverables

- Add a Leads VCG loop visual mode for Frank VCG systems.
- Draw three labeled projection panels from parsed Frank traces.
- Highlight the shared selected time on the loop when it is inside the visible window.
- Label provenance/status honestly while exact Frank transform parity remains unresolved.
- Add workflow coverage that VCG loop mode is discoverable and redraws the Leads canvas.

## Verification

- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`

## Done When

A user can select the Frank VCG lead system and see a three-plane VCG loop preview with automated visual-smoke coverage.

## Completion Notes

Status: complete.

- Added a `VCG loop` Leads control and wired the existing visual-mode navigator to enable it for `VCG_(Frank)`.
- Draws horizontal, frontal, and sagittal loop projections from the first three parsed Frank traces.
- Uses the same time cursor and zoom window as Leads/TMP waveform views.
- Added workflow assertions for VCG loop metadata, status provenance, mode badge, and canvas redraw.
