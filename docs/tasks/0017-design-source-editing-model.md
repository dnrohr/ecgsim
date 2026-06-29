# 0017 Design Source Editing Model

## Objective

Design how source parameter edits are represented before implementing interaction.

## Minimal Context

ECGSIM supports node/region edits to depolarization time, repolarization time, resting potential, amplitude, plateau slope, and repolarization slope. Edits must preserve initial versus adapted values.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/heart.txt`
- `research/extracted-text/www.ecgsim.org/manual/membrane.txt`
- Parser domain objects.

## Deliverables

- Document source-edit data model and undo/reset behavior.
- Record any architectural decision in `docs/decisions.md`.
- Add type/interface stubs only if useful.

## Verification

- Model accounts for initial/adapted values, beats, atria/ventricles, selected regions, and reset.
- Unknown behavior is listed.

## Done When

Implementation tasks can add selection and editing without inventing state semantics.
