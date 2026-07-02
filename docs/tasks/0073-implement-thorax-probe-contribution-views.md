# 0073 Implement Thorax Probe Contribution Views

## Objective

Add thorax probe workflows that show selected electrode/node contribution or sensitivity data.

## Minimal Context

Thorax node/electrode selection exists, but contribution and sensitivity visualization remain missing or partial.

## Inputs

- `app/viewer/src/main.js`
- Transfer matrices in viewer fixtures
- `ecgsim/core/transfer.py`
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Select a thorax node/electrode as an ECG target.
- Display corresponding contribution/sensitivity values on the Heart or Thorax where supported.
- Document unsupported transfer roles.

## Verification

- Unit tests cover contribution/sensitivity vector extraction.
- Browser/app test selects a thorax target and confirms the mapped view updates.

## Done When

Thorax probe workflows produce meaningful, testable scientific views.

## Completion Notes

Status: complete.

- Added `contributionValuesForThoraxNode` to extract the selected Thorax target's ventricles-to-thorax transfer row.
- Added Heart `Thorax contribution` surface mode, driven by the currently selected Thorax node.
- Browser workflow tests select a Thorax target and verify the Heart contribution map renders; smoke tests cover contribution vector dimensions and representative values.
- Documented that electrode target shortcuts, lead-transfer contribution roles, and WCT/reference parity remain unresolved.
