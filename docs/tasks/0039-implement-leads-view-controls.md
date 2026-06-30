# 0039 Implement Leads View Controls

## Objective

Implement legacy ECG/Leads view controls.

## Minimal Context

Current Leads view plots six representative node traces and a coupling selector.

## Inputs

- `docs/feature-parity/inventory.md`
- `research/extracted-text/www.ecgsim.org/manual/leads.txt`
- Parsed lead-system data from task `0032`.

## Deliverables

- Plot real selected lead-system traces.
- Add measured/initial/adapted signal visibility controls when data exists.
- Add RMS/statistics entry points if supported by parsed data.

## Verification

- App tests verify lead-system trace count and control changes.
- Numerical tests compare plotted values to parsed matrices.

## Done When

Leads view represents actual legacy lead-system data for supported cases.
