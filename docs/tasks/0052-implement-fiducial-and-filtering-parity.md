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

## Prior Progress Note

Earlier work made baseline fiducial availability explicit in case metadata and fixtures, exposed whether baseline correction uses parsed P/T fiducials or fallback signal endpoints, and verified AC/DC/baseline mode switching in core and app tests. Task `0048` then provided promoted `.refECG` and `.adaptECG` fixtures for `normal-male-ecgsim301`.

## Completion Note

Task `0052` is complete for the promoted normal male ECGSIM 3.0.1 adapted ECG export. The project now reads row-major legacy ECG/TMP exports with `read_legacy_row_major_matrix()` and infers the `standard_12.adaptECG` baseline window from shared near-zero legacy export runs. The inferred window is sample `(5, 499)` at `1e-5 mV` tolerance. Tests verify DC pass-through, AC mean subtraction, and baseline endpoint correction against that real export.

The remaining ambiguity is source location, not filtering behavior: parsed `.ECGsimcase` payloads still do not expose decoded P-wave start and T-wave termination samples, so bundled viewer cases continue to mark fiducials unavailable and use the signal-end fallback.

## Capture Handoff

Validate the capture for filtering before promoting fixtures:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --require-task 0052 --format markdown --output research/legacy-exports/<case-name>-0052-handoff.md
```

Then promote the ECG artifacts needed by filtering tests:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name> --artifact referenceEcg --artifact adaptedEcg
```
