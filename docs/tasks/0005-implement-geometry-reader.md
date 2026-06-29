# 0005 Implement Geometry Reader

## Objective

Implement a reader for ECGSIM triangulated geometry files.

## Minimal Context

Geometry `.tri` files define node coordinates and triangle indices. The manual says coordinates are in meters and triangle orientation is defined by clockwise node order when viewed from outside.

## Inputs

- `docs/file-formats/export-formats.md`
- `research/source/www.ecgsim.org/downloads/loadtri.m`
- `research/source/www.ecgsim.org/downloads/other13/geometry/*.tri`

## Deliverables

- Add a geometry reader returning points, triangles, units, and source filename metadata.
- Add tests for all available legacy `.tri` files.
- Document index-base handling.

## Verification

- Tests assert node and triangle counts for each sample geometry.
- Tests assert representative coordinates and triangle indices.
- Test command passes.

## Done When

The project can load legacy `.tri` files into a render-ready data structure.
