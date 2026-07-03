# 0104 Inventory PGraphGeometry Payloads For Wall Mapping

Status: complete.

## Goal

Capture conservative parser evidence for `PGraphGeometry` payloads so future wall-side and transmural mapping work can start from repeatable facts instead of ad hoc binary inspection.

## Scope

- Add a reader that inventories `PGraphGeometry` envelopes without assigning unverified wall-pair semantics.
- Record marker offsets, payload bounds, header words, candidate node counts, and nested matrix markers for archived cases.
- Add regression tests for the normal and WPW case patterns.
- Document what this evidence does and does not prove.

## Out Of Scope

- Enabling endocardial/epicardial switching.
- Deriving transmural edit expansion rules.
- Treating graph payload records as paired node IDs before their layout is decoded.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python tools/inspect_graph_geometry.py research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase --output research/pgraphgeometry-inventory.json`
