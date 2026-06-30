# 0031 Parse Source Parameters Beats And Activation Objects

## Objective

Parse source parameters, beat inventory, and activation construction data from `.ECGsimcase`.

## Minimal Context

TMP editing and recomputation need named source/beat data instead of hard-coded `PVector` offsets.

## Inputs

- `docs/source-editing-model.md`
- `docs/file-formats/ecgsimcase-object-model.md`
- `docs/simulation.md`
- Current offset fixtures in `docs/file-formats/ecgsimcase.md`.

## Deliverables

- Add source parameter parser output for atrial and ventricular sources.
- Preserve initial and adapted values.
- Identify activation/focus data fields that remain unknown.
- Add tests against known vectors from `normal_male2.ECGsimcase`.

## Verification

- Parsed parameter vectors match existing offset-driven fixture values within `docs/parity.md`.
- Beat/source IDs are stable and documented.

## Done When

TMP editing can be populated from parsed case objects rather than fixture offsets.
