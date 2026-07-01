# Legacy Capture Validation

- Capture directory: `research/legacy-exports/raw/normal-young-male/export-directory/normal_young_male`
- Files: 60
- Total bytes: 129073646
- Ready for numerical parity: yes

## Required Artifacts

| Artifact | Present | Paths |
| --- | --- | --- |
| `tmpSource` | yes | `atrial_beats/beat1/user.source`, `ventricular_beats/beat1/user.source` |
| `adaptedEcg` | yes | `ecgs/standard_12.adaptECG` |
| `referenceEcg` | yes | `ecgs/BSM_(nijmegen_64).refECG`, `ecgs/VCG_(Frank).refECG`, `ecgs/minimap_montage.refECG`, `ecgs/single_lead.refECG`, `ecgs/standard_12.refECG` |

## Task Readiness

| Task | Ready | Missing artifacts |
| --- | --- | --- |
| `0049` Legacy TMP Generator Parity | yes | none |
| `0051` Viewer Recompute Pipeline | yes | none |
| `0052` Fiducial And Filtering Parity | yes | none |
| `0053` Numerical Parity Harness | yes | none |
