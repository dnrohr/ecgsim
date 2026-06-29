# 0012 Plot TMP Waveforms

## Objective

Plot TMP waveform data for selected or representative heart nodes.

## Minimal Context

The TMP pane displays initial and user-adapted transmembrane potentials. This task can begin with representative node selection before interactive selection is implemented.

## Inputs

- Matrix/vector readers from task 0004.
- TMP/source data from cases or exports.
- `research/extracted-text/www.ecgsim.org/manual/membrane.txt`

## Deliverables

- Plot TMP waveform for at least one node.
- Show initial versus adapted values if available.
- Document parameter and unit assumptions.

## Verification

- Plot renders nonblank.
- Selected node/time dimensions match metadata.
- Test or smoke command passes.

## Done When

TMP waveform data can be inspected visually from legacy data.
