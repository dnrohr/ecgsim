# 0069 Capture Additional Numerical Parity Scenarios

## Objective

Capture and promote additional legacy numerical scenarios beyond the first normal male export.

## Minimal Context

The current numerical harness is strong for one normal male ECGSIM 3.0.1 export. Broader confidence needs more cases and edited workflows.

## Inputs

- `tools/validate_legacy_capture.py`
- `tools/promote_legacy_parity_fixtures.py`
- `docs/legacy-reference-exports.md`
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Capture at least one additional case or edited workflow from the legacy app.
- Validate the raw capture and keep full raw artifacts ignored.
- Promote only curated fixtures needed for tests.

## Verification

- Capture validation passes for the selected task/workflow.
- Promoted fixture manifest verifies.
- Numerical scenario tests consume the new fixture set.

## Done When

The parity harness covers more than the initial unedited normal male export.

## Completion Note

Completed by capturing the legacy ECGSIM 3.0.1 bundled `normal_young_male.ECGsimcase` through `File -> Export`, validating the ignored raw export directory, and committing manifest/validation handoff files. Promoted fixtures intentionally include the small ECG artifacts only (`referenceEcg` and `adaptedEcg`) under `tests/fixtures/legacy-parity/normal-young-male-ecgsim301/`; the larger raw TMP `.user.source` matrices remain ignored until a focused task needs them. The numerical parity harness now verifies the second fixture manifest and reads the promoted ECG matrices.
