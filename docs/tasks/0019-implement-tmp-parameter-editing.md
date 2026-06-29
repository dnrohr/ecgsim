# 0019 Implement TMP Parameter Editing

## Objective

Implement basic TMP source parameter editing for selected nodes/regions.

## Minimal Context

This task changes data but does not need full ECG recomputation yet. It should make initial/adapted differences visible in TMP plots.

## Inputs

- Source editing model from task 0017.
- Selection from task 0018.
- TMP plotting from task 0012.

## Deliverables

- Edit depolarization time, repolarization time, resting potential, amplitude, and slope parameters as supported by loaded data.
- Reset selected parameter or beat where supported.
- Update TMP display after edits.

## Verification

- Tests cover data changes and reset behavior.
- UI/prototype shows initial versus adapted values.
- Unsupported parameters are explicitly disabled or labeled.

## Done When

A simple source edit updates adapted TMP data predictably without recomputation.
