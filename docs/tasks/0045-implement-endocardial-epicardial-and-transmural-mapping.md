# 0045 Implement Endocardial Epicardial And Transmural Mapping

## Objective

Implement wall-side and transmural source mapping workflows.

## Minimal Context

Legacy ECGSIM supports endocardial/epicardial switching and transmural editing. Current app does not know paired nodes.

## Inputs

- Parsed source geometry/activation data.
- `docs/source-editing-model.md`
- `research/extracted-text/www.ecgsim.org/manual/heart.txt`.

## Deliverables

- Identify or derive endocardial/epicardial node groups.
- Add transmural pairing data structure.
- Implement UI state only where mapping is known.

## Verification

- Tests prove mappings are stable for supported cases.
- Unknown mappings are disabled with clear UI/docs.

## Done When

Wall-side and transmural workflows are either working or explicitly unavailable per case.
