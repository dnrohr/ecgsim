# Visual Parity Completion Audit

Status: task `0103`.

Audit date: 2026-07-03.

## Result

The visualization feature-parity roadmap is substantially covered by modern equivalents and automated visual-smoke tests, but the full goal is not proven complete.

The matrix audit reports:

- 39 visualization matrix rows.
- 32 rows marked `supported`.
- 4 rows marked `modern-equivalent`.
- 3 rows marked `blocked-on-evidence`.
- 0 rows with unsupported or ambiguous statuses such as `partial`.

Run the audit with:

```powershell
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
```

Use `--require-complete` when a release gate should fail while evidence blockers remain.

## Remaining Evidence Blockers

| Area | Mode | Missing evidence |
| --- | --- | --- |
| Heart | Endocardial/epicardial and transmural mapping | `PGraphGeometry` or wall-side mapping semantics are not decoded. |
| TMP | Electrogram | Selected-heart-node electrogram payload or derivation equation has not been identified. |
| Leads | Measured/initial/adapted overlays | Measured/initial signal classification and WCT/reference lead-transform semantics are not decoded. |

## Completion Interpretation

The current app gives users discoverable modern equivalents for the major Heart, Thorax, TMP, Leads, visual-output, and reference workflows that are backed by parsed or computed data. Automated browser workflow tests, per-mode visual smoke tests, PNG/WebM export checks, and curated legacy screenshot-region checks cover the implemented visual surface.

The goal should stay active until the three evidence blockers are resolved or the product decision explicitly accepts them as out of scope. The current state is a strong visualization parity baseline, not a final proof that every legacy visual mode is available.

## Verification Evidence

- `npm --prefix app/viewer run test:visual-modes`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:package`
- `npm --prefix app/viewer test`
- `python tools/validate_curated_visual_references.py research/legacy-exports/curated-pane-references.json`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
- `python -m unittest discover -s tests`
