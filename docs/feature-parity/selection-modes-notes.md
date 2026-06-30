# Selection Modes Notes

Status: task `0044` first source-selection parity slice.

## Supported In Current Viewer

- Heart selection supports `Single` replacement mode and `Expand` mode.
- Radius selection remains editable in 2 mm steps.
- Transition-zone width is explicit and stored in selection state.
- Selection state carries concrete `{ index, weight }` node entries.
- TMP parameter edits and selected-parameter resets use transition weights to blend changes across weighted nodes.

## Current Limitations

- Legacy accumulation policies for resetting previous regions and adapting independent regions remain future work.
- Transition-zone geometry is represented by weighted selected nodes, not legacy contour rings.
- The exact legacy transition weighting is still unknown; current weighting is linear across the transition width.
- Undo/redo transaction records are still future work, though selection weights are now available to store.
- Endocardial/epicardial and transmural selection are deferred to task `0045`.
