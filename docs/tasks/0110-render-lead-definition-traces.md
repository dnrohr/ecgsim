# 0110 Render Lead Definition Traces

Status: complete.

## Goal

Use the parsed lead/reference/show-lead definitions from task `0109` in the modern Leads pane so selected lead systems display lead-labeled traces instead of raw electrode rows where definitions are available.

## Scope

- Compose case signal traces from parsed `leadDefinitions` and `referenceDefinitions`.
- Compose adapted recompute traces through the same lead-definition path.
- Preserve conservative behavior for definitions without direct electrode indices, such as derived Frank axes.
- Order and label traces through parsed `shownLeadDefinitions`.
- Update browser workflow and smoke tests from electrode-row expectations to parsed lead-trace expectations.

## Findings

- `standard_12` now displays 12 parsed lead traces for the normal case rather than 9 electrode rows.
- `BSM_(amsterdam_64)` displays 65 parsed lead traces in WPW bundles.
- `VCG_(Frank)` keeps 7 directly backed traces out of 10 definitions because three derived axes do not expose direct electrode indices.

## Out Of Scope

- Claiming final clinical lead-transform parity.
- Decoding augmented-lead/reference weighting beyond the parsed reference-member average.
- Enabling measured/initial overlay classification.

## Verification

- `npm --prefix app/viewer test`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:visual-modes`
- `python -m unittest discover -s tests`
- `python tools/audit_visual_parity.py docs\feature-parity\visualization-matrix.md`
- `git diff --check`
