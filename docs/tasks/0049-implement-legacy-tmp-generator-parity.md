# 0049 Implement Legacy TMP Generator Parity

## Objective

Replace or refine provisional TMP generation to match legacy output.

## Minimal Context

Current TMP generation is deterministic but not parity-verified against legacy `.user.source` exports.

## Inputs

- Raw legacy TMP/source exports from task `0048`.
- `ecgsim/core/tmp.py`
- `docs/simulation.md`
- `docs/parity.md`

## Deliverables

- Implement TMP generator matching legacy references within tolerance.
- Document equation/source attribution and residual differences.
- Update viewer/browser generator to match or consume generated data from core.

## Verification

- Tests compare generated TMP matrices to legacy exports.
- Existing TMP edit tests pass.

## Done When

TMP generation is a parity-tested scientific function, not a preview approximation.
