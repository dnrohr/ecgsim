# 0015 Define Parity Tolerances

## Objective

Define numerical and visual tolerances for comparing modern output to legacy ECGSIM.

## Minimal Context

Scientific parity should be measurable. Exact equality may not be realistic once algorithms, platforms, or floating-point libraries differ.

## Inputs

- Reference exports from task 0014.
- Parser and viewer outputs.
- Relevant papers/manual notes in `research/`.

## Deliverables

- Add `docs/parity.md`.
- Define tolerances for geometry counts, coordinates, ECG signals, TMP waveforms, and rendered views.
- Mark areas where tolerances are unknown.

## Result

- Added `docs/parity.md` with exact structural thresholds, float32 numeric thresholds, visual smoke thresholds, and unknowns for unverified raw exports/TMP generation.
- Recorded current fixture dimensions so future tests can start from concrete expectations.

## Verification

- Each tolerance includes rationale and units.
- Unknowns are tracked as open questions.

## Done When

Future tests can use documented parity thresholds instead of ad hoc comparisons.
