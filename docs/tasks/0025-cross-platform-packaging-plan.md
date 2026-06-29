# 0025 Cross-Platform Packaging Plan

## Objective

Define and begin cross-platform packaging for the modern app.

## Minimal Context

Legacy ECGSIM shipped Windows and Mac packages. The modern project should decide its supported distribution targets based on chosen runtime and app stack.

## Inputs

- App stack decision.
- Current build/test commands.
- `docs/project-brief.md`

## Deliverables

- Add `docs/packaging.md`.
- Document target platforms, build artifacts, signing/notarization needs if applicable, and release process.
- Add packaging scripts only if the app is ready enough.

## Verification

- Packaging plan matches actual app technology.
- Any added packaging command is tested locally where feasible.

## Done When

Release engineering has a documented path instead of being discovered at the end.
