# Fiducial And Filtering Notes

Status: task `0052` implemented filtering against promoted legacy adapted ECG exports. Task `0068` derives a normal-male baseline window from that export evidence; parsed `.ECGsimcase` P/T fiducial fields remain unresolved for cases without matching evidence.

## Supported In Current Code

- DC coupling passes values through unchanged.
- AC coupling subtracts each trace's time mean.
- Baseline coupling subtracts the line between two baseline samples.
- The filtering core now reports whether the baseline window came from parsed fiducials or from the signal-end fallback.
- Promoted row-major legacy ECG exports can be read with `read_legacy_row_major_matrix()`.
- `infer_baseline_window_from_zero_runs()` infers the legacy adapted ECG baseline samples from shared near-zero leading/trailing runs.
- Case signal metadata and viewer fixtures expose derived P-wave/T-wave baseline samples for `normal_male2.ECGsimcase`.
- Cases without matching legacy-export evidence explicitly mark P-wave/T-wave fiducials as unavailable.
- The Leads pane status reports the active coupling mode and whether baseline is using fallback endpoints.

## Legacy Requirement

The Leads manual says baseline correction should set values at the beginning of the P wave and termination of the T wave to zero. Those samples have not been located in the parsed `.ECGsimcase` payloads.

## Legacy Export Evidence

Task `0048` provides promoted normal male ECGSIM 3.0.1 `.refECG` and `.adaptECG` fixtures. The `standard_12.adaptECG` export is a `12 x 505` row-major float32 matrix. With `1e-5 mV` tolerance, all 12 leads share near-zero samples through index `5` and from index `499` through the end, so the inferred legacy baseline window is `(5, 499)`.

Filtering parity is tested as:

- DC coupling passes the legacy adapted ECG matrix through unchanged.
- AC coupling subtracts each lead mean to numerical zero.
- Baseline coupling with the inferred `(5, 499)` window sets both baseline samples to zero and changes the already-corrected adapted ECG by no more than `1e-5 mV`.

## Remaining Ambiguity

The inferred `(5, 499)` window is evidence from a post-correction legacy export, not a decoded `.ECGsimcase` fiducial field. The normal male bundle uses this derived window for baseline coupling. WPW bundles and other cases still expose unavailable P/T fiducials and use the signal-end fallback until those fields are found, captured, or user-supplied.
