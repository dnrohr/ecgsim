# 0061 Update User Documentation For Feature Parity

## Objective

Update user documentation for a feature-parity release.

## Minimal Context

The current user guide documents a prototype. Feature parity will require real user workflows and compatibility notes.

## Inputs

- Completed feature-parity matrix.
- Import/export compatibility docs.
- Packaging docs.
- Golden workflows.

## Deliverables

- Rewrite `docs/user-guide.md` for the parity-capable app.
- Add tutorial workflows for normal and WPW cases.
- Document limitations, scientific assumptions, and validation status.

## Verification

- Every documented user workflow is tested manually or automatically.
- Docs do not describe unavailable features as supported.

## Done When

A new user can install/open/use/export from modern ECGSIM without reading internal project notes.

## Progress

Completed the current feature-parity user guide refresh.

- Rewrote `docs/user-guide.md` around install/run, static package use, supported browser cases, normal and WPW tutorials, Python CLI tools, import/export compatibility, scientific limits, validation status, and developer checks.
- Documented only currently available browser-open cases: `normal_male2.ECGsimcase` and `WPW_ectopicbeat.ECGsimcase`.
- Linked user workflows to implemented commands and controls without claiming unsupported recomputation, write-back, movie export, or raw legacy numerical parity.
- Included release validation and package validation commands.
