# Parity Tolerances

Status: initial thresholds for regression tests. These values should tighten only after a failing test is shown to be a real implementation issue rather than a legacy-app, rendering, or platform difference.

## Scope

Parity checks compare modern project outputs with one of these references:

- Archived website source files under `research/source/`.
- Parsed `.ECGsimcase` fixture data.
- Legacy app screenshots under `research/legacy-exports/`.
- Future raw exports from the original ECGSIM application.

Tests should state which reference they use. Do not compare a derived preview against a legacy app output as if it were a scientific parity check.

## Required Thresholds

| Area | What to Compare | Tolerance | Rationale |
| --- | --- | --- | --- |
| File identity | Reference fixture checksum | exact SHA-256 match | Prevents accidental fixture drift before numerical checks run. |
| Geometry counts | Point and triangle counts | exact integer match | Topology changes alter indexing, transfer matrices, and visual interpretation. |
| Geometry triangle indices | Index triplets and ordering | exact integer match | Triangles are discrete topology; reordering should be intentional and documented. |
| Source geometry coordinates | Parsed x/y/z coordinates in meters | absolute error <= `1e-7 m` | Source geometry is decimal ASCII; parser-level tests should preserve source values within float32-scale noise. |
| Viewer geometry fixtures | Rounded x/y/z coordinates in JSON fixtures | absolute error <= `5e-5 m` from source | Current JSON fixtures round coordinates to four decimal places for compact browser fixtures. |
| Case metadata | Root signature, lead-system names, marker counts | exact match | Metadata is structural and should not drift across parser changes. |
| Matrix/vector shape | Rows, columns, vector length | exact integer match | Shape mismatch means the wrong payload was parsed or serialized. |
| Parsed float32 values | Matrix/vector payload values | absolute error <= `1e-6`, relative error <= `1e-6` | `.ECGsimcase` numeric payloads are little-endian float32; this threshold covers float32 round-trip noise without hiding meaningful value changes. |
| ECG/surface-potential time axis | Sample count and sample rate | exact count, exact `1000 Hz` where documented | The ECGSIM manual states ECG sample frequency is `1000 Hz`; current surface-potential fixture is `300 x 1000`. |
| ECG/surface-potential amplitudes | Values in millivolts | absolute error <= `1e-6 mV`, relative error <= `1e-6` | Current comparisons are against parsed float32 fixture data, not hand-digitized plots. |
| TMP parameter vectors | Per-node parameter values | absolute error <= `1e-6`, relative error <= `1e-6` | Current data comes from float32 `PVector` payloads. Units remain parameter-specific. |
| TMP generated waveforms | Full waveform samples | unknown | The current viewer waveform is parameter-derived and not yet parity-verified against legacy TMP generation. |
| Rendered line plots | Canvas/SVG presence and rough bounds | no blank render; axes/traces visible inside viewport | Rendering tests should catch broken UI, not imply pixel-perfect scientific parity. |
| Legacy screenshot | Whole-window visual smoke comparison | perceptual/snapshot review only until an image-diff harness exists | The captured screenshot is useful as a layout/reference oracle, but native app rendering varies by Windows scale, fonts, GPU, and window size. |

## Current Baselines

The first legacy baseline is:

```text
research/legacy-exports/screenshots/normal-male-main-window.png
```

Its checksum is recorded in:

```text
research/legacy-exports/screenshots-manifest.json
```

Current viewer fixtures expose these dimensions:

| Fixture | Reference | Expected Dimensions |
| --- | --- | --- |
| Heart geometry | `app/viewer/public/fixtures/heart.json` | `257` points, `510` triangles, meters |
| Thorax geometry | `app/viewer/public/fixtures/thorax.json` | thorax: `300` points, `596` triangles; each lung: `116` points, `228` triangles; meters |
| Surface potentials | `app/viewer/public/fixtures/ecg-signals.json` | source matrix `300 x 1000`; preview exports `6` traces of `1000` samples; `1000 Hz`; millivolts |
| TMP preview | `app/viewer/public/fixtures/tmp-waveforms.json` | `576` source nodes; preview exports `5` nodes; `576` samples per preview waveform; `1000 Hz` assumed |

## Unknowns And Follow-Up

- Raw legacy `File -> Export` outputs have not been captured from the Windows app in this environment.
- `.adaptECG`, `.refECG`, and `.user.source` tolerances should be revisited once real exported files are available.
- TMP generated waveform parity is intentionally unknown until the legacy TMP generation algorithm is implemented or exported `.user.source` matrices are captured.
- Visual comparison thresholds should become automated only after a stable browser screenshot harness is added.
- Coordinate unit expectations for electrode files remain unknown until raw `.elec` exports are available.
