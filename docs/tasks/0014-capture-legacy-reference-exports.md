# 0014 Capture Legacy Reference Exports

## Objective

Use the original Windows app to produce reference exports and screenshots for parity testing.

## Minimal Context

The local `ECGsim-3.0.1/` app is ignored by Git and can be used as a behavioral oracle. Do not commit the app itself.

## Inputs

- Local `ECGsim-3.0.1/`
- Downloaded `.ECGsimcase` files.
- Existing read-only viewer/parser behavior.

## Deliverables

- Create a documented reference-export workflow.
- Store only useful, appropriately sized reference outputs or checksums.
- Capture baseline screenshots if feasible and useful.

## Verification

- Reference outputs can be reproduced from documented steps.
- Large/generated artifacts are either justified or ignored.
- Git status confirms the app binary remains ignored.

## Done When

The project has a known baseline from the legacy app for at least one case.
