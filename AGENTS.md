# Agent Guide

This project is a modernized rebuild of ECGSIM, an educational/research tool for studying how cardiac electrical activity produces ECG and body-surface potential maps.

## Start Here

Read these files before starting a task:

1. `docs/project-brief.md`
2. `docs/roadmap.md`
3. `docs/tasks/README.md`
4. The task-specific document under `docs/tasks/` or `research/website-notes.md` only if needed.

Avoid rereading the full archived website unless the task needs source detail. Use `research/extracted-text/` for quick search and `research/source/` for originals.

When no task is specified, start from the lowest unfinished task in `docs/tasks/README.md`.

## Current Phase

Data collection and foundation design. Prefer work that improves understanding, compatibility, parsing, tests, and reproducibility over polished UI.

## Important Local Files

- `ECGsim-3.0.1/`: local Windows app reference. It is ignored by Git.
- `research/source/`: downloaded ECGSIM website files, papers, cases, images, scripts, and legacy data.
- `research/extracted-text/`: searchable text from archived HTML/PHP pages.
- `research/download_manifest.csv`: download audit trail.
- `research/source_checksums.csv`: checksum inventory.

## Development Priorities

1. Preserve compatibility with existing ECGSIM cases and exported data.
2. Build data readers and tests before large UI work.
3. Use the legacy Windows app as a behavioral oracle when needed.
4. Document every file-format or numerical assumption.
5. Keep repo changes small, inspectable, and tied to a milestone.

## Git Hygiene

Do not commit app binaries, installers, or generated local app output. The existing `.gitignore` excludes the local Windows app and installer/archive patterns.

If creating fixtures from large case files, prefer small derived fixtures and document how they were produced.
