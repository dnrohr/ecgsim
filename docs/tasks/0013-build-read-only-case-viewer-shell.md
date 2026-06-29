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

Task result:

- Viewer loads bundled read-only fixtures for `normal_male2.ECGsimcase`.
- Added a case-open control. In-browser parsing is not implemented yet; matching `normal_male2.ECGsimcase` confirms the bundled fixture metadata, and other selected files keep the bundled fixture views with an explicit notice.
- The shell displays case size, lead systems, marker counts, and unsupported payload notices from the parser metadata fixture.
- Heart, thorax, TMP, and leads panes render together in the same shell.

## Done When

The first read-only compatibility viewer milestone is demonstrable.
