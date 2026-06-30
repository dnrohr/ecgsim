# 0042 Implement Surface Potential Maps And Animation

## Objective

Implement thorax/body-surface potential maps and animation.

## Minimal Context

Legacy ECGSIM visualizes surface potentials over time. Current app only plots traces.

## Inputs

- Parsed thorax geometry and signal matrices.
- `docs/simulation.md`
- `research/extracted-text/www.ecgsim.org/manual/thorax.txt`

## Deliverables

- Add potential color mapping on thorax geometry.
- Support initial/adapted/measured map modes when data exists.
- Link map frames to shared time cursor.

## Verification

- Map colors are deterministic and covered by visual/app tests.
- Numeric frame values match parsed or computed source matrices.

## Done When

Thorax map workflows are available for supported cases.
