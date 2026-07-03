# 0102 Capture Curated Legacy Pane References

## Objective

Capture or promote curated legacy pane references for visualization parity review.

## Minimal Context

The project has one tracked ECGSIM 3.0.1 full-window screenshot for the normal male case. Mode-specific pane screenshots are not currently available as separate files. This task should extract maximum useful evidence from the tracked screenshot without pretending it covers every visual mode.

## Inputs

- `research/legacy-exports/screenshots/normal-male-main-window.png`
- `research/legacy-exports/screenshots-manifest.json`
- `docs/legacy-reference-exports.md`
- `docs/feature-parity/visual-regression-notes.md`

## Deliverables

- Add a curated manifest for legacy pane regions.
- Include Heart, Thorax, TMP, and Leads pane evidence from the tracked screenshot.
- Add validation so references are checksum-locked, in-bounds, and visually nonblank.
- Document limits and future capture needs.

## Verification

- `python tools/validate_curated_visual_references.py research/legacy-exports/curated-pane-references.json`
- `python -m unittest discover -s tests`

## Done When

Agents have a small, committed, validated legacy pane-reference set they can consult for visual parity work without relying on ignored raw captures.

## Completion Notes

Status: complete.

- Added `research/legacy-exports/curated-pane-references.json` with Heart, Thorax, TMP, and Leads pane regions from the tracked normal-male legacy screenshot.
- Added `tools/validate_curated_visual_references.py`.
- Added `docs/feature-parity/curated-legacy-pane-references.md`.
- The reference set is explicitly bounded to initial-view pane evidence and does not claim mode-complete visual coverage.
