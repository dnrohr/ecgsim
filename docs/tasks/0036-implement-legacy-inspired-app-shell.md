# 0036 Implement Legacy-Inspired App Shell

## Objective

Rework the web app shell so it maps clearly to the legacy ECGSIM workspace.

## Minimal Context

The current layout is a modern prototype and does not visually or operationally resemble the legacy app enough for parity work.

## Inputs

- `docs/feature-parity/inventory.md`
- `research/legacy-exports/screenshots/normal-male-main-window.png`
- `app/viewer/`

## Deliverables

- Add primary workspace organization matching legacy concepts.
- Preserve responsive usability.
- Keep controls discoverable without adding unsupported functionality.

## Verification

- Browser workflow tests cover shell navigation/layout.
- Visual comparison notes explain remaining differences.

## Done When

A legacy ECGSIM user can recognize where the core workflows live.

## Result

Added a legacy-inspired shell with title area, menu strip, compact toolbar, case summary, four-pane workspace, and persistent status bar. The toolbar exposes real case opening plus read-only lead/workspace indicators, and `docs/feature-parity/shell-visual-notes.md` records the remaining visual differences from the captured legacy screenshot.
