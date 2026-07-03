# 0107 Inventory Lead Reference Payloads

Status: complete.

## Goal

Decode the stable envelope for `PLead`, `PLeadReference`, and `PShowLead` objects so Leads-view parity work can reason about labels, references, and display ordering from repeatable case evidence.

## Scope

- Add `read_ecgsimcase_lead_object_inventory()`.
- Decode each lead object as marker, version, embedded UTF-16 label, and trailing numeric fields.
- Preserve trailing fields as raw int32 and float32 views without assigning unproven polarity/reference semantics.
- Generate `research/lead-object-inventory.json` for all archived cases.
- Add regression tests for standard 12-lead labels, references, show-lead labels, and WPW BSM object counts.

## Findings

- One-character labels such as `I` are embedded inside lead objects and were missed by the older broad UTF-16 string scan.
- Standard 12 `PLead` labels decode as `I`, `II`, `III`, `V1` through `V6`, `aVr`, `aVl`, and `aVf`.
- Standard 12 references decode as `Zeromean`, `extremities`, `vr`, and `vl`.
- `PShowLead` objects preserve displayed lead labels and layout-like float fields.
- WPW Amsterdam BSM contains 65 `PLead` and 65 `PShowLead` objects.

## Out Of Scope

- Interpreting the trailing fields as final WCT, polarity, or clinical lead-transform equations.
- Enabling measured/initial standard 12-lead overlays from these raw fields.
- Claiming Frank VCG/minimap transform parity beyond previously documented preview behavior.

## Verification

- `python -m unittest tests.test_ecgsimcase`
- `python tools/inspect_lead_objects.py research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase --output research/lead-object-inventory.json`
