# 0043 Implement Lead System Switching

## Objective

Allow users to switch among parsed lead systems.

## Minimal Context

Metadata currently lists standard 12, Frank VCG, BSPM, and minimap systems, but the viewer does not switch real systems.

## Inputs

- Parsed lead-system data from task `0032`.
- `research/extracted-text/www.ecgsim.org/manual/leads.txt`.
- `app/viewer/`.

## Deliverables

- Add lead-system selector.
- Update Leads and Thorax/electrode displays from selected system.
- Preserve coupling/filtering mode across switches.

## Verification

- App tests open a supported case and switch at least two lead systems.
- Trace/electrode counts match parsed data.

## Done When

Lead-system switching is functional and tested for supported cases.

## Result

- Promoted parsed lead-system electrode positions and nearest thorax-node indices into viewer fixtures.
- Leads switching now redraws electrode surface-potential traces for the selected system while preserving coupling, scale, grid, RMS, and time state.
- Thorax electrode markers update from the selected lead system.
- Added regression, smoke, and browser workflow coverage for electrode fixture data, trace counts, and Thorax marker redraws.
- Documented current support and remaining clinical lead-transform blockers in `docs/feature-parity/lead-system-switching-notes.md`.
