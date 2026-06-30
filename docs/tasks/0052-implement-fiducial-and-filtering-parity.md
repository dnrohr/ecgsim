# 0052 Implement Fiducial And Filtering Parity

## Objective

Match legacy fiducial handling and filtering/coupling modes.

## Minimal Context

Current baseline mode falls back to first/last sample correction. Legacy behavior references P-wave start and T-wave end.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- Parsed timing/fiducial data.
- Raw legacy exports from task `0048`.
- `ecgsim/core/filtering.py`

## Deliverables

- Parse or compute required fiducials.
- Implement baseline/AC/DC behavior to legacy tolerance.
- Document remaining ambiguity.

## Verification

- Tests compare filtered signals to legacy reference exports.
- App tests verify mode switching with real case data.

## Done When

Filtering modes are parity-tested rather than approximate.

## Progress Note

Partially implemented by making baseline fiducial availability explicit in case metadata and fixtures, exposing whether baseline correction uses parsed P/T fiducials or fallback signal endpoints, and verifying AC/DC/baseline mode switching in core and app tests. Full parity remains blocked by missing raw legacy exports from task `0048` and by unlocated P-wave/T-wave sample fields.
