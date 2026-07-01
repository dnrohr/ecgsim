# 0052 Implement Fiducial And Filtering Parity

## Objective

Match legacy fiducial handling and filtering/coupling modes.

## Minimal Context

Current baseline mode falls back to first/last sample correction. Legacy behavior references P-wave start and T-wave end.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- Parsed timing/fiducial data.
- Validated raw legacy exports from task `0048`.
- Promoted `referenceEcg` and `adaptedEcg` fixtures under `tests/fixtures/legacy-parity/<case-name>/`, created with `tools/promote_legacy_parity_fixtures.py`.
- `ecgsim/core/filtering.py`

## Deliverables

- Parse or compute required fiducials.
- Implement baseline/AC/DC behavior to legacy tolerance.
- Document remaining ambiguity.

## Verification

- Tests compare filtered signals to legacy reference exports.
- App tests verify mode switching with real case data.
- Promoted fixture manifests pass:

```powershell
python tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>
```

## Done When

Filtering modes are parity-tested rather than approximate.

## Progress Note

Partially implemented by making baseline fiducial availability explicit in case metadata and fixtures, exposing whether baseline correction uses parsed P/T fiducials or fallback signal endpoints, and verifying AC/DC/baseline mode switching in core and app tests. Task `0048` now provides promoted `.refECG` and `.adaptECG` fixtures for `normal-male-ecgsim301`; remaining parity work should compare against those exports while resolving the still-unlocated P-wave/T-wave sample fields.

## Capture Handoff

Validate the capture for filtering before promoting fixtures:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --require-task 0052 --format markdown --output research/legacy-exports/<case-name>-0052-handoff.md
```

Then promote the ECG artifacts needed by filtering tests:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name> --artifact referenceEcg --artifact adaptedEcg
```
