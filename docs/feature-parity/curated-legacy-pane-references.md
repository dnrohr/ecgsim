# Curated Legacy Pane References

Status: task `0102`.

## Purpose

The project currently has one tracked legacy ECGSIM 3.0.1 screenshot:

```text
research/legacy-exports/screenshots/normal-male-main-window.png
```

Task `0102` promotes that screenshot into a curated pane-reference manifest:

```text
research/legacy-exports/curated-pane-references.json
```

The manifest records conservative bounding boxes for the legacy Heart, Thorax, TMP, and Leads panes. These regions are intended for visual smoke, human review, and agent handoff. They are not pixel-perfect targets.

## Included Regions

| Reference | Pane | Evidence |
| --- | --- | --- |
| `normal-male-main-window` | Heart | Colored heart timing map with contour/isofunction lines and timing scale. |
| `normal-male-main-window` | Thorax | Thorax body geometry with lungs and heart context. |
| `normal-male-main-window` | TMP | TMP plotting region, grid, axes, and labels. |
| `normal-male-main-window` | Leads | Standard 12-lead ECG grids, red traces, and yellow time cursor. |

## Validation

Run:

```powershell
python tools/validate_curated_visual_references.py research/legacy-exports/curated-pane-references.json
```

The validator checks:

- referenced PNG exists;
- checksum and dimensions match the manifest;
- each pane region is inside the source image;
- each pane region has nonblank luminance, color, and edge-detail metrics.

## Limits

- The pane regions are cropped from a full-window screenshot, not captured through legacy pane clipboard export.
- The screenshot only represents the initial normal male view.
- It does not cover every Heart surface, Thorax BSPM mode, TMP edit state, VCG loop, or linked interval/zoom workflow.
- Future capture tasks should add separate mode-specific pane images when the legacy app can be driven reliably.
