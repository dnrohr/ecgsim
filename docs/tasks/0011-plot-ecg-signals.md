# 0011 Plot ECG Signals

## Objective

Plot ECG lead signals from parsed legacy data.

## Minimal Context

The leads pane should eventually overlay measured, initial simulated, adapted simulated, electrogram, and RMS signals. Start with whichever ECG signal data is available from the parser.

## Inputs

- Matrix reader from task 0004.
- Case or export data containing ECG signals.
- `research/extracted-text/www.ecgsim.org/manual/leads.txt`

## Deliverables

- Plot lead signal traces with time axis.
- Document sample rate assumptions.
- Include lead names when available.

## Verification

- Plot renders nonblank.
- Dimensions match parser metadata.
- Time axis uses documented sample rate or explicitly labels unknown rate.

Task result:

- Added an offset-driven `.ECGsimcase` `PMatrix` reader for known matrix payloads.
- Exported a viewer fixture from the first `PECG/PMatrix` block in `normal_male2.ECGsimcase`.
- The plotted fixture is `300 x 1000` thorax-node surface-potential data, shown as six representative node leads. Standard 12-lead transformation is not implemented yet.
- Time axis uses the ECGSIM manual's documented `1000 Hz` sample frequency for ECG and surface-potential export matrices.

## Done When

Legacy ECG signal data can be inspected visually in the viewer/prototype.
