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

## Initial Viewer Flow

The first viewer prototypes use a browser-native shell in `app/viewer/`.

Early flow:

1. Python parser commands inspect legacy files and emit stable metadata or fixture data.
2. Viewer prototypes load static fixture JSON or generated development artifacts.
3. The browser layer owns interaction and rendering only; it should not parse `.ECGsimcase` binary data directly.
4. Rendering tasks add view-specific modules for heart geometry, thorax geometry, ECG plots, and TMP plots.

Current supported-case web loading:

1. `tools/export_viewer_fixtures.py` parses supported `.ECGsimcase` files with `ecgsim.io.load_case`.
2. It writes app-ready case bundles under `app/viewer/public/fixtures/cases/` plus a SHA-256 manifest.
3. The browser file picker hashes the selected local file with WebCrypto.
4. If the hash and size match the manifest, the viewer loads the corresponding bundle and redraws all panes.
5. Unsupported files leave the current loaded case visible and show an explicit unsupported notice.

This keeps legacy parsing testable in Python while allowing the UI to evolve independently.

## Design Bias

Prefer compatibility and testability over early abstraction. Add abstractions when two real implementations or workflows need the same contract.
