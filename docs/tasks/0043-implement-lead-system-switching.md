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
