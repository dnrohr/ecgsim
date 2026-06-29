# 0009 Render Heart Geometry Prototype

## Objective

Render loaded heart geometry in the chosen viewer stack.

## Minimal Context

This is a prototype for visual correctness, not final UI polish. It should use parsed or exported geometry data and make orientation/count mistakes easy to spot.

## Inputs

- Geometry reader from task 0005.
- Viewer scaffold from task 0008.
- Heart geometry fixtures or case-derived geometry.

## Deliverables

- Render heart mesh with basic rotation.
- Show node/triangle counts in developer-facing metadata.
- Add a screenshot or visual verification note if automated visual tests are not ready.

## Verification

- App/prototype runs locally.
- Geometry appears nonblank and count metadata matches parser tests.
- No unrelated UI polish work is bundled.

Task result:

- Heart fixture is exported from `research/source/www.ecgsim.org/downloads/other13/geometry/heart.tri`.
- Viewer metadata reports `257 nodes / 510 triangles`.
- Browser verification checked desktop and mobile screenshots for nonblank heart pixels and changed pixels during rotation.

## Done When

A developer can visually inspect a heart mesh from legacy data.
