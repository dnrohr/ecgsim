# Browser Case Loading Boundary

Status: task `0062` design decision for modernization roadmap NF1.

## Decision

The viewer should stay bundle-first for browser-native case loading.

The authoritative `.ECGsimcase` parser remains the Python `ecgsim.io` implementation until a tested JavaScript or WASM parser reaches feature parity with the Python reader. Browser UI code should load normalized case bundles, validate their schema, and render them; it should not directly parse legacy binary marker payloads as part of ordinary UI state.

## Supported Loading Paths

### Built-In Bundle

The default app load path remains the committed fixture set under `app/viewer/public/fixtures/`. This keeps the static preview fast, deterministic, and usable without file access.

### Hash-Matched Legacy Case

The current supported browser path for a local `.ECGsimcase` file is:

1. User selects a local file in the app.
2. Browser computes SHA-256 and byte size using WebCrypto and the File API.
3. App matches `{ sha256, byteSize }` against `app/viewer/public/fixtures/cases/manifest.json`.
4. App fetches the matching generated bundle from `app/viewer/public/fixtures/cases/<sha256>.json`.
5. App redraws all panes from the bundle and records the original case identity in metadata.

This path is the preferred near-term implementation boundary because it lets the web app open real user-selected case files while keeping legacy binary parsing reproducible in Python.

### User-Provided Modern Bundle

Task `0063` added a direct import path for a generated modern case bundle. That bundle uses the same schema as `tools/export_viewer_fixtures.py` emits for hash-matched supported cases, with validation before rendering.

This is the right next step before attempting full browser-side `.ECGsimcase` parsing.

## Unsupported Or Deferred Paths

### Arbitrary Browser-Side `.ECGsimcase` Parsing

Direct binary parsing in browser JavaScript is deferred. It should only be added after:

- A shared parser conformance suite exists for Python and JS/WASM.
- Marker dispatch, endian handling, shape validation, units, unsupported payload reporting, and error messages match the Python parser.
- Large case memory/performance behavior is measured in browser and packaged desktop contexts.

When implemented, direct parsing should produce the same normalized bundle contract described below. Rendering code should not care whether the bundle came from Python, JS, or WASM.

### Remote Server Parsing

A server-side upload/parse service is not part of the current product boundary. It may be useful later for hosted deployments, but it changes privacy, deployment, and data-retention assumptions. Keep the local bundle path first.

### Partial Raw Payload Injection

The app should not accept ad hoc raw geometry, matrix, or vector files as a "case" loading path. Those belong to specific import workflows such as ECG import or source import/export tasks.

## Bundle Contract

A case bundle is a normalized JSON object with these top-level keys:

- `caseMetadata`
- `heart`
- `thorax`
- `ecgSignals`
- `tmpWaveforms`

The initial schema authority is `tools/export_viewer_fixtures.py`. Future producers must preserve the same semantics:

- Coordinates emitted to the viewer are meters.
- Signal values include `sampleRateHz`, `units`, row/column counts, source offsets when known, and explicit unsupported fields.
- Fiducials include `status`, `baselineStartIndex`, `baselineEndIndex`, and `interpretation`.
- Source parameter vectors include initial and adapted values by parameter name.
- Transfer matrices include shape, source offset, role, values, and status.
- Case metadata includes file name, byte size, SHA-256 when known, marker counts, unsupported payloads, lead systems, activation summaries, and wall-mapping status.
- Case metadata includes `validation` with `status`, unsupported payload count, unavailable capabilities, and concise messages for UI display and tests.

Task `0063` should add a lightweight schema validator in the browser. The validator should fail before rendering if required top-level sections or essential dimensions are missing.

## Manifest Contract

`app/viewer/public/fixtures/cases/manifest.json` maps original legacy cases to generated bundles. Each entry must include:

- `fileName`
- `byteSize`
- `sha256`
- `bundle`

The manifest should not imply that unsupported cases can be parsed in-browser. It is an allowlist for preprocessed, tested cases.

## Error Handling

Loading errors should preserve the current case and report the reason in user-visible status text.

Expected classes:

- Selected file hash/size is not in the manifest.
- Matching bundle cannot be fetched.
- Bundle JSON is malformed.
- Bundle schema is invalid.
- Bundle is valid but contains unsupported capabilities that should be shown as unavailable.

Developer diagnostics should include enough detail for tests and bug reports, but user text should remain concise.

## Implementation Sequence

1. `0063`: import generated modern case bundles directly through the app UI. Completed.
2. `0064`: generate and load all parser-supported WPW variants through the same bundle contract.
3. `0065`: formalize validation summaries and user-facing partial-support status.
4. Future task: evaluate JS/WASM `.ECGsimcase` parsing only after bundle import and validation are stable.

## Rationale

ECGSIM case parsing is high-risk because the binary container has many marker types, unsupported payloads, and scientific-unit assumptions. The Python parser is already tested against archived cases and parity fixtures. Keeping the browser boundary at normalized bundles protects scientific behavior while still moving toward a web app users can operate without rebuilding fixtures manually.
