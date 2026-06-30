# 0026 Inventory Legacy UI And Workflows

## Objective

Create a feature inventory of the legacy ECGSIM app views, menus, dialogs, controls, and workflows.

## Minimal Context

The current web app is a prototype. Feature parity needs a factual inventory before implementation tasks can be prioritized.

## Inputs

- Legacy Windows app in ignored `ECGsim-3.0.1/`.
- `research/source/www.ecgsim.org/manual/`.
- `research/extracted-text/www.ecgsim.org/manual/`.
- `research/legacy-exports/screenshots/normal-male-main-window.png`.

## Deliverables

- Add `docs/feature-parity/inventory.md`.
- Cover Heart, Thorax, TMP, Leads/ECG, File, Options, Help, and export workflows.
- Mark evidence source for each item: app observation, manual page, screenshot, or export.

## Verification

- Inventory references at least one source for each major legacy view.
- Unknown behavior is marked, not guessed.

## Done When

An agent can see what feature parity includes without opening the legacy app first.
