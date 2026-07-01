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
