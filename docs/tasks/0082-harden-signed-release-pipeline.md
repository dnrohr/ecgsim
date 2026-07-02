# 0082 Harden Signed Release Pipeline

## Objective

Prepare reliable web and desktop release artifacts with clear validation evidence.

## Minimal Context

Packaging and release validation exist, but signed/notarized delivery and packaged-build workflow coverage remain incomplete.

## Inputs

- `docs/feature-parity-roadmap.md`
- `docs/user-guide.md`
- Existing package/release scripts
- CI or local release validation logs

## Deliverables

- Define release channels and signing/notarization requirements.
- Exercise representative workflows against packaged builds.
- Document manual steps that cannot be automated yet.

## Verification

- Release validation command produces an auditable report.
- Packaged artifact opens and passes smoke workflows on the supported target platform.

## Done When

Release artifacts are trustworthy enough for external testers or collaborators.

## Completion Notes

Status: complete.

- Added environment/build metadata to `tools/run_release_validation.py` summaries, including platform, Python, Node, npm, Git branch, Git commit, and dirty-worktree status.
- Added a `visual-regression` release-validation step that compares the packaged screenshot against the captured legacy baseline with the loose smoke harness.
- Documented `internal-dev`, `external-preview`, and future `desktop-signed` release channels in `docs/release-validation.md`.
- Documented signing/notarization requirements and manual release steps that remain outside automation.
