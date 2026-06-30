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
