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

## Completion Note

Completed by promoting the normal male `(5, 499)` baseline window inferred from the promoted ECGSIM 3.0.1 `standard_12.adaptECG` zero-run evidence into case signal metadata and generated viewer fixtures. This is explicitly labeled `derived-from-legacy-export`, not decoded from `.ECGsimcase` payload fields. WPW cases keep fiducials unavailable. Parser, fixture, smoke, and browser tests cover the derived normal window, unavailable WPW status, and visible baseline-coupling status.
