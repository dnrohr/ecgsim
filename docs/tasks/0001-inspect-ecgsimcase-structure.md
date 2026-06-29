# 0001 Inspect ECGsimcase Structure

## Objective

Determine the container/file structure of the downloaded `.ECGsimcase` files well enough to plan a reader.

## Minimal Context

The downloaded cases are in `research/source/www.ecgsim.org/downloads/cases/`. The roadmap starts with compatibility, so do not implement a full parser yet. First identify what kind of files these are and what sections or embedded files they contain.

## Inputs

- `research/source/www.ecgsim.org/downloads/cases/*.ECGsimcase`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`
- `research/website-notes.md`

## Deliverables

- Create `docs/file-formats/ecgsimcase.md`.
- Document magic bytes, container type, compression if any, top-level structure, repeated sections, and likely purpose of each section.
- Compare all four downloaded cases and note common versus case-specific structure.
- Record exact inspection commands or add a small repeatable inspection script under `tools/`.
- Update `docs/tasks/README.md` if task ordering changes.

## Verification

- The documentation names all four case files inspected.
- The inspection process can be repeated from documented commands or a script.
- `git status --short` is checked before committing.

## Done When

An agent can read `docs/file-formats/ecgsimcase.md` and know the next concrete parser work without opening the raw cases first.
