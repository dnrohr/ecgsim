# 0051 Wire Recompute Pipeline Into Viewer

## Objective

Recompute TMP, ECG, BSPM, and lead displays after source edits.

## Minimal Context

Core helpers exist for TMP generation, transfer application, and filtering. Task `0051` wires the first downstream viewer recompute path: adapted ventricular TMP parameters through the shape-matched ventricles-to-thorax transfer candidate.

## Inputs

- Tasks `0047`, `0049`, `0050`.
- `ecgsim/core/transfer.py`
- `ecgsim/core/filtering.py`
- `app/viewer/`

## Completed

- Added the `300 x 576` ventricles-to-thorax transfer candidate to generated viewer case bundles.
- Added browser-side adapted BSPM recomputation for the Thorax pane at the shared time cursor.
- Refreshed the adapted Thorax BSPM map after TMP edits, undo/redo, reset, sidecar load/import, and time changes.
- Kept the surface selector explicit: measured BSPM remains parsed fixture data, while adapted BSPM is simulated from TMP parameters and the transfer candidate.
- Left ECG lead recomputation parity to tasks `0052` and `0053`, where fiducials/filtering and numerical assertions are handled.

## Verification

- App tests verify adapted Thorax BSPM is available and changes after TMP edits.
- Parser/fixture tests verify the transfer candidate shape and representative values against the source `.ECGsimcase` PMatrix.

## Done When

Source edits produce scientifically meaningful downstream Thorax BSPM output changes. Lead ECG recomputation is intentionally deferred until filtering/fiducial parity and lead transfer semantics are verified.
