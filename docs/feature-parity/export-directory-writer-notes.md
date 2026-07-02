# Export Directory Writer Notes

Status: updated through task `0076`.

## Implemented Output

`ecgsim.io.export_case_directory(case_or_path, output_dir)` writes:

- `model/ventricle.tri` from parsed heart geometry.
- `model/thorax.tri` from parsed thorax geometry.
- `model/rlung.tri` and `model/llung.tri` from parsed lung geometries.
- `ventricular_beats/beat1/user.dep`, `.user.rep`, `.user.ampl`, `.user.rest`, `.user.depslope`, `.user.repslope`, and `.user.platslope` when adapted vectors are available.
- `ventricular_beats/beat1/user.source` generated from adapted source parameters when the required TMP vectors are available.
- `atrial_beats/beat1/user.*` files when non-empty atrial vectors are available.
- `ecgs/thorax.refECG` from the first parsed `.ECGsimcase` surface-potential matrix.
- `metadata.json` with source case identity, written files, unsupported members, and compatibility notes.

The CLI entry point is:

```powershell
python -m ecgsim.cli.export_case research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase scratch/normal-export
```

Installed environments also expose:

```powershell
ecgsim-export-case <case-file> <output-dir>
```

## Compatibility Boundary

The writer uses the documented legacy ASCII matrix, vector, and `.tri` formats. Exported files are verified by reading them back through the project readers.

This is not yet a full legacy `File -> Export` clone. The current automation environment still lacks captured raw legacy export directories, so exact file naming, optional members, and byte/value parity cannot be proven for every legacy output.

Known unsupported or deferred members include:

- Model adjacency, distance, anisotropy, transfer, and lead transfer matrices.
- Electrode `.elec` files.
- Adapted ECG recomputation output.
- Activation/focus export files.
- Raw display/layout state.

## Verification Coverage

`tests/test_export_directory.py` exports the archived normal male case to a temporary directory, then verifies:

- Exported geometry reads back as one-based ASCII `.tri` with meter coordinates.
- Exported ventricular `user.dep` reads back as a vector matching parsed adapted values.
- Exported ventricular `user.source` reads back as a source-node-by-time matrix generated from adapted TMP parameters.
- Exported `ecgs/thorax.refECG` reads back with the same shape and representative values as the source `PMatrix`.
- `metadata.json` records the written files and unsupported members.
- The module CLI creates the expected directory and reports unsupported members.
