# 0080 Implement Movie Export

## Objective

Export time-varying Heart, Thorax, TMP, or Leads views as a movie or frame sequence.

## Minimal Context

PNG export exists. The legacy manual confirms movie/playback behavior, but this project has not confirmed all legacy movie output details.

## Inputs

- `app/viewer/src/`
- Existing PNG export code
- `docs/legacy-reference-exports.md`
- `docs/feature-parity/golden-workflows.md`

## Deliverables

- Define supported movie/export formats for the web and desktop contexts.
- Implement the safest useful output path, such as WebM or numbered PNG frames.
- Preserve current view state, timing range, and relevant legends.

## Verification

- Browser/app test exports a short deterministic animation and verifies the artifact is nonempty.
- Documentation states format and browser limitations.

## Done When

Users can export dynamic ECGSIM views for teaching or review without screen recording.
