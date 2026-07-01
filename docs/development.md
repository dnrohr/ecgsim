# Development

## Runtime

Initial parser work uses Python. The package is intentionally small while file formats are still being mapped.

## Python Test Command

Run:

```powershell
python -m unittest discover -s tests
```

The Python suite covers parser/core behavior plus regression fixtures.

## Case Metadata Command

From the repository root, run:

```powershell
python -m ecgsim.cli.case_info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

If the package is installed, the equivalent console command is:

```powershell
ecgsim-case-info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase
```

## Viewer Smoke Command

Run:

```powershell
npm --prefix app/viewer test
```

This checks fixture metadata, browser module imports, and shared UI helper behavior without launching a browser.

## Viewer App Workflow Command

Run:

```powershell
npm --prefix app/viewer run test:app
```

This starts the viewer on a temporary local port and drives Chromium through the actual UI. It validates initial views, file-picker notices, heart selection, TMP edit/reset controls, thorax toggles, leads coupling modes, canvas rendering, console errors, and mobile layout. Set `CHROME_PATH` if Chrome or Edge is not installed in a standard location.

## Viewer Fixture Export

Run:

```powershell
python tools/export_viewer_fixtures.py
```

This regenerates `app/viewer/public/fixtures/heart.json` from archived legacy geometry.

Regression tests also compare tracked viewer fixtures and the legacy screenshot manifest against the tolerances in `docs/parity.md`. When regenerating fixtures, run the Python test command before committing.

## Legacy Parity Capture Handoff

The first normal male ECGSIM 3.0.1 raw export is captured under ignored `research/legacy-exports/raw/` and promoted into `tests/fixtures/legacy-parity/normal-male-ecgsim301/`. For any new capture, validate the raw export directory before promoting anything into tests:

```powershell
python tools/validate_legacy_capture.py research/legacy-exports/raw/<case-name>/export-directory --format markdown --require-task 0053 --output research/legacy-exports/<case-name>-0053-handoff.md
```

Promote only reviewed small artifacts needed by a parity task:

```powershell
python tools/promote_legacy_parity_fixtures.py research/legacy-exports/raw/<case-name>/export-directory tests/fixtures/legacy-parity/<case-name> --case-id <case-name>
```

Verify promoted fixture manifests before committing:

```powershell
python tools/promote_legacy_parity_fixtures.py --verify tests/fixtures/legacy-parity/<case-name>
```

Keep full raw export directories ignored. Tests should consume promoted fixtures and manifests, not files directly under `research/legacy-exports/raw/`.

## Viewer Dev Server

Run:

```powershell
npm --prefix app/viewer run dev
```

Open `http://localhost:4173` to inspect the read-only viewer prototype.

## Release Validation

Run:

```powershell
python tools/run_release_validation.py
```

This runs the Python suite, viewer smoke check, packaged app workflow, packaged screenshot capture, and whitespace check. Evidence is written under `dist/release-validation/latest/`.
