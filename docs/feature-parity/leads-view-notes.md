# Leads View Notes

Status: task `0039` parity notes for the modern Leads pane.

## Supported In Current Viewer

- Lead-system selector populated from parsed case metadata.
- Coupling selector for baseline, AC, and DC modes.
- Amplitude scale control for plotted traces.
- Grid visibility toggle.
- RMS trace overlay computed from currently plotted traces.
- Plot metadata shows selected lead-system counts, plotted trace count, sample count, sample rate, coupling mode, and scale.
- Measured, initial, and adapted signal overlays are visible but disabled when the current fixture lacks signal classification.

## Current Limitations

- The browser fixture still contains representative thorax-node surface-potential traces, not full real lead-system matrices.
- Switching lead systems updates metadata and plot labeling, but does not yet remap plotted values to each system's real leads.
- Measured, initial, adapted, and selected-heart-node electrogram overlays require parsed signal classification and matrix mapping.
- Beat zoom, interval selection, shared time cursor, VCG loop rendering, and clipboard export remain future parity work.
- Baseline correction remains approximate until P-wave and T-wave fiducial samples are parsed.
