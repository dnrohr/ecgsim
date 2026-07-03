# Leads View Notes

Status: task `0039` parity notes for the modern Leads pane.

## Supported In Current Viewer

- Lead-system selector populated from parsed case metadata and electrode positions.
- Switching lead systems redraws parsed lead traces composed from measured thorax potentials, parsed lead definitions, and parsed reference definitions where available.
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
- Viewer fixture metadata now includes parsed lead definitions, reference definitions, and show-lead display definitions.
- The Leads pane now renders parsed lead-definition traces instead of raw electrode rows when direct electrode indices are available.

## Current Limitations

- Exact standard 12-lead, Frank VCG, BSPM, and minimap lead transforms remain unsupported until lead polarity/reference-weight equations are interpreted from raw fields.
- Current lead-system plots use parsed electrode/reference indices, but final clinical transform parity still needs reference-weight and polarity validation.
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

This narrows the overlay blocker but does not resolve final reference-weight semantics. Standard 12-lead and BSPM transforms must come from decoded `PLead`/`PLeadReference` fields or another evidence source, not from the empty `PMatrix` slots.

## Lead Object Evidence

Task `0107` adds `research/lead-object-inventory.json`. The case payloads now decode as:

- `PLead`: version, embedded lead label, and trailing int32 fields;
- `PLeadReference`: version, embedded reference label, and trailing int32 fields;
- `PShowLead`: version, embedded display label, trailing int32 fields, and layout-like float values.

The standard 12-lead system exposes labels `I`, `II`, `III`, `V1` through `V6`, `aVr`, `aVl`, and `aVf`, plus references `Zeromean`, `extremities`, `vr`, and `vl`. This is enough to preserve labels and reference objects, but not enough to assign final polarity/reference-weight equations without matching the trailing fields to legacy transforms.

Task `0108` promotes these embedded labels into the high-level lead-system parser. The first standard lead now surfaces as `I` rather than fallback `lead1`.

Task `0109` promotes the stable trailing-field layer into structured parser output:

- `PLead` fields become signal-electrode index, reference index, and extra fields.
- `PLeadReference` fields become member electrode indices and extra fields.
- `PShowLead` fields become primary/secondary lead indices, display group, grid position, and extra fields.

The remaining blocker is no longer raw index/layout access; it is the final weighting/polarity equation needed to claim clinical lead-transform parity.

Task `0110` uses the parsed definitions in the browser Leads pane. `standard_12` now plots 12 lead-labeled traces, BSPM systems plot their parsed lead labels, and Frank VCG keeps only directly backed traces where definitions expose electrode indices.
