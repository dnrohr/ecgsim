# Visual Parity Completion Audit

Status: task `0103`.

Audit date: 2026-07-03.

## Result

The visualization feature-parity roadmap is substantially covered by modern equivalents and automated visual-smoke tests, but the full goal is not proven complete.

The matrix audit reports:

- 39 visualization matrix rows.
- 32 rows marked `supported`.
- 7 rows marked `modern-equivalent`.
- 0 rows marked `blocked-on-evidence`.
- 0 rows with unsupported or ambiguous statuses such as `partial`.

Run the audit with:

```powershell
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
```

Use `--require-complete` when a release gate should fail while evidence blockers remain.

## Remaining Numerical Parity Work

| Area | Mode | Missing evidence |
| --- | --- | --- |
| Leads | Measured/initial/adapted overlays | Visual parity is covered by promoted/imported measured traces and computed initial/adapted traces. Exact arbitrary case-payload measured classification and final reference-weight equations remain numerical parity work. |

## Completion Interpretation

The current app gives users discoverable modern equivalents for the major Heart, Thorax, TMP, Leads, visual-output, and reference workflows that are backed by parsed or computed data. Automated browser workflow tests, per-mode visual smoke tests, PNG/WebM export checks, and curated legacy screenshot-region checks cover the implemented visual surface.

The visualization feature-parity matrix has no remaining evidence blockers. Exact numerical parity still has open work around lead reference weights, EGM scale validation, and legacy wall-pair semantics, but every legacy visual mode now has a discoverable supported or modern-equivalent path.

## Verification Evidence

- `npm --prefix app/viewer run test:visual-modes`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`
- `python tools/validate_curated_visual_references.py research/legacy-exports/curated-pane-references.json`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
- `python -m unittest discover -s tests`
