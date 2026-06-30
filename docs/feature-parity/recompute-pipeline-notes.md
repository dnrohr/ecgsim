# Recompute Pipeline Notes

Status: task `0051` blocker notes.

## Current State

The viewer recomputes TMP preview traces immediately after source edits because adapted source-parameter vectors are updated in app state. Downstream ECG, BSPM, and lead recomputation is not yet scientifically meaningful.

## Blockers

- Task `0049` is blocked by missing raw legacy `.user.source` exports, so the TMP generator remains a deterministic preview rather than a parity-tested source matrix generator.
- Source-to-thorax and source-to-lead transfer matrices are not yet parsed from `.ECGsimcase`; `PGraphGeometry` and relevant `PMatrix` roles still need confirmed mapping.
- Current Leads and Thorax panes use measured surface-potential fixtures, not simulated initial/adapted recomputation outputs.

## Required Before Enabling

1. Capture raw legacy exports or otherwise establish TMP generator parity.
2. Identify and parse transfer matrices for ventricular source to thorax/lead targets.
3. Feed adapted source matrices through `ecgsim.core.apply_transfer_function`.
4. Update Thorax/Leads overlays with explicit measured, initial, and adapted classifications.

Until then, source edits must not be presented as changing ECG/BSPM outputs.
