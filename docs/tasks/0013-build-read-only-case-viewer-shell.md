# 0013 Build Read-Only Case Viewer Shell

## Objective

Combine parser and prototype views into a minimal read-only case viewer.

## Minimal Context

The old ECGSIM app uses four core panes: heart, thorax, TMP, and leads. This task should integrate those concepts without editing or recomputation.

## Inputs

- Tasks 0007 and 0009-0012.
- `docs/project-brief.md`

## Deliverables

- Open a case file.
- Show heart geometry, thorax geometry, ECG plot, and TMP plot in one app shell.
- Display parser metadata and unsupported-data notices.

## Verification

- Viewer opens at least `normal_male2.ECGsimcase`.
- All four conceptual views render or show an explicit not-yet-supported state.
- App command and tests pass.

## Done When

The first read-only compatibility viewer milestone is demonstrable.
