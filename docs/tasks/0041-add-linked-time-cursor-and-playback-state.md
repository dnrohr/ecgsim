# 0041 Add Linked Time Cursor And Playback State

## Objective

Add a shared time cursor and playback state across Heart, Thorax, TMP, and Leads views.

## Minimal Context

Legacy ECGSIM links time-dependent maps and waveforms. The current viewer has static plots.

## Inputs

- `docs/feature-parity/inventory.md`
- Parsed sample-rate/time metadata.
- `app/viewer/`

## Deliverables

- Add shared time state and controls.
- Link cursor display across waveform plots and map views.
- Add play/pause/step behavior if map frames are available.

## Verification

- App tests verify time changes update all relevant views.
- Time units and sample rates are documented.

## Done When

Users can inspect the same time point across all time-dependent views.

## Result

- Added shared time cursor state based on the overlapping TMP and ECG sample window.
- Added toolbar controls for range selection, -2/+2 ms stepping, and play/pause.
- Rendered synchronized yellow cursor lines in TMP and Leads plots.
- Added click and keyboard stepping behavior for waveform canvases.
- Documented current support and blocked map-frame parity in `docs/feature-parity/time-cursor-notes.md`.
