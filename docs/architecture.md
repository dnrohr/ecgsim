# Architecture Sketch

This is a starting point, not a final design.

## Suggested Boundaries

- `core`: domain objects, units, validation, shared math types.
- `io`: legacy readers/writers and import/export commands.
- `simulation`: TMP generation, transfer functions, ECG/BSPM recomputation.
- `visualization`: geometry preparation, color maps, plot-ready data transforms.
- `app`: UI and interaction layer.
- `docs`: project notes, decisions, process.
- `research`: archived external source material.

## Dependency Direction

`app` may depend on `visualization`, `simulation`, `io`, and `core`.

`visualization`, `simulation`, and `io` may depend on `core`.

`core` should not depend on UI, file-system layout, or rendering libraries.

## Data Flow

1. Load a case through `io`.
2. Normalize into `core` domain objects with explicit units.
3. Prepare renderable geometry/signals through `visualization`.
4. Optionally modify source parameters in `core`.
5. Recompute signals/maps through `simulation`.
6. Export through `io`.

## Design Bias

Prefer compatibility and testability over early abstraction. Add abstractions when two real implementations or workflows need the same contract.
