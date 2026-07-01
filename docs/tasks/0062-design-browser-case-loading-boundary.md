# 0062 Design Browser Case Loading Boundary

## Objective

Define how the app should load user-selected `.ECGsimcase` files in a web-capable architecture.

## Minimal Context

The viewer currently consumes generated JSON bundles. Python parsing is authoritative, but the app should eventually work as a web app without requiring users to run Python manually.

## Inputs

- `docs/modernization-roadmap.md`
- `docs/architecture.md`
- `tools/export_viewer_fixtures.py`
- `app/viewer/src/`
- Existing fixture schemas under `app/viewer/public/fixtures/`

## Deliverables

- Document the preferred browser/runtime loading boundary.
- Identify which parsing should move to JavaScript/WASM, which can remain preprocessed, and which should be deferred.
- Define fixture/schema contracts shared by generated bundles and browser-opened cases.

## Verification

- Documentation names supported and unsupported case-loading paths.
- No implementation is required beyond docs unless small schema notes are needed.

## Done When

An implementation agent can start browser case loading without redesigning the boundary.

## Completion Note

Completed by adding `docs/browser-case-loading-boundary.md`. The chosen boundary is bundle-first: Python remains the authoritative `.ECGsimcase` parser, the browser loads and validates normalized case bundles, hash-matched legacy files remain an allowlist path through `fixtures/cases/manifest.json`, and arbitrary browser-side binary parsing is deferred until a tested JS/WASM parser can produce the same bundle contract.
