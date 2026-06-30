# 0058 Profile And Optimize Large Case Workflows

## Objective

Profile and optimize parsing, rendering, editing, and recomputation workflows.

## Minimal Context

Feature parity can be unusable if large matrix operations or WebGL views block interaction.

## Inputs

- Real case loader and recompute pipeline.
- `docs/packaging.md`
- App workflow tests.

## Deliverables

- Add profiling notes and performance targets.
- Optimize hot paths with typed arrays, workers, NumPy, WebAssembly, or caching where justified.
- Add performance smoke tests where practical.

## Verification

- Supported golden workflows complete within documented targets.
- Optimizations preserve numerical parity tests.

## Done When

Performance is acceptable for supported cases and workflows.

## Progress

Completed the first profiling and optimization pass for supported cases.

- Added `tools/profile_supported_workflows.py` to measure `load_case()`, first signal matrix reads, and export-directory writes.
- Added `docs/performance.md` with performance targets, profiling commands, measured baselines, and remaining hot spots.
- Optimized repeated case loading by adding an mtime/size-aware metadata cache to `read_ecgsimcase_metadata()`.
- Reduced supported-case `load_case()` profiling from roughly 9-14 seconds to roughly 1.9-2.9 seconds on this workspace.
- Preserved existing parser, export, numerical, and browser workflow verification.

Future recomputation, transfer-matrix multiplication, and movie export still need separate profiling once implemented.
