# Recompute Pipeline Notes

Status: task `0051` first recompute pipeline slice.

## Current State

The viewer recomputes TMP traces immediately after source edits because adapted source-parameter vectors are updated in app state. Task `0049` replaced the preview-only TMP curve with a generator calibrated against the normal male ECGSIM 3.0.1 `.user.source` export. Task `0051` adds adapted Thorax BSPM recomputation by applying a shape-matched ventricles-to-thorax transfer candidate to adapted TMP samples at the shared time cursor.

## Implemented

- `tools/export_viewer_fixtures.py` includes the first `300 x 576` PMatrix matching thorax nodes by ventricular source nodes as `transferMatrices.ventriclesToThorax`.
- The Thorax pane enables `Adapted BSPM` when that transfer candidate is present.
- The adapted map is recomputed from live adapted TMP parameters after edits, undo/redo, reset, source-edit load/import, and time-cursor changes.
- Browser workflow tests verify that adapted Thorax BSPM rendering changes after a TMP edit.

## Remaining Before Lead ECG Parity

1. Confirm source-to-lead transfer matrix roles and reference handling.
2. Apply fiducial/baseline/filtering parity from task `0052`.
3. Compare recomputed outputs against promoted `.adaptECG`/`.refECG` fixtures in task `0053`.
4. Decide whether initial BSPM should be generated on demand or stored as a fixture-backed overlay.

Task `0066` adds a browser-side adapted lead-trace preview by sampling edited TMP waveforms through the same ventricles-to-thorax transfer candidate used for adapted Thorax BSPM and reading the selected lead system's parsed electrode thorax nodes. Task `0110` composes those electrode traces through parsed lead/reference definitions where direct electrode indices are available. This makes lead traces respond to source edits, but it should not be described as verified legacy lead ECG parity until lead reference-weight equations and measured/initial signal classification are decoded.
