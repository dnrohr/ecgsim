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

Task `0022` implements this as `ecgsim.core.apply_transfer_function(transfer, source)`.
It accepts parsed `MatrixData` or plain row-major numeric sequences and returns
row-major `MatrixData` with shape:

```text
rows(B) = rows(A)
columns(B) = columns(S)
columns(A) must equal rows(S)
```

Performance notes:

- The current implementation is dependency-free pure Python and suitable for fixture-sized regression checks and first-pass recomputation plumbing.
- It is not the final high-throughput path for repeated interactive recomputation of large transfer/source matrices.
- If profiling shows the pure-Python multiply blocking interaction, replace the inner multiply with a typed-array/NumPy/WebAssembly path while preserving the same shape contract and tests.

## WCT Reference

`readECGsim.m` computes a Wilson central terminal correction for thorax-related transfer matrices:

```text
A_wct = mean(A[wct_rows, :])
A_referenced = A - repeat_row(A_wct, rows(A))
```

Attribution: `calcAwct` and `doWCT` in `readECGsim.m`.

Task `0022` implements this row operation as `ecgsim.core.apply_wct_reference`.

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

Observed case payloads and raw exports also include `depolarizationSlope`. Task `0049` replaces the provisional deterministic preview with a generator calibrated against the captured ECGSIM 3.0.1 normal male `.user.source` export.

Current legacy-calibrated waveform, implemented in `ecgsim.core.tmp`:

```text
t_ms(sample) = 1000 * sample / sample_rate_hz
dep_rate = depolarizationSlope when depolarizationSlope >= 1 else 1 / (depolarizationSlope * 1000)
rep_envelope_rate = repolarizationSlope * 0.56
rep_shape = (plateauSlope / repolarizationSlope) * 2.75
rep_start_ms = depolarizationMs + 3 / dep_rate
upstroke = sigmoid((t_ms - depolarizationMs) * dep_rate)
repolarization = exp(-rep_shape * (exp(rep_envelope_rate * (t_ms - repolarizationMs)) - exp(rep_envelope_rate * (rep_start_ms - repolarizationMs))))
TMP = restingPotential + (amplitude - restingPotential) * upstroke * repolarization
```

Numerical assumptions:

- Parameter timing values are milliseconds.
- Fixture/sample preview generation uses `1000 Hz` unless case data says otherwise.
- Generated fixture values are rounded to six decimal places.
- Raw `.user.source` files captured from ECGSIM 3.0.1 store source-node rows contiguously after the raw binary matrix header. Use `read_legacy_tmp_source_matrix()` for TMP source parity tests instead of the generic matrix reader.
- The repolarization constants are empirical fits from the normal male ECGSIM 3.0.1 export, not source-code-derived constants. Current residuals are documented in `docs/parity.md`.

Required data for real TMP generation:

- Source kind: atria or ventricles.
- Beat id.
- Source-node geometry/indexing.
- Initial and adapted parameter vectors.
- Sample count and sample interval.
- Additional legacy TMP exports from edited workflows and non-normal-male cases to confirm whether the calibrated constants generalize.

## Activation Sequence

The CINC 2011 paper describes activation generation with a fastest-route algorithm:

```text
travel_time(edge) = edge_length / propagation_velocity(edge)
activation_time(node) = min_path_time_from_any_focus(node)
```

For multiple foci, activation follows a first-arriving-wave rule.

Attribution: van Dam, Oostendorp, and van Oosterom, CINC 2011, methods section.

Current implementation status: `ecgsim.core.fastest_route_activation_times` implements the first-arrival graph solver. `.ECGsimcase` activation construction payloads are structurally parsed as raw records, but the mapping from those records to focus nodes and graph velocities is still unknown.

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
- `baseline`: subtract a linear baseline between the supplied fiducial samples. If fiducials are unknown, the current implementation falls back to the first and last sample.

Task `0023` implements these modes as `ecgsim.core.filter_signal` and
`ecgsim.core.filter_matrix`. The viewer exposes the same three modes for the
bundled leads plot. Exact legacy P-wave-start/T-wave-end fiducial detection and
any non-linear interpolation/window behavior remain unknown.

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
