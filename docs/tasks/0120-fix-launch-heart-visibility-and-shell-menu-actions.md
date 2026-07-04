# 0120 Fix Launch Heart Visibility And Shell Menu Actions

Status: complete.

## Goal

Make the first visible app state match user expectations: the Heart pane should clearly show a heart, and the legacy-style menu row should perform useful actions instead of acting as static text.

## Context

The visualization audit passed because tests checked nonblank canvases and mode coverage, but the default Heart pane only showed the parsed red shell, which is visually tiny and easy to read as missing. The source mesh was available but hidden behind a checkbox. The top `File`, `Edit`, `Heart`, `Thorax`, `ECGs`, `Options`, and `Help` menu labels were plain spans, so they looked clickable but did nothing.

## Changes

- Defaulted the visual mode navigator to `Heart source mesh`.
- Defaulted the Heart source mesh overlay on at case load.
- Repainted Heart and Thorax WebGL canvases immediately after viewport resize to avoid transient blank panels.
- Converted the menu strip labels into enabled buttons:
  - `File` opens case selection.
  - `Edit` focuses TMP editing.
  - `Heart`, `Thorax`, and `ECGs` navigate to their primary views.
  - `Options` focuses the visual-mode navigator.
  - `Help` opens the Help/About dialog.
- Strengthened workflow tests to assert launch source-mesh visibility and menu button behavior.

## Verification

Run:

```powershell
python -m unittest discover -s tests
npm --prefix app/viewer test
npm --prefix app/viewer run test:app
npm --prefix app/viewer run test:visual-modes
python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md
git diff --check
```
