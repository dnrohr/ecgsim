# 0074 Expand Linked Time And Playback Coverage

## Objective

Ensure every time-dependent view participates correctly in linked time and playback.

## Minimal Context

Time state already links several panes. New TMP-at-time, recomputed BSPM, and movie workflows will increase the surface area.

## Inputs

- `app/viewer/src/main.js`
- Existing browser app workflow tests
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Audit all time-dependent views and controls.
- Add keyboard, slider, playback, and plot interaction coverage.
- Fix stale or inconsistent time rendering.

## Verification

- Browser/app tests cover time changes across Leads, TMP, Heart TMP-at-time, Thorax BSPM, and playback.

## Done When

Time-linked behavior is predictable across all implemented dynamic views.
