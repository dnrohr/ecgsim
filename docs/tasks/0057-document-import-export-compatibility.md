# 0057 Document Import Export Compatibility

## Objective

Document which import/export workflows are compatible with legacy ECGSIM and external tools.

## Minimal Context

By this point modern ECGSIM should have real import/export behavior. Users need clear compatibility promises.

## Inputs

- Tasks `0054` through `0056`.
- `docs/file-formats/export-formats.md`
- `docs/user-guide.md`

## Deliverables

- Add or update user-facing import/export compatibility docs.
- Include examples and known limitations.
- Link compatibility docs from README/user guide.

## Verification

- Docs match implemented commands/UI.
- Unsupported workflows are explicitly listed.

## Done When

Users know which files can move between legacy ECGSIM, modern ECGSIM, MATLAB, and other tools.

## Progress

Completed by adding `docs/import-export-compatibility.md`.

- Documented case input, metadata inspection, legacy readers, export-directory output, source-edit sidecars, visual PNG/clipboard capture, MATLAB/readECGsim compatibility, and unsupported workflows.
- Added examples for `ecgsim.cli.case_info` and `ecgsim.cli.export_case`.
- Linked the compatibility guide from `README.md` and `docs/user-guide.md`.
- Kept raw legacy `File -> Export`, `.ECGsimcase` write-back, `.ECGsimsource`, ECG import, `.elec`, transfer matrices, TMP `.user.source`, adapted ECG recomputation, and movie export explicitly unsupported.
