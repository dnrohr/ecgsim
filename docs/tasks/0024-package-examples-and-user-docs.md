# 0024 Package Examples And User Docs

## Objective

Create user-facing examples and minimal documentation for the modern app.

## Minimal Context

By this stage the app should have a usable read-only or editable workflow. Documentation should help users who have not read the old ECGSIM manual.

## Inputs

- Current app behavior.
- `docs/project-brief.md`
- Selected sample cases.

## Deliverables

- Add user guide or examples.
- Document supported and unsupported legacy features.
- Provide a simple first-run walkthrough.

## Result

- Added `docs/user-guide.md` with first-run setup, bundled fixture walkthrough, supported features, unsupported features, and developer checks.
- Linked the guide from `README.md`.
- Added local `downloads/` scratch output to `.gitignore`; curated source material remains under `research/`.

## Verification

- Walkthrough works from a clean checkout with documented setup.
- Unsupported features are not presented as available.

## Done When

A new user can load a sample case and understand the basic views.
