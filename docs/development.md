# Development

## Runtime

Initial parser work uses Python. The package is intentionally small while file formats are still being mapped.

## Test Command

Run:

```powershell
python -m unittest discover -s tests
```

The current test suite is a package smoke test. Parser tests should be added with each reader task.

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

## Viewer Fixture Export

Run:

```powershell
python tools/export_viewer_fixtures.py
```

This regenerates `app/viewer/public/fixtures/heart.json` from archived legacy geometry.

Regression tests also compare tracked viewer fixtures and the legacy screenshot manifest against the tolerances in `docs/parity.md`. When regenerating fixtures, run the Python test command before committing.

## Viewer Dev Server

Run:

```powershell
npm --prefix app/viewer run dev
```

Open `http://localhost:4173` to inspect the read-only viewer prototype.
