# 0029 Design ECGsimcase Object Model

## Objective

Design the parsed object model for real `.ECGsimcase` loading.

## Minimal Context

The current parser reads metadata and known offsets. Feature parity needs named objects for geometry, source parameters, activation, signals, and lead systems.

## Inputs

- `docs/file-formats/ecgsimcase.md`
- `docs/architecture.md`
- `docs/source-editing-model.md`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`

## Deliverables

- Add `docs/file-formats/ecgsimcase-object-model.md`.
- Define stable Python data structures and naming for parsed case objects.
- Identify unknown binary fields and safe fallback behavior.

## Verification

- Model covers all marker groups currently reported by `ecgsim-case-info`.
- The design states how viewer fixture generation will migrate to the object model.

## Done When

Parser implementation can proceed without inventing object names ad hoc.
