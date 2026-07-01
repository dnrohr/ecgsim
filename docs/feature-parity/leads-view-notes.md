# Leads View Notes

Status: task `0039` parity notes for the modern Leads pane.

## Supported In Current Viewer

- Lead-system selector populated from parsed case metadata and electrode positions.
- Switching lead systems redraws electrode surface-potential traces sampled from the measured thorax map at each system's nearest thorax nodes.
- Coupling selector for baseline, AC, and DC modes.
- Amplitude scale control for plotted traces.
- Grid visibility toggle.
- RMS trace overlay computed from currently plotted traces.
- Plot metadata shows selected lead-system counts, plotted trace count, sample count, sample rate, coupling mode, and scale.
- Coupling status reports AC/DC behavior or whether baseline mode uses parsed fiducials versus signal-end fallback.
- Measured, initial, and adapted signal overlays are visible but disabled when the current fixture lacks signal classification.

## Current Limitations

- Exact standard 12-lead, Frank VCG, BSPM, and minimap lead transforms remain unsupported until lead polarity/reference semantics are parsed.
- Current lead-system plots are electrode surface-potential traces, not transformed clinical lead signals.
- Measured, initial, adapted, and selected-heart-node electrogram overlays require parsed signal classification and matrix mapping.
- Beat zoom, interval selection, shared time cursor, VCG loop rendering, and clipboard export remain future parity work.
- `normal_male2` uses derived baseline samples `(5, 499)` from promoted legacy export evidence. Bundled cases without matching evidence use signal-end fallback until P-wave and T-wave fiducial samples are parsed or derived.
