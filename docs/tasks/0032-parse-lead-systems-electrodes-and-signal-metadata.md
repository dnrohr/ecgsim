# 0032 Parse Lead Systems Electrodes And Signal Metadata

## Objective

Parse lead systems, electrodes, signal metadata, and timing/fiducial fields from `.ECGsimcase`.

## Minimal Context

The viewer currently shows representative thorax-node traces, not real standard 12-lead/VCG/BSPM lead systems.

## Inputs

- `docs/file-formats/ecgsimcase.md`
- `docs/file-formats/export-formats.md`
- `docs/simulation.md`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`

## Deliverables

- Add parser output for lead-system names, lead definitions, electrode locations, and signal matrices where possible.
- Document fiducial/time-base fields if found.
- Add tests for lead-system inventory in supported cases.

## Verification

- Parsed lead-system names match current metadata for normal and WPW cases.
- Any unsupported lead payload fields are explicitly represented.

## Done When

The app can choose real case lead systems instead of hard-coded representative traces.

## Result

Added lead-system and signal metadata parser output. The parser now exposes lead-system names, electrode coordinate triplets, nested lead/reference/shown-lead labels where available, matrix offsets, and explicit unsupported fields for lead polarity, shown-lead layout, fiducials, and signal classification. Viewer fixtures now include parsed lead-system details and signal metadata.
