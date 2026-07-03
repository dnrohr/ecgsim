# 0112 Add Initial Lead Recompute Overlay

Status: complete.

## Goal

Expose the legacy Leads initial/adapted visual comparison with data-backed modern recompute traces, while keeping arbitrary case-payload measured-signal classification and final clinical lead-transform parity explicitly blocked.

## Context

The legacy Leads pane can superpose measured, initial simulated, and adapted simulated signals. The modern viewer already recomputed adapted lead traces from TMP source parameters, the ventricles-to-thorax transfer candidate, and parsed lead definitions. The same recompute path can generate initial traces from the stored initial TMP vectors.

## Changes

- Enabled the Leads `Initial` checkbox when transfer/TMP prerequisites are available.
- Added initial and adapted recompute series as overlaid traces in the same lead lanes.
- Preserved baseline/AC/DC filtering across all overlaid series.
- Kept `Measured` disabled during this task because measured-signal classification was not decoded from case payloads. Task `0114` later enabled measured traces for matching promoted normal-male `.refECG` exports only.
- Updated workflow and smoke tests for initial recompute, initial+adapted overlay redraws, and overlay filtering.

## Out Of Scope

- Claiming exact clinical 12-lead, Frank, BSPM, or minimap transform parity.
- Enabling measured lead overlays.
- Decoding final polarity/reference-weight equations.

## Verification

- `npm --prefix app/viewer test`
- `npm --prefix app/viewer run test:app`
- `npm --prefix app/viewer run test:visual-modes`
- `python -m unittest discover -s tests`
- `python tools/audit_visual_parity.py docs/feature-parity/visualization-matrix.md`
