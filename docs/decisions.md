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
