# 0067 Implement Initial Adapted And Sensitivity BSPM Modes

## Objective

Complete Thorax BSPM modes for initial, adapted, and sensitivity-map workflows.

## Minimal Context

Measured and adapted candidate maps exist, but the legacy Thorax workspace includes initial/adapted BSPM and sensitivity-like workflows that are not fully represented.

## Inputs

- `app/viewer/src/main.js`
- `app/viewer/public/fixtures/ecg-signals.json`
- `ecgsim/core/transfer.py`
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Add initial and adapted BSPM mode handling where data is available.
- Add sensitivity map data/model if supported by transfer matrices.
- Label unavailable modes honestly when data is missing.

## Verification

- Browser/app test switches Thorax modes and confirms map values, labels, and legends update.
- Unit tests cover sensitivity computation or explicit unavailable status.

## Done When

Thorax mode controls no longer imply unsupported maps are implemented, and supported maps update from real data.

## Completion Note

Completed by enabling Thorax Initial BSPM, Adapted BSPM, and Sensitivity modes when the bundle has a ventricles-to-thorax transfer matrix matching TMP source nodes. Initial/adapted BSPM samples are recomputed from TMP source parameters; sensitivity maps display the selected heart/source node transfer column. The UI labels preview-level assumptions honestly, and smoke/browser tests cover recompute dimensions, selector availability, status labels, canvas changes, and scale behavior.
