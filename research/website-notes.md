# ECGSIM Website Notes

Source: https://www.ecgsim.org/
Collected: 2026-06-29

## Archive Summary

The archive in `research/source/` preserves the first-party website, manual, images, tutorials, cases, MATLAB helper scripts, old ECGSIM 1.3 geometry/MCG files, and linked reference papers. HTML/PHP pages were also extracted to searchable text in `research/extracted-text/`.

Skipped items were app binaries/installers only: `ECGsim-3.0.1.zip`, `ECGsim-3.0.1.dmg`, older `.exe`/`.dmg` installers, and `ecgsimw13/ecgsimw14.exe`.

Key inventory:

- 49 extracted text pages.
- 8 PDFs: 2 tutorials, 1 WPW case paper, 4 ECGSIM papers from `ecgsim.org/papers`, and 1 CINC 2011 paper.
- 4 `.ECGsimcase` case files.
- 3 MATLAB helper scripts: `loadmat.m`, `loadtri.m`, `readECGsim.m`.
- Legacy ECGSIM 1.3 geometry and MCG files: `.tri`, `.tra`, `.obs`, `.int`, `.lay`.
- Manual screenshots and UI graphics.

## Project Purpose

ECGSIM is an interactive simulation program for studying the relationship between myocardial electrical activity and ECG/body-surface potentials. It is intended for education and research.

The website is explicit that ECGSIM is a forward simulator. It helps test hypotheses about how cardiac electrical changes manifest in ECG waveforms, but it does not solve the inverse diagnostic problem.

## Model Notes

ECGSIM is based on the equivalent surface source model. Body-surface potentials are modeled as determined by transmembrane potentials on the surface bounding active myocardium: epicardium, endocardium, and AV-ring. Atria and ventricles can be represented by separate surfaces.

The most common TMP parameterization uses:

- Depolarization time.
- Repolarization time.
- Transmembrane amplitude.
- Resting potential.
- Plateau slope.
- Repolarization slope.

Heart and conductivity geometry came from MR images. A boundary element volume conductor model computes a transfer function relating myocardial surface TMPs to body-surface potentials.

Default depolarization and repolarization times were estimated from measured ECGs through inverse procedures described in the references.

## Main Application Surfaces

The modern app should preserve the four-pane conceptual model:

- Heart pane: 3D atria/ventricles geometry with surface functions and editable source parameters.
- Thorax pane: 3D thorax/lungs/heart view, body-surface potential maps, sensitivity maps, electrodes.
- TMP pane: transmembrane potential waveform at the selected heart node, with editable handlers.
- Leads pane: ECG, BSPM lead systems, VCG, time selection, filtering, beat selection.

## Heart Pane Features

The heart view displays atrial or ventricular geometry and surface functions. It supports rotation, cross-plane cuts/transparency, node selection, editable radius around a selected node, probing, foci editing, heart vectors, coronary landmarks, and electrode visibility.

Important surface functions:

- Depolarization time.
- Repolarization time.
- Activation recovery interval (ARI).
- TMP amplitude.
- Resting potential.
- TMP at selected time.
- Geometry/nodes.
- Heart contribution to a selected thorax node.
- Potential field strength.

Selection behavior includes single adaptation, reset of adapted regions, expansion/accumulation of adapted areas, and per-region adaptation.

## Thorax Pane Features

The thorax view displays thorax, lungs, heart, electrodes, body-surface potential maps, and sensitivity maps. It supports rotation, node selection, visible lungs/electrodes toggles, locking orientation to heart rotation, amplitude scaling, and movie playback over time.

Body-surface potential display modes include:

- Measured BSPM.
- Simulated BSPM with initial parameters.
- Simulated BSPM with adapted parameters.
- Sensitivity map for a probed heart point.

## TMP Pane Features

The TMP view shows the waveform at the selected heart node. Initial parameters are shown separately from user-adapted parameters. The yellow time bar is synchronized with the leads view.

Editable waveform parameters:

- Depolarization time.
- Repolarization time.
- Resting potential.
- Amplitude.
- Plateau slope.
- Repolarization slope.

Double-clicking a handler resets that parameter. A reset beat operation restores all changes for the selected beat and active source to initial values.

## Leads Pane Features

Supported lead systems vary by case file, but the manual describes:

- Standard 12-lead system.
- Frank vectorcardiogram.
- 64-lead BSPM system with WCT reference.
- Nine-electrode minimap montage with WCT reference.
- Single lead at a selected thorax node.

Signals can overlay measured ECG, simulated initial ECG, simulated adapted ECG, electrogram for selected heart point, and RMS curves.

Filtering/coupling modes:

- Baseline correction, default.
- AC coupling.
- DC coupling.

The leads view owns time selection. Clicking/dragging moves the selected time, arrow keys step by 2 ms, and double-clicking can zoom into a beat when the case contains multiple atrial or ventricular beats.

## Tools And Workflows

The Tools manual covers view presets, rhythm creation, statistics, and transition zones. The Focus manual describes construction of depolarization/activation sequences and repolarization behavior. The Update page describes a built-in update checker, but this is likely historical rather than a modern requirement.

The 3.0.0 change log is useful for modernization priorities:

- Improved activation computation.
- Multiple ventricular and/or atrial beats.
- Better graph drawing and refresh performance.
- Simplified toolbar/menu layout.
- Export into a logical directory structure.
- Built-in help popup.
- Linux build support existed but was not distributed.

## Case And Export Formats

Case files use `.ECGsimcase`. Downloaded examples:

- `normal_male2.ECGsimcase`
- `WPW_fusionbeat.ECGsimcase`
- `WPW_Bundleonly.ECGsimcase`
- `WPW_ectopicbeat.ECGsimcase`

