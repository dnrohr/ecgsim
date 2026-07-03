# Visual Regression Notes

Status: task `0081` adds a broad visual smoke harness.

## What Is Checked

`tools/visual_regression.py` analyzes PNG screenshots without claiming pixel-perfect parity. It reports:

- image dimensions
- mean luminance
- luminance standard deviation
- sampled color diversity
- sampled edge energy

The smoke gate fails screenshots that are too small, blank/near-blank, too low in color diversity, or too low in edge detail. A broad reference comparison can also compare aspect ratio and mean luminance against a reference screenshot.

## Commands

Check the tracked legacy screenshot:

```powershell
python tools/visual_regression.py research/legacy-exports/screenshots/normal-male-main-window.png
```

Capture the packaged modern viewer and compare it to the legacy baseline:

```powershell
npm --prefix app/viewer run capture:package
python tools/visual_regression.py app/viewer/dist/package-screenshot/packaged-viewer.png --reference research/legacy-exports/screenshots/normal-male-main-window.png
```

Use the comparison as an early warning for broken rendering or gross layout drift. Do not treat a passing comparison as scientific visual parity.

## Current Boundary

The modern and legacy apps have different UI layout, fonts, rendering engines, canvas contents, and supported workflows. The harness is intentionally loose until curated pane-level reference screenshots exist for specific modes and view states.

## Curated Pane References

Task `0102` adds a curated pane-reference manifest:

```text
research/legacy-exports/curated-pane-references.json
```

It records Heart, Thorax, TMP, and Leads pane regions cropped from the tracked normal-male legacy screenshot. Validate it with:

```powershell
python tools/validate_curated_visual_references.py research/legacy-exports/curated-pane-references.json
```

These regions are useful for nonblank pane evidence and human review. They are still not pixel-perfect references and do not replace future mode-specific pane captures.

## Verification

`tests/test_visual_regression.py` verifies:

- the tracked legacy screenshot passes the smoke gate
- generated nonblank screenshots pass
- generated blank screenshots fail with a useful diagnostic
- broad reference comparison reports both pass and fail cases
