# Recompute Pipeline Notes

Status: task `0051` blocker notes.

## Current State

The viewer recomputes TMP traces immediately after source edits because adapted source-parameter vectors are updated in app state. Task `0049` replaced the preview-only TMP curve with a generator calibrated against the normal male ECGSIM 3.0.1 `.user.source` export. Downstream ECG, BSPM, and lead recomputation is not yet scientifically meaningful.

## Blockers

- Source-to-thorax and source-to-lead transfer matrices are not yet parsed from `.ECGsimcase`; `PGraphGeometry` and relevant `PMatrix` roles still need confirmed mapping.
- Current Leads and Thorax panes use measured surface-potential fixtures, not simulated initial/adapted recomputation outputs.

## Required Before Enabling

1. Identify and parse transfer matrices for ventricular source to thorax/lead targets.
2. Feed adapted source matrices through `ecgsim.core.apply_transfer_function`.
3. Update Thorax/Leads overlays with explicit measured, initial, and adapted classifications.
4. Compare recomputed outputs against promoted `.adaptECG`/`.refECG` fixtures and document residuals.

Until then, source edits must not be presented as changing ECG/BSPM outputs.
