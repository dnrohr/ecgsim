# Visual Export Notes

Status: task `0056` adds high-value visual capture for modern report and teaching workflows.

## Implemented

Each primary pane has two visual export controls:

- `PNG`: downloads the current canvas as a PNG image.
- `Copy`: attempts to copy the current canvas image to the system clipboard through the browser Clipboard API.

Supported panes:

- Heart.
- Thorax.
- TMP.
- Leads.

PNG filenames use the current case base name and pane identifier, for example:

```text
normal_male2-heart.png
normal_male2-thorax.png
normal_male2-tmp.png
normal_male2-leads.png
```

The image captures the current visible canvas state, including selected surface function, time cursor state, grid/toggle choices, scale, and current geometry orientation.

## Clipboard Behavior

Clipboard image copy depends on browser and desktop permissions. When `navigator.clipboard.write()` and `ClipboardItem` are unavailable, the app leaves the PNG download path available and reports that clipboard copy is unavailable.

## Deferred

Movie export is not implemented yet. The legacy manuals mention movie workflows for Heart and Thorax, but current evidence does not confirm whether legacy ECGSIM writes movie files or only plays animations. A later task should define frame sequences, duration, codec/container, and parity evidence before adding movie output.

## Verification

`app/viewer/scripts/app-test.mjs` downloads PNGs for Heart, Thorax, TMP, and Leads, then verifies:

- PNG file signature.
- Useful dimensions.
- Nontrivial file size.

The same app workflow still checks that source canvases are nonblank before export.
