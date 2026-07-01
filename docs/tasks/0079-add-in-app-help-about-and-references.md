# 0079 Add In App Help About And References

## Objective

Add an in-app Help/About/References view with project status and source attribution.

## Minimal Context

Docs and static package metadata exist, but users do not yet have an in-app place to see references, known limitations, validation status, and source links.

## Inputs

- `docs/project-brief.md`
- `research/website-notes.md`
- `docs/feature-parity/golden-workflows.md`
- `app/viewer/src/`

## Deliverables

- Add Help/About UI reachable from the app shell.
- Include version/build info, scientific references, data-source attribution, and known limitations.
- Link to bundled case/source information without requiring users to read repo docs.

## Verification

- Browser/app test opens the Help/About view and verifies core reference/status content.
- Static package validation still passes.

## Done When

Users can inspect what the app is, what data it uses, and what limitations remain from inside the app.
