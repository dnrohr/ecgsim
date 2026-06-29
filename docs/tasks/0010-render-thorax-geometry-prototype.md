# 0010 Render Thorax Geometry Prototype

## Objective

Render thorax-related geometry in the chosen viewer stack.

## Minimal Context

The thorax view eventually needs thorax, lungs, heart context, electrodes, BSPM, and sensitivity maps. This task is only the geometry layer.

## Inputs

- Geometry reader from task 0005.
- Viewer scaffold from task 0008.
- Thorax/lung geometry fixtures or case-derived geometry.

## Deliverables

- Render thorax mesh and available lung meshes.
- Add visibility toggles for thorax/lungs if cheap in the existing stack.
- Show geometry counts in developer-facing metadata.

## Verification

- App/prototype runs locally.
- Geometry appears nonblank and count metadata matches parser tests.
- Visual orientation assumptions are documented.

Task result:

- Thorax fixture bundle is exported from `thorax.tri`, `llung.tri`, and `rlung.tri`.
- Viewer metadata reports `thorax: 300/596 | leftLung: 116/228 | rightLung: 116/228`.
- Browser verification checked desktop and mobile screenshots for nonblank thorax pixels and changed pixels during rotation.
- Orientation preserves the legacy geometry coordinate frame, centers the rendered group for inspection, and uses a fixed camera plus slow y-axis rotation. Anatomical axis labels are not established yet.

## Done When

A developer can visually inspect thorax and lung meshes from legacy data.
