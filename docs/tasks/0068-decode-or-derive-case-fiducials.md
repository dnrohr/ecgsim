# 0068 Decode Or Derive Case Fiducials

## Objective

Locate, decode, or derive P-wave start and T-wave termination samples for baseline coupling.

## Minimal Context

Task `0052` inferred a baseline window from the promoted `standard_12.adaptECG` export, but parsed `.ECGsimcase` fiducial fields remain unavailable.

## Inputs

- `ecgsim/io/ecgsimcase.py`
- `docs/feature-parity/fiducial-filtering-notes.md`
- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- Promoted and raw legacy ECG exports

## Deliverables

- Search parsed case payloads for plausible fiducial fields or define a documented derivation method.
- Add fiducial data to case metadata when proven.
- Preserve explicit unavailable status when not proven.

## Verification

- Tests cover decoded/derived fiducials on at least one case or prove unavailable status remains correct.
- Filtering tests use parsed/derived fiducials when available.

## Done When

Baseline coupling no longer relies only on signal-end fallback or export zero-run inference for supported cases.
