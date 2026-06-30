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

## Result

- Added a compact measured thorax surface-potential map to viewer ECG fixtures from the parsed `300 x 1000` PMatrix payload.
- Enabled the Thorax measured BSPM surface mode when map data exists.
- Colored the thorax mesh from measured map values at the shared time cursor sample.
- Added fixture regression, smoke, and browser workflow coverage for measured BSPM dimensions, canvas recoloring, and time-linked map updates.
- Documented supported map behavior and remaining initial/adapted/sensitivity blockers in `docs/feature-parity/surface-potential-map-notes.md`.
