# 0028 Expand Legacy Reference Capture Plan

## Objective

Plan and improve capture of raw legacy app outputs needed for parity testing.

## Minimal Context

Current legacy export automation has screenshot coverage, but raw File -> Export capture remains unresolved.

## Inputs

- `docs/legacy-reference-exports.md`
- `tools/capture_legacy_screenshot.ps1`
- `tools/summarize_legacy_export.py`
- Legacy app behavior from task `0026`.

## Deliverables

- Update `docs/legacy-reference-exports.md` with a concrete capture matrix.
- Add or improve automation only where reliable.
- Document manual fallback steps for exports that cannot be automated.

## Verification

- Each golden workflow identifies required legacy reference artifacts.
- The plan distinguishes screenshots, raw exports, clipboard output, and movies.

## Done When

Future numerical and visual parity tasks know exactly which legacy artifacts to collect.
