# 0050 Implement Activation And Focus Construction

## Objective

Implement activation/focus construction workflows needed for legacy parity.

## Minimal Context

Activation construction payloads are currently detected but not parsed or simulated.

## Inputs

- Parsed activation data from task `0031`.
- `docs/simulation.md`
- CINC 2011 paper archive.
- Legacy focus manual pages.

## Deliverables

- Parse and model activation/focus construction data.
- Implement fastest-route activation where enough data exists.
- Add UI or model hooks for focus workflows.

## Verification

- Tests compare activation timing to parsed or legacy reference values.
- Unknown fields are documented.

## Done When

Activation and focus behavior is no longer a black box for supported cases.
