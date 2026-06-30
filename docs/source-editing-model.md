# Source Editing Model

Status: design for tasks `0018` and `0019`. This document defines state semantics before UI selection and TMP editing are implemented.

## Goals

- Preserve initial and adapted source-parameter values separately.
- Support atrial and ventricular sources, and multiple beats when present.
- Represent node, radius, and region edits without tying core state to a specific UI.
- Make undo, parameter reset, and beat reset deterministic.
- Keep the model usable from a web app, desktop wrapper, or command-line tool.

## Source Scope

Every editable value belongs to a source scope:

```text
case -> source kind -> beat -> node -> parameter -> value
```

Fields:

- `sourceKind`: `atria` or `ventricles`.
- `beatId`: stable beat identifier such as `beat1`.
- `nodeIndex`: zero-based source-node index in the parsed source geometry/vector.
- `parameter`: one editable source parameter.
- `initial`: immutable baseline value loaded from the case/export.
- `adapted`: current user-adapted value.

The current parsed ventricular fixture has `576` source nodes and paired initial/adapted `PVector` payloads for stored parameters. Future object-graph parsing should fill the same model instead of exposing raw offsets to the app.

## Parameters

Core parameter identifiers:

| Identifier | Meaning | Units |
| --- | --- | --- |
| `depolarizationMs` | time of fastest TMP upstroke | ms |
| `repolarizationMs` | time of maximum down-slope during repolarization | ms |
| `restingPotential` | minimum TMP value at rest | mV |
| `amplitude` | TMP upstroke amplitude | mV |
| `plateauSlope` | phase-2/plateau slope | unknown legacy slope unit |
| `repolarizationSlope` | phase-3/repolarization slope | unknown legacy slope unit |

Observed `.ECGsimcase` payloads also include `depolarizationSlope`. Preserve it when loading and saving adapted vectors, but keep it out of the first editing UI until legacy behavior is confirmed.

Validation rules:

- `plateauSlope <= repolarizationSlope`.
- Parameter values must be finite numbers.
- Time parameters are milliseconds on the same time base as TMP generation.
- Unit-specific clinical/physiological bounds are unknown and should not be invented yet.

## Edit Representation

An edit is a transaction against adapted values:

```text
EditTransaction
  id
  sourceKind
  beatId
  selection
  changes[]
```

Each change records:

```text
nodeIndex
parameter
previousAdapted
nextAdapted
weight
```

The transaction stores concrete per-node changes, not only the gesture that produced them. This keeps undo/export deterministic even if region selection algorithms change later.

Selection metadata may include:

- `mode`: `singleNode`, `radius`, `explicitRegion`, or `transmuralPair`.
- `centerNodeIndex` when a node gesture creates the edit.
- `radiusMm` when a radius gesture creates the edit.
- `transition`: optional transition-zone description.
- `nodeWeights`: explicit node/weight list used to compute the transaction.

## Selection And Regions

The heart manual describes a selected node, an editable radius, 10 mm contour spacing, transition zones, endocardial/epicardial switching, transmural handling, and accumulation modes.

Implementation guidance:

- Task `0018` should compute selections as node sets with weights.
- The selected center/radius is interaction state; the resulting `nodeWeights` are edit input.
- Transmural edits should explicitly include the paired node IDs if pairing data is known. Until then, mark transmural mode unavailable rather than guessing.
- A selected region can span many nodes, but applying a parameter change still produces individual per-node adapted values.

## Accumulation Modes

Represent legacy accumulation behavior as edit policies:

| Policy | Behavior |
| --- | --- |
| `replaceWithPreviousAdapted` | New selection becomes active and receives the previously adapted settings. |
| `resetPreviousThenApply` | Previous selection resets to initial values before applying the new edit. |
| `expandRegion` | New selection is added to the active region; later edits affect the combined region. |
| `separateRegions` | New selection starts or updates an independent region without resetting prior regions. |

The exact legacy transition-zone math is unknown. Store the concrete node weights used by the modern implementation so the result can be tested even before legacy parity is exact.

## Undo And Reset

Undo:

- Use a per-case undo stack of `EditTransaction` records.
- Undo restores each `previousAdapted` value in reverse transaction order.
- Redo can replay `nextAdapted` values if implemented.

Current web-viewer status: ventricular TMP edits, selected-parameter reset, beat reset, undo, redo, local sidecar persistence, and portable `.source-edits.json` import/export use this transaction shape. `.ECGsimcase` write-back is deferred.

Reset selected parameter:

- Double-clicking a TMP handler resets that parameter for the active selection by creating a normal transaction with `nextAdapted = initial`.

Reset beat:

- Resetting a beat creates one transaction that sets every adapted parameter in the active `sourceKind` and `beatId` back to initial.
- Other beats and the other source kind are unchanged.

Case reload:

- Loading a new case clears selection, undo/redo stacks, and any unsaved edit transactions.

## Unknowns

- Whether all cases store atrial and ventricular sources with the same parameter set.
- How multiple beats beyond `beat1` are represented inside `.ECGsimcase`.
- Exact transition-zone weighting used by the legacy app.
- Endocardial/epicardial pairing and transmural node mapping.
- Whether `depolarizationSlope` is user-editable in ECGSIM 3.0.1 or only stored.
- Export/write-back format for adapted source values.
