# Simulation Notes

Status: internal implementation spec for tasks `0021` through `0023`. This document records equations and required data only where the archived ECGSIM material gives enough support.

## Sources

- ECGSIM manual, transfer function: `research/extracted-text/www.ecgsim.org/manual/transfer.txt`.
- ECGSIM manual, TMP view: `research/extracted-text/www.ecgsim.org/manual/membrane.txt`.
- ECGSIM manual, leads/filtering: `research/extracted-text/www.ecgsim.org/manual/leads.txt`.
- MATLAB export reader: `research/source/www.ecgsim.org/downloads/readECGsim.m`.
- van Oosterom and Oostendorp, "ECGSIM: an interactive tool for studying the genesis of QRST waveforms", `research/source/www.ecgsim.org/papers/EcgsimHeart.pdf`.
- van Dam, Oostendorp, and van Oosterom, "Interactive Simulation of the Activation Sequence: replacing Effect by Cause", `research/source/www.cinc.org/archives/2011/pdf/0657.pdf`.

## Source Model

ECGSIM uses an Equivalent Double Layer (EDL) surface source model. The manual gives the continuous body-surface potential model as:

```text
V(y, t) = integral_over_heart_surface A(x, y) S(x, t) dx
```

Definitions:

- `V(y, t)`: potential at body-surface position `y` and time `t`.
- `S(x, t)`: transmembrane potential/source strength at myocardial surface position `x` and time `t`.
- `A(x, y)`: transfer function from myocardial source position `x` to body-surface position `y`.

Attribution: ECGSIM manual transfer page. The Heart paper states the source representation is EDL and the local source strength time course is proportional to nearby-cell TMP.

Implementation form:

```text
B = A * S
```

Where:

- `S` is a source-node-by-time matrix.
- `A` is an observation-node-by-source-node transfer matrix.
- `B` is an observation-node-by-time potential matrix.

Attribution: manual transfer equation plus `readECGsim.m`, which names `DATA.VENTR.THORAX` as the BEM transfer function from transmembrane potentials to body-surface potentials.

## WCT Reference

`readECGsim.m` computes a Wilson central terminal correction for thorax-related transfer matrices:

```text
A_wct = mean(A[wct_rows, :])
A_referenced = A - repeat_row(A_wct, rows(A))
```

Attribution: `calcAwct` and `doWCT` in `readECGsim.m`.

Required data:

- Thorax transfer matrix for the active source.
- Electrode-to-thorax-node mapping.
- Three WCT electrode indices.

Unknown:

- Whether `.ECGsimcase` lead-system matrices are already WCT-referenced.
- Exact handling for non-standard lead systems beyond the exported helper script.

## Lead And ECG Computation

When a source-to-lead transfer matrix exists, compute:

```text
E = L * S
```

Where:

- `L` is a lead-system transfer matrix.
- `S` is the source-node-by-time TMP/source matrix.
- `E` is a lead-by-time ECG matrix.

Attribution: `readECGsim.m` loads matrices named like `ventricles2standard12lead.mat` and `atria2standard12lead.mat`; the manual states lead systems are part of the case file and can include standard 12-lead, Frank VCG, 64-lead BSPM, minimap, and single thorax-node leads.

If only thorax potentials are available, lead signals can be derived by selecting/interpolating electrode thorax nodes and applying the lead-system definition. This path remains underspecified until exported `.elec` and lead-system data are parsed.

## TMP Parameter Model

The TMP view exposes initial and adapted values. The manual names six editable TMP parameters:

| Parameter | Meaning |
| --- | --- |
| `depolarizationMs` | timing of fastest TMP upstroke |
| `repolarizationMs` | timing of maximum down-slope during repolarization |
| `restingPotential` | minimum/resting TMP |
| `amplitude` | maximum upstroke amplitude |
| `plateauSlope` | phase-2/plateau slope |
| `repolarizationSlope` | phase-3/repolarization slope |

Constraint:

```text
plateauSlope <= repolarizationSlope
```