Exports are described as a directory structure containing:

- `ecgs/`: measured `.refECG` matrix, adapted simulated `.adaptECG` matrix, electrode locations `.elec`.
- `model/`: triangulations for atria/ventricles, thorax, lungs, and blood cavities.
- `ventricular_beats/beat[1-x]/` and `atrial_beats/beat[1-x]/`: user source parameter files.

Source parameter files include:

- `.user.dep`: depolarization times in ms.
- `.user.rep`: repolarization times in ms.
- `.user.ampl`: amplitude in mV.
- `.user.rest`: resting potential in mV.
- `.user.depslope`, `.user.repslope`, `.user.platslope`: slope parameters.
- `.user.source`: TMP waveforms matrix.

Matrix format:

```text
L (long)
T (long)
p(1,1) ... p(1,T)
...
p(L,1) ... p(L,T)
```

ASCII vector format:

```text
L
p(1,1)
...
p(L,1)
```

Geometry `.tri` format:

```text
npnt
1 x(1) y(1) z(1)
...
npnt x(npnt) y(npnt) z(npnt)
ntri
1 ind(1,1) ind(1,2) ind(1,3)
...
ntri ind(ntri,1) ind(ntri,2) ind(ntri,3)
```

Coordinates are in meters. Triangle node indices are ordered clockwise when viewed from outside, defining orientation.

## Downloaded Development Assets

Manual and site:

- `research/source/www.ecgsim.org/manual/`
- `research/source/www.ecgsim.org/downloads/`
- `research/source/www.ecgsim.org/downloads/other13/help/`

Tutorials:

- `research/source/www.ecgsim.org/tutorial/ecgsimtut2.pdf`
- `research/source/www.ecgsim.org/tutorial/ecgsimtut13.pdf`

Cases:

- `research/source/www.ecgsim.org/downloads/cases/*.ECGsimcase`
- `research/source/www.ecgsim.org/downloads/cases/BergerEtAlJAmCollCardiol48.pdf`

MATLAB helpers:

- `research/source/www.ecgsim.org/downloads/loadmat.m`
- `research/source/www.ecgsim.org/downloads/loadtri.m`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`

Legacy data:

- `research/source/www.ecgsim.org/downloads/other13/geometry/*.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/wct.tra`
- `research/source/www.ecgsim.org/downloads/other13/mcg/*`

Reference papers:

- `research/source/www.ecgsim.org/papers/EcgsimHeart.pdf`
- `research/source/www.ecgsim.org/papers/florida.pdf`
- `research/source/www.ecgsim.org/papers/brasilreturn.pdf`
- `research/source/www.ecgsim.org/papers/lausanne.pdf`
- `research/source/www.cinc.org/archives/2011/pdf/0657.pdf`

## Bibliography Captured From The Site

Core ECGSIM and model references listed on the site include:

- A. van Oosterom, T. Oostendorp. ECGSIM; an interactive tool for studying the genesis of QRST waveforms. Heart 2004.
- A. van Oosterom, G. Windau, G.J.M. Huiskamp. Simulation on a PC of the QRS-T wave forms. Electrocardiology 1993.
- van Dam PM, Oostendorp TF, Linnenbank AC, van Oosterom A. Non-Invasive Imaging of Cardiac Activation and Recovery. Annals of Biomedical Engineering 2009.
- van Dam PM, van Oosterom A. Atrial Excitation Assuming Uniform Propagation. Journal of Cardiovascular Electrophysiology 2003.
- A. van Oosterom. Interactive simulation of the QRS wave forms. IEEE EMBS 1989.
- A. van Oosterom, G.J.M. Huiskamp. The Effect of Torso Inhomogeneities on Body Surface Potentials. Journal of Electrocardiology 1989.
- van Dam PM, van Oosterom A. Volume conductor effects involved in the genesis of the P wave. Europace 2005.
- J.J.M. Cuppen, A. van Oosterom. Model studies with inversely calculated isochrones of ventricular depolarization. IEEE T-BME 1984.
- G.J.M. Huiskamp, A. van Oosterom. The depolarization sequence of the human heart surface computed from measured body surface potentials. IEEE T-BME 1988.
- van Dam P, Oostendorp T, van Oosterom A. Fastest route algorithm for local ischemia ECG simulation. Medical & Biological Engineering & Computing 2009.
- A. van Oosterom. Genesis of the T-wave as based on an Equivalent Surface Source Model. Journal of Electrocardiology 2001.
- D.B. Geselowitz. On the Theory of the Electrocardiogram. Proceedings IEEE 1989.
- D.B. Geselowitz. Description of cardiac sources in anisotropic cardiac muscle. Journal of Electrocardiology 1992.
- van Huysduynen et al. Validation of ECG indices of ventricular repolarization heterogeneity. Journal of Cardiovascular Electrophysiology 2005.
- Patuwo, Wagner, Ajijola. Comparison of teaching basic ECG concepts with and without ECGSIM. Computers in Cardiology 2007.
- van Dam, Oostendorp, van Oosterom. Interactive Simulation of the Activation Sequence: replacing Effect by Cause. Computers in Cardiology 2011.

## Development Implications

Early implementation work should probably start with data readers before UI:

- Inspect `.ECGsimcase` internals and align them with the export format documentation.
- Port or translate `readECGsim.m`, `loadmat.m`, and `loadtri.m` into the target runtime.
- Build parsers for matrix, ASCII vector, `.tri`, and `.tra` files.
- Create visual sanity checks for old geometry files before recreating the full four-pane interaction model.
- Treat the existing UI as a behavior/specification source, but modernize navigation and interaction patterns rather than copying the menu-heavy interface directly.
