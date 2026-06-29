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

Task result:

- Added an offset-driven `.ECGsimcase` `PVector` reader for known source-parameter payloads.
- Exported a TMP preview fixture from ventricular source vectors in `normal_male2.ECGsimcase`.
- The plotted fixture contains five representative heart nodes, `576` samples, and initial/adapted traces. Initial and adapted vectors are identical in the source case for the sampled parameters.
- This is a parameter-derived preview, not a parity-verified legacy TMP generator. Exact TMP generation remains task `0021`.
- Time axis uses `1000 Hz` as a working preview rate; the source parameters are stored in milliseconds and the manual documents `1000 Hz` for exported ECG/surface-potential matrices. The TMP export sample rate still needs parity confirmation.

## Done When

TMP waveform data can be inspected visually from legacy data.
