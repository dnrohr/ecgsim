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
| TMP generated waveforms | Full waveform samples | normal male ECGSIM 3.0.1 legacy `.user.source`: max error <= `1.8 mV`, RMS error <= `0.52 mV`; generated viewer fixture exact match | Task `0049` calibrates the generator against the first raw legacy TMP export. Broader case/edit parity still needs more captures. |
| Filtering modes | Promoted normal male ECGSIM 3.0.1 `standard_12.adaptECG` | DC exact pass-through; AC row mean <= `1e-12 mV`; baseline inferred zero-run window `(5, 499)` endpoint values <= `1e-12 mV` after correction and max already-corrected delta <= `1e-5 mV` | Task `0052` verifies coupling semantics against the captured adapted ECG export. Task `0068` promotes the `(5, 499)` window as derived normal-male case metadata; it is still not a decoded `.ECGsimcase` fiducial field. |
| Measured ECG export preview | Promoted normal male ECGSIM 3.0.1 `.refECG` files for matching lead systems | exact row/column shape and parsed first-sample match against row-major legacy matrix reader; browser workflow verifies visible redraw and legacy-export provenance | Task `0114` enables measured Leads mode from promoted export evidence for `normal_male2`. This does not decode arbitrary `.ECGsimcase` measured classification fields or final lead reference weights. |
| Initial/adapted lead recompute preview | Generated viewer bundle transfer matrix and edited TMP state | exact shape match: selected electrode count x TMP sample count; browser redraw after source edit and initial/adapted overlay toggles | Tasks `0066` and `0112` wire initial/adapted lead traces through the same ventricles-to-thorax transfer candidate as BSPM. This is a responsive preview, not yet a legacy lead-transform parity claim because WCT/reference and measured classifications remain unresolved. |
| Numerical harness diagnostics | Injected sample differences | sequence failures include label, index, actual, expected, and errors; matrix failures include label, row, column, flat index, max absolute error, and RMS error | Task `0053` adds reusable sequence and matrix helpers so future raw-export comparisons fail loudly and locally. |
| Rendered line plots | Canvas/SVG presence and rough bounds | no blank render; axes/traces visible inside viewport | Rendering tests should catch broken UI, not imply pixel-perfect scientific parity. |
| Legacy screenshot | Whole-window visual smoke comparison | PNG smoke metrics pass; broad aspect/luminance comparison only | The captured screenshot is useful as a layout/reference oracle, but native app rendering varies by Windows scale, fonts, GPU, and window size. Task `0081` adds a loose visual smoke harness, not pixel-perfect parity. |

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
| Heart geometry | `app/viewer/public/fixtures/heart.json` | `912` points, `1696` triangles, meters |
| Thorax geometry | `app/viewer/public/fixtures/thorax.json` | thorax: `300` points, `596` triangles; left lung: `124` points, `244` triangles; right lung: `132` points, `260` triangles; meters |
| Surface potentials | `app/viewer/public/fixtures/ecg-signals.json` | source matrix `300 x 1000`; preview exports `6` traces of `1000` samples; `1000 Hz`; millivolts |
| TMP preview | `app/viewer/public/fixtures/tmp-waveforms.json` | `576` source nodes; preview exports `5` nodes; `576` samples per preview waveform; `1000 Hz` assumed |

## Unknowns And Follow-Up

- Raw legacy `File -> Export` outputs have been captured for the ECGSIM 3.0.1 normal male case and promoted under `tests/fixtures/legacy-parity/normal-male-ecgsim301/`.
- Raw legacy `File -> Export` outputs have also been captured for the ECGSIM 3.0.1 normal young male case. The promoted `tests/fixtures/legacy-parity/normal-young-male-ecgsim301/` fixture currently includes ECG-only `.refECG` and `.adaptECG` matrices.
- Promoted `.refECG` fixtures are shape/readability-checked as row-major legacy matrices and are exposed as measured Leads overlays when the loaded bundle and lead system match the promoted normal-male export evidence.
- The normal male case exposes derived baseline fiducials `(5, 499)` from the promoted `standard_12.adaptECG` export. Other supported cases keep fiducials unavailable until comparable evidence exists.
- Initial and adapted lead traces in the browser are recomputed from TMP source parameters at parsed electrode thorax nodes, composed through parsed lead/reference definitions where direct electrode indices are available, then passed through the existing coupling filter modes. They are intentionally labeled as unresolved for lead reference-weight parity until the final weighting equations are decoded.
- The reusable numerical harness covers parsed fixtures, injected-difference diagnostics, promoted fixture manifest verification, row-major legacy matrix scenario checks, and full generated TMP matrix comparisons against the promoted normal male `.user.source` fixture.
- `tools/compare_export_directories.py` can compare captured legacy export directories against the modern supported export subset. It reports missing matching paths, shape mismatches, and value mismatches with numerical diagnostics.
- TMP generated waveform parity is currently proven for the promoted normal male ECGSIM 3.0.1 `.user.source` capture only; more cases and edited-source captures should tighten or generalize the calibrated constants.
- Visual comparison thresholds are automated only as broad smoke checks. See `docs/feature-parity/visual-regression-notes.md`.
- Coordinate unit expectations for electrode files remain unknown until raw `.elec` exports are available.
