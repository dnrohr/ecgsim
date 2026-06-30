# Surface Potential Map Notes

Status: task `0042` first measured-BSPM slice.

## Supported In Current Viewer

- The viewer fixture now preserves a compact measured thorax surface-potential map from the parsed `300 x 1000` PMatrix payload.
- The Thorax surface selector enables measured BSPM when a `surfaceMap` fixture exists.
- Measured BSPM colors are mapped onto the 300-node thorax geometry.
- The shared time cursor selects the displayed map frame.
- Thorax map rendering is covered by fixture regression tests and browser workflow tests.

## Current Limitations

- The current map is measured surface-potential data from the parsed PMatrix; initial/adapted simulated BSPM modes are still unavailable until recomputation and signal classification are implemented.
- Sensitivity maps remain unavailable until probe mode and transfer/sensitivity data are connected.
- The colormap uses an automatic global range from the compact fixture; legacy color-scale preferences and isofunction-only rendering are future parity work.
- The compact map fixture stores the shared `576`-sample window currently used by TMP/ECG time synchronization, not the full `1000` ECG samples.
