# 0071 Implement ARI And TMP At Time Heart Surfaces

## Objective

Add remaining high-value Heart surface functions: ARI and TMP-at-time.

## Minimal Context

Heart already supports several parameter surface functions. ARI and TMP-at-time remain incomplete in the golden workflows.

## Inputs

- `app/viewer/src/main.js`
- TMP parameter vectors and generated waveforms
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Compute and display ARI from activation/repolarization data with documented units.
- Display TMP-at-time surface values synchronized to the global time cursor.
- Update legends and unavailable statuses.

## Verification

- Unit tests cover ARI/TMP-at-time data transforms.
- Browser/app test verifies time cursor changes TMP-at-time coloring and ARI mode renders nonblank.

## Done When

Heart surface mode coverage includes geometry, timing parameters, ARI, and TMP-at-time behavior.

## Completion Notes

Status: complete.

- Added ARI Heart surface values as `repolarizationMs - depolarizationMs`, reported in milliseconds.
- Added TMP-at-time Heart surface values generated from the current TMP edit state and synchronized with the shared time cursor.
- Added unit-level viewer smoke coverage for ARI/TMP-at-time transforms and browser workflow coverage for ARI rendering plus TMP-at-time recoloring on time changes.
- Updated Heart/time/parity/user documentation to keep legacy colormap parity and mapping limits explicit.
