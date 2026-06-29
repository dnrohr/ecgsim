# Decisions

Record project decisions here when they affect compatibility, architecture, scientific behavior, file formats, units, or user workflows.

Use this format:

```text
## YYYY-MM-DD: Decision Title

Decision:

Context:

Consequences:
```

## 2026-06-29: Start With A Read-Only Compatibility Viewer

Decision:
The first product milestone after parsers should be a read-only viewer, not an editor or full simulator.

Context:
The largest early risks are unknown legacy file semantics, geometry interpretation, signal dimensions, units, and parity with the original ECGSIM app.

Consequences:
Parser and visualization work should be prioritized before editing workflows and recomputation.

## 2026-06-29: Use Python For Initial Parser Work

Decision:
Initial data-format and parser work will use Python with standard-library tests.

Context:
The first milestones are byte inspection, matrix/geometry readers, metadata reporting, and fixture-based tests. Python is already available in the workspace, has strong standard-library support for binary/text parsing, and lets us build repeatable inspection tools without choosing the final application UI stack. The existing `tools/inspect_ecgsimcase.py` script is already Python.

Consequences:
The repository now has a minimal Python package skeleton and a `python -m unittest discover -s tests` test command. This choice is reversible before UI work; a future app stack can call the parser package, port the parsers, or replace this layer if another runtime becomes clearly better.

## 2026-06-29: Use A Browser-Native Shell For The First Viewer

Decision:
The first read-only viewer prototypes will use a browser-native HTML/CSS/JavaScript shell with no frontend framework dependency. Python remains the parser/runtime layer for legacy data inspection.

Context:
The next tasks need a place to render heart geometry, thorax geometry, ECG traces, and TMP traces, but the project does not yet need application state management, packaging, or a full desktop shell. A browser-native scaffold keeps the viewer inspectable and runnable with the local Node runtime while avoiding early dependency churn.

Consequences:
The viewer scaffold lives under `app/viewer/` and can be smoke-tested with Node. Geometry rendering should use Three.js when task 0009 needs real 3D interaction. Signal plotting can start with Canvas or SVG and adopt a plotting library only if repeated workflows justify it. Packaging remains undecided; likely paths are a local web app during development and a desktop wrapper or hosted app later. Tests should prefer small smoke checks plus browser automation once rendering becomes visual.
