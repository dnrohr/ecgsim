# Leads View Notes

Status: task `0039` parity notes for the modern Leads pane.

## Supported In Current Viewer

- Lead-system selector populated from parsed case metadata and electrode positions.
- Switching lead systems redraws electrode surface-potential traces sampled from the measured thorax map at each system's nearest thorax nodes.
- Coupling selector for baseline, AC, and DC modes.
- Amplitude scale control for plotted traces.
- Grid visibility toggle.
- Shared interval highlight controls that draw the selected interval on Leads and TMP plots.
- Beat zoom controls that focus Leads and TMP on the selected interval or parsed fiducial window, with an all-beats reset.
- Frank VCG loop preview with horizontal, frontal, and sagittal projections from parsed Frank traces.
- RMS trace overlay computed from currently plotted traces.
- Plot metadata shows selected lead-system counts, plotted trace count, sample count, sample rate, coupling mode, and scale.
- Coupling status reports AC/DC behavior or whether baseline mode uses parsed fiducials versus signal-end fallback.
- Measured, initial, and adapted signal overlays are visible but disabled when the current fixture lacks signal classification.
- `read_ecgsimcase_matrix_inventory()` records root signal, thorax-by-source transfer, and lead-system matrix role hints for archived cases.
- `read_ecgsimcase_lead_object_inventory()` records `PLead`, `PLeadReference`, and `PShowLead` labels with raw trailing fields.
- `read_ecgsimcase_lead_systems()` now uses embedded lead-object labels instead of fallback names.

## Current Limitations

- Exact standard 12-lead, Frank VCG, BSPM, and minimap lead transforms remain unsupported until lead polarity/reference semantics are interpreted from raw fields.
- Current lead-system plots are electrode surface-potential traces, not transformed clinical lead signals.
- Current VCG loop is a projection preview from parsed Frank traces, not a verified legacy Frank transform.
- Measured and initial overlays require parsed signal classification; selected-heart-node electrogram remains blocked until an electrogram payload or derivation equation is identified.
- Clipboard export remains future parity work.
- Multi-beat atrial/ventricular beat inventory is not yet parsed; current zoom uses interval or fiducial sample windows.
- `normal_male2` uses derived baseline samples `(5, 499)` from promoted legacy export evidence. Bundled cases without matching evidence use signal-end fallback until P-wave and T-wave fiducial samples are parsed or derived.

## PMatrix Evidence

Task `0106` adds `research/pmatrix-inventory.json`. The archived cases show:

- matrix 1 is the root thorax-node surface-potential time series;
- matrix 21 is the thorax-by-source transfer candidate used by recomputation previews;
- standard 12-lead and BSPM lead-system matrix slots are empty placeholders;
- VCG and minimap lead-system matrix slots parse as `3x7` and `3x9` transform candidates.

This narrows the overlay blocker but does not resolve WCT/reference semantics. Standard 12-lead and BSPM transforms must come from decoded `PLead`/`PLeadReference` fields or another evidence source, not from the empty `PMatrix` slots.

## Lead Object Evidence

Task `0107` adds `research/lead-object-inventory.json`. The case payloads now decode as:

- `PLead`: version, embedded lead label, and trailing int32 fields;
- `PLeadReference`: version, embedded reference label, and trailing int32 fields;
- `PShowLead`: version, embedded display label, trailing int32 fields, and layout-like float values.

The standard 12-lead system exposes labels `I`, `II`, `III`, `V1` through `V6`, `aVr`, `aVl`, and `aVf`, plus references `Zeromean`, `extremities`, `vr`, and `vl`. This is enough to preserve labels and reference objects, but not enough to assign final polarity/WCT equations without matching the trailing fields to legacy transforms.

Task `0108` promotes these embedded labels into the high-level lead-system parser. The first standard lead now surfaces as `I` rather than fallback `lead1`.