Attribution: ECGSIM manual TMP page.

Note: this constraint is enforced for modern edits, but the generator accepts parsed stored values as-is because current fixture data includes legacy slope combinations that may not satisfy the UI constraint.

Observed case payloads also include `depolarizationSlope`. The exact legacy waveform generator remains unknown. Task `0021` implements a provisional deterministic generator for editing and recomputation plumbing, but generated TMPs must not be treated as parity-verified `.user.source` output until real exports are captured.

Current provisional waveform, implemented in `ecgsim.core.tmp`:

```text
t_ms(sample) = 1000 * sample / sample_rate_hz
dep_width_ms = max(depolarizationSlope * 1000, 1)
rep_width_ms = max(repolarizationSlope * 1000, 1)
upstroke = sigmoid((t_ms - depolarizationMs) / dep_width_ms)
recovery = sigmoid((t_ms - repolarizationMs) / rep_width_ms)
plateau_decay = max(0, t_ms - depolarizationMs) * plateauSlope / 1000
TMP = restingPotential + max(0, amplitude - plateau_decay) * upstroke * (1 - recovery)
```

Numerical assumptions:

- Parameter timing values are milliseconds.
- Fixture/sample preview generation uses `1000 Hz` unless case data says otherwise.
- Generated fixture values are rounded to six decimal places.
- Slope units are still legacy-specific; the `* 1000` width conversion preserves the task-0012 preview behavior and is not yet source-attributed.

Required data for real TMP generation:

- Source kind: atria or ventricles.
- Beat id.
- Source-node geometry/indexing.
- Initial and adapted parameter vectors.
- Sample count and sample interval.
- Exact waveform generator, including slope units and any coupling between depolarization/repolarization parameters.

## Activation Sequence

The CINC 2011 paper describes activation generation with a fastest-route algorithm:

```text
travel_time(edge) = edge_length / propagation_velocity(edge)
activation_time(node) = min_path_time_from_any_focus(node)
```

For multiple foci, activation follows a first-arriving-wave rule.

Attribution: van Dam, Oostendorp, and van Oosterom, CINC 2011, methods section.

Required data:

- Source graph adjacency.
- Edge lengths.
- Propagation velocity per edge or region.
- Focus node ids and focus activation times.

Unknown:

- Exact `.ECGsimcase` object layout for activation construction payloads.
- How ECGSIM 3.0.1 stores locally edited propagation velocities.

## Filtering And Coupling

The leads manual defines three temporal display modes:

| Mode | Behavior |
| --- | --- |
| Baseline correction | Default; adjusts potentials so values at the beginning of P wave and end of T wave are zero. |
| AC coupling | Sets each lead's mean over time to zero. |
| DC coupling | Applies no temporal filtering and shows the DC level. |

Attribution: ECGSIM manual leads page.

Implementation status:

- `DC`: no correction.
- `AC`: subtract per-lead temporal mean.
- `baseline`: requires fiducial timing for P-wave start and T-wave end; exact legacy interpolation/window behavior is unknown.

## Required Case Data Checklist

Simulation tasks need these parsed from `.ECGsimcase` or legacy exports:

- Atrial and ventricular source geometry with stable node indexing.
- Beat inventory for atria and ventricles.
- Initial and adapted source-parameter vectors per beat.
- Generated or exported TMP/source matrices per beat.
- Transfer matrices from active source to thorax/body-surface nodes.
- Lead-system transfer matrices or electrode definitions.
- WCT/reference-node definitions.
- Sample rate, sample count, and beat time windows.
- Filtering/coupling mode and fiducial timing needed for baseline correction.

## Open Questions

- Exact TMP waveform equation and slope units.
- Whether stored `.user.source` matrices are generated before or after filtering/coupling.
- Whether source-to-lead matrices in `.ECGsimcase` include WCT/reference corrections.
- How standard 12-lead, Frank VCG, minimap, and single-node lead definitions are encoded.
- Whether atrial and ventricular beats share one time base or can have independent sample windows.
