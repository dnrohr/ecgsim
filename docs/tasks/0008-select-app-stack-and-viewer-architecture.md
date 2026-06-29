# 0008 Select App Stack And Viewer Architecture

## Objective

Choose the initial read-only viewer stack and document how it will connect to parser data.

## Minimal Context

The first product target is a read-only compatibility viewer with heart, thorax, TMP, and leads views. The UI stack should be chosen after parser basics are understood.

## Inputs

- `docs/project-brief.md`
- `docs/architecture.md`
- Parser package from M1.

## Deliverables

- Record the UI stack decision in `docs/decisions.md`.
- Update `docs/architecture.md` with viewer data flow.
- Scaffold only the minimum app structure needed for prototypes.

## Verification

- Any scaffolded app command runs.
- Decision includes packaging, 3D rendering, plotting, and test implications.

## Done When

The next geometry rendering task has a clear app/runtime target.
