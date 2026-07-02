# Visual Export Notes

Status: updated through task `0080`.

## Implemented

Each primary pane has two visual export controls:

- `PNG`: downloads the current canvas as a PNG image.
- `Movie`: downloads a short WebM animation of the current pane over the shared time range.
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

## Movie Behavior

Movie export uses the browser `MediaRecorder` API with WebM encoding. Filenames use the current case base name and pane identifier:

```text
normal_male2-heart.webm
normal_male2-thorax.webm
normal_male2-tmp.webm
normal_male2-leads.webm
```

The export records a short deterministic sequence by stepping the shared time cursor across the currently loaded case time range, redrawing the selected pane at each frame, and restoring the original time sample after recording. Current pane settings are preserved, including surface function, coupling/filter mode, grid/toggle choices, and scale.

Browser limitations:

- WebM export requires `canvas.captureStream()`, `MediaRecorder`, and a supported `video/webm` encoder.
- Safari and locked-down embedded browsers may not support this path.
- This is a modern teaching/review export, not a confirmed clone of legacy ECGSIM movie output. The legacy capture notes still track whether the original app writes a movie file or only animates in place.

## Clipboard Behavior

Clipboard image copy depends on browser and desktop permissions. When `navigator.clipboard.write()` and `ClipboardItem` are unavailable, the app leaves the PNG download path available and reports that clipboard copy is unavailable.

## Deferred

- Exact legacy movie-file parity remains deferred until raw legacy movie behavior is captured.
- Numbered PNG frame sequence export remains a possible fallback for browsers without WebM support.

## Verification

`app/viewer/scripts/app-test.mjs` downloads PNGs for Heart, Thorax, TMP, and Leads, then verifies:

- PNG file signature.
- Useful dimensions.
- Nontrivial file size.

The same app workflow downloads a Leads WebM movie and verifies:

- EBML/WebM file signature.
- Nontrivial file size.
- Export status message.

The app workflow still checks that source canvases are nonblank before export.
