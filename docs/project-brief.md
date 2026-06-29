# Project Brief

## Goal

Create a modern ECGSIM: a maintainable, cross-platform application that can load legacy ECGSIM data and support interactive exploration of cardiac source parameters, transmembrane potentials, ECG leads, and body-surface potential maps.

## Legacy ECGSIM In One Paragraph

ECGSIM is a forward simulator. It models body-surface potentials from transmembrane potentials on myocardial surface geometry using an equivalent surface source model and precomputed transfer functions. It is used for education and research, not direct diagnosis or inverse reconstruction.

## Initial Product Target

The first useful version should be a read-only compatibility viewer:

- Load existing `.ECGsimcase` files.
- Render heart and thorax geometry.
- Show available lead systems and ECG signals.
- Show TMP waveform and source parameters for selected nodes.
- Expose enough metadata to validate parsing and units.

Editing and recomputation should come after the viewer proves that data loading and visualization are correct.

## Core Concepts

- **Case file**: `.ECGsimcase`, the legacy container for model, source, and signal data.
- **Heart model**: atrial and/or ventricular surface geometry with node-based source parameters.
- **Thorax model**: thorax/lung/electrode geometry and body-surface potential display.
- **TMP**: transmembrane potential waveform at heart nodes.
- **Lead systems**: 12-lead ECG, Frank VCG, BSPM, minimap, or single thorax-node lead depending on case.
- **Transfer function**: matrix mapping myocardial source behavior to body-surface potentials.

## Non-Goals For Early Work

- Do not begin with a polished full application shell.
- Do not invent new file formats before legacy formats are understood.
- Do not rewrite the scientific model based only on UI behavior.
- Do not treat the legacy app packages as source material to commit.

## Source Material

The collected website archive is under `research/`. The most useful entry point is `research/website-notes.md`.
