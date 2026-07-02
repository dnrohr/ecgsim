# Visualization Feature Parity Roadmap

Status: active.

## Goal

Achieve visualization feature parity with legacy ECGSIM: every legacy visual mode and interaction should have a discoverable modern equivalent, be backed by the correct parsed or computed data, and be covered by automated workflow or visual-smoke tests. Pixel-perfect layout, fonts, colors, and window chrome are explicitly out of scope.

## Definition Of Done

The goal is complete only when:

- Every legacy visual mode in `docs/feature-parity/inventory.md` has a row in `docs/feature-parity/visualization-matrix.md`.
- Each row is marked `supported`, `parity-tested`, `modern-equivalent`, `deferred-with-reason`, or `blocked-on-evidence`.
- Every supported visual mode has automated evidence that the view is discoverable, nonblank, mode-labeled, data-backed, and changes when its primary controls change.
- Modes that depend on unparsed legacy data identify the missing payload, capture, or equation.
- The default app view shows the core Heart, Thorax, TMP, and Leads visualizations without making users scroll past metadata.

## Workstreams

### VF0: Visual Inventory And Evidence

Goal: make the parity target explicit and testable.

Tasks:

- `0083` Create Visualization Feature Parity Matrix.
- `0084` Add Visual Mode Test Coverage Map.

### VF1: Visual-First Workspace

Goal: make current implemented visualizations immediately visible and discoverable.

Tasks:

- `0085` Make Core Visual Workspace Prominent.
- `0086` Add Pane Mode Badges And Data Provenance Labels.
- `0087` Add Visual Mode Navigator.

### VF2: Heart View Completeness

Goal: cover all meaningful legacy Heart visual modes.

Tasks:

- `0088` Add Heart Node Overlay And Selection Rings.
- `0089` Add Heart Cross-Section Plane Prototype.
- `0090` Add Heart Electrode And Vector Overlays.
- `0091` Expand Heart Surface Mode Tests Across Initial Adapted And Time.

### VF3: Thorax View Completeness

Goal: cover legacy Thorax geometry, BSPM, sensitivity, electrodes, and linked modes.

Tasks:

- `0092` Add Thorax Heart Context Overlay.
- `0093` Add Thorax Line-Only Isofunction Mode.
- `0094` Add Thorax Lock-To-Heart Orientation.
- `0095` Expand Thorax Probe And Electrode Target Workflows.

### VF4: TMP And ECG View Completeness

Goal: make waveform visual modes and linked interactions match legacy capabilities with modern controls where needed.

Tasks:

- `0096` Add TMP Handler-Style Visual Controls.
- `0097` Add Leads Interval Selection And TMP Highlight.
- `0098` Add Beat Zoom Workflow.
- `0099` Add VCG Visualization Mode.
- `0100` Add Electrogram Visualization Or Evidence Blocker.

### VF5: Validation And Reference Capture

Goal: strengthen visual evidence without requiring pixel parity.

Tasks:

- `0101` Add Per-Mode Canvas Smoke Tests.
- `0102` Capture Curated Legacy Pane References.
- `0103` Add Visual Parity Completion Audit.

## Current First Priority

Start with `0083` and `0085`. The current app mounts visual canvases, but the default viewport allows metadata and controls to dominate the first screen. A user can reasonably conclude the heart is missing even though the renderer is active.
