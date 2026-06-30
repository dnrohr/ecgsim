# Performance Notes

Status: task `0058` baseline and targets for supported modern ECGSIM workflows.

## Targets

Targets apply to the currently supported archived cases on a typical development workstation:

| Workflow | Target | Notes |
| --- | ---: | --- |
| `load_case()` for a supported case | <= 5 s | Includes metadata, geometry, source, activation, lead-system, and signal metadata parsing. |
| Read first signal matrix | <= 250 ms | Offset-driven `PMatrix` read for current Leads/Thorax source data. |
| Export directory from an already loaded case | <= 1 s | Writes current supported subset, not full legacy export parity. |
| Browser app workflow test | <= 15 s | Includes render smoke, controls, edits, sidecar, and PNG export checks. |

These are smoke targets, not scientific parity thresholds. Numerical tolerances remain in `docs/parity.md`.

## Profiling Command

Run all supported archived cases without export:

```powershell
python tools/profile_supported_workflows.py --skip-export
```

Run one case with export-directory profiling:

```powershell
python tools/profile_supported_workflows.py --case research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

Write machine-readable output:

```powershell
python tools/profile_supported_workflows.py --skip-export --json-output scratch/performance-profile.json
```

Generated profile JSON should stay out of git unless a later task intentionally promotes a small benchmark fixture.

## 2026-06-30 Baseline

Measured in this workspace after adding metadata caching:

| Case | `load_case()` | Signal matrix read |
| --- | ---: | ---: |
| `normal_male2.ECGsimcase` | 1.87 s | 33 ms |
| `WPW_Bundleonly.ECGsimcase` | 2.80 s | 45 ms |
| `WPW_ectopicbeat.ECGsimcase` | 2.93 s | 61 ms |
| `WPW_fusionbeat.ECGsimcase` | 2.80 s | 47 ms |

Normal-case export from an already loaded case measured 201 ms for 13 written files.

Browser workflow test measured about 7.6 s before the optimization work and remains under the 15 s target.

## Optimization Implemented

`read_ecgsimcase_metadata()` now uses an mtime/size-aware in-process cache. High-level case loading calls metadata readers multiple times while parsing geometry, sources, lead systems, and signal metadata; caching avoids repeated full marker scans for the same unchanged file.

Before caching, the same profiling command measured:

| Case | `load_case()` before cache |
| --- | ---: |
| `normal_male2.ECGsimcase` | 9.12 s |
| `WPW_Bundleonly.ECGsimcase` | 13.73 s |
| `WPW_ectopicbeat.ECGsimcase` | 14.40 s |
| `WPW_fusionbeat.ECGsimcase` | 13.99 s |

## Remaining Hot Spots

- Full Python test runtime is still dominated by repeated case parsing and export tests.
- Browser loading still depends on generated JSON bundles rather than direct case parsing.
- Future recomputation, transfer-matrix multiplication, and movie export need separate performance budgets once implemented.
