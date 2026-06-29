# Development

## Runtime

Initial parser work uses Python. The package is intentionally small while file formats are still being mapped.

## Test Command

Run:

```powershell
python -m unittest discover -s tests
```

The current test suite is a package smoke test. Parser tests should be added with each reader task.
