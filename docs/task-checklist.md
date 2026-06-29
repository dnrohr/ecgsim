# Task Checklist

Use this checklist at the start and end of development tasks.

## Before Starting

- Identify the roadmap milestone.
- Read only the minimum relevant docs.
- Search `research/extracted-text/` before manually browsing archived HTML.
- Check `git status --short`.
- Confirm whether the task touches research data, parser behavior, simulation math, or UI.

## During Work

- Keep changes small and tied to the task.
- Add or update tests for parser, math, or compatibility behavior.
- Record assumptions in `docs/decisions.md` when they affect formats, units, algorithms, or legacy parity.
- Avoid committing app binaries, installers, or large generated artifacts.

## Before Finishing

- Run the relevant tests or explain why they are not available.
- Update docs if behavior, formats, or process changed.
- Check `git status --short`.
- Summarize what changed and any remaining risk.
