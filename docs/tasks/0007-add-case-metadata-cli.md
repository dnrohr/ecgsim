# 0007 Add Case Metadata CLI

## Objective

Add a command that prints useful metadata for a legacy `.ECGsimcase`.

## Minimal Context

This is the M1 exit path: a command should load at least `normal_male2.ECGsimcase` and print model/signal metadata or, if full metadata is not yet available, the best documented container inventory.

## Inputs

- Parser package from tasks 0003-0006.
- `research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase`

## Deliverables

- Add a CLI command or script under the chosen project structure.
- Document command usage.
- Add a smoke test or golden-output test with stable fields.

## Verification

- Command runs against `normal_male2.ECGsimcase`.
- Output includes case name/path, size, detected format, and parsed section summary.
- Test command passes.

## Done When

A developer can run one command to inspect a case and use the result to guide parser work.
