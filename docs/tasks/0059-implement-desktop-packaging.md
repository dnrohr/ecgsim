# 0059 Implement Desktop Packaging

## Objective

Package the modern app for desktop use.

## Minimal Context

Legacy ECGSIM shipped Windows and Mac packages. The modern app should package only after real case loading, editing, recomputation, and export are useful.

## Inputs

- `docs/packaging.md`
- Completed parity workflows.
- Current app architecture.

## Deliverables

- Choose desktop wrapper.
- Add build scripts and packaging config.
- Document platform prerequisites and signing/notarization steps.

## Verification

- Build succeeds locally for at least the current OS.
- Packaged app opens a real case and runs golden workflow smoke tests.

## Done When

There is a repeatable desktop packaging path.
