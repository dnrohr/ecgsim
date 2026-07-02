# Surface Potential Map Notes

Status: updated through task `0072`.

## Supported In Current Viewer

- The viewer fixture now preserves a compact measured thorax surface-potential map from the parsed `300 x 1000` PMatrix payload.
- The Thorax surface selector enables measured BSPM when a `surfaceMap` fixture exists.
- Measured BSPM colors are mapped onto the 300-node thorax geometry.
- The shared time cursor selects the displayed map frame.
- Initial/adapted BSPM, sensitivity, and measured BSPM use a diverging potential colormap centered around zero.
- The Contours toggle overlays scalar-node contour markers on supported Thorax maps.
- The Lines only toggle shows supported Thorax scalar maps as contour markers over a neutral low-opacity thorax surface.
- Thorax map rendering is covered by fixture regression tests and browser workflow tests.

## Current Limitations

- The current map can show measured surface-potential data from the parsed PMatrix, initial/adapted simulated BSPM from TMP parameters through the transfer candidate, or a transfer-column sensitivity map for the selected heart/source node.
- These computed maps remain preview-level until transfer roles, WCT/reference handling, and legacy screenshot/raw-export parity are strengthened.
- Color scaling is automatic. The diverging palette is legacy-informed for potential polarity, but exact legacy palette stops, contour interpolation, and user scale preferences remain future parity work.
- Contours and line-only mode are node-marker overlays near evenly spaced scalar levels, not interpolated triangle isolines.
- The compact map fixture stores the shared `576`-sample window currently used by TMP/ECG time synchronization, not the full `1000` ECG samples.
