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
