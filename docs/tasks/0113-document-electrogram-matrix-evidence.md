# 0113 Document Electrogram Matrix Evidence

Status: complete.

## Goal

Make the TMP electrogram blocker precise and data-backed by exporting case-level evidence about the absence of selected-node electrogram payload candidates.

## Context

The legacy manual says `Show EGM` displays the electrogram of the selected heart-surface node in the TMP pane. The current parser can generate TMP waveforms from source parameters, but no selected-node electrogram payload or confirmed derivation equation has been identified.

## Changes

- Viewer case metadata now includes an `electrogram` capability object.
- The object records:
  - status and support flag;
  - inspected `PMatrix` count;
  - ventricular source-node count and signal sample count;
  - source-node-by-time candidate count;
  - rejected-shape evidence for thorax time series, source-square matrices, and thorax-by-source transfer matrices.
- The disabled TMP EGM control now uses the case-specific evidence reason and exposes evidence status/count attributes for workflow tests.
- Case validation now includes `selected-node electrogram visualization` as an unavailable capability.
- Regression, smoke, and browser workflow tests pin the evidence.

## Findings

Across all bundled cases, the matrix inventory contains no `source nodes x samples` or `samples x source nodes` matrix candidate:

- `normal_male2`: `576` ventricular source nodes, `1000` samples, `0` electrogram candidates.
- WPW bundles: `697` ventricular source nodes, `817`, `850`, or `1138` samples, `0` electrogram candidates.
- Each case still has the expected thorax-node time series, seven source-square matrices, and one thorax-by-source transfer matrix.

## Out Of Scope

- Enabling selected-node electrogram display.
- Inventing a synthetic EGM from TMP derivatives without legacy evidence.
- Decoding a final electrogram derivation equation.

## Verification

- `python -m unittest discover -s tests`
- `npm --prefix app/viewer test`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:visual-modes`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
