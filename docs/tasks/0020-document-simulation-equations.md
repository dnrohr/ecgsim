# 0020 Document Simulation Equations

## Objective

Document the equations and data requirements needed for recomputation.

## Minimal Context

Simulation should be implemented from documented model behavior and papers/manual notes, not inferred only from UI.

## Inputs

- `research/website-notes.md`
- `research/source/www.ecgsim.org/papers/*.pdf`
- `research/source/www.cinc.org/archives/2011/pdf/0657.pdf`
- `research/extracted-text/www.ecgsim.org/manual/transfer.txt`

## Deliverables

- Add `docs/simulation.md`.
- Document TMP generation, transfer-function application, ECG/BSPM computation, and filtering needs.
- List exact data required from case files.

## Result

- Added `docs/simulation.md` with sourced equations, implementation forms, required case data, and unknowns.

## Verification

- Every equation includes source attribution.
- Unknowns and assumptions are clearly marked.
- No large copyrighted text is copied.

## Done When

Simulation implementation can proceed from a concise internal spec.
