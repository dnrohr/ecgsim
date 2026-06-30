# Legacy Export Formats

Task: `docs/tasks/0002-document-legacy-export-formats.md`

Status: implementation reference for the first parser tasks. This document summarizes the ECGSIM manual plus the MATLAB helpers in `research/source/www.ecgsim.org/downloads/`.

Implementation status: task `0054` adds a supported-subset writer in `ecgsim.io.export_case_directory()`. It emits documented ASCII matrix/vector/`.tri` files plus `metadata.json`; unsupported legacy export members remain documented in `docs/feature-parity/export-directory-writer-notes.md`.

## Export Directory Shape

The ECGSIM manual describes an export operation that writes a directory tree:

```text
export-root/
  ecgs/
  model/
  atrial_beats/
    beat1/
  ventricular_beats/
    beat1/
```

`readECGsim.m` expects these paths:

- `model/`: geometries, adjacency/distance matrices, transfer matrices, and lead-system transfer matrices.
- `ecgs/`: ECG matrices and electrode files.
- `atrial_beats/beat1/`: atrial `user.*` source parameter files.
- `ventricular_beats/beat1/`: ventricular `user.*` source parameter files.

The script only reads `beat1`; the manual says exports may contain `beat[1-x]`.

## Matrix Files

Known extensions using matrix format:

- `.refECG`
- `.adaptECG`
- `.source`
- `.tra`
- `.int`
- `.mat`
- `.adj2d`, `.adj3d`, `.adjanis`
- `.dst2d`, `.dst3d`, `.dstanis`

Examples:

- `research/source/www.ecgsim.org/downloads/other13/geometry/wct.tra`
- `research/source/www.ecgsim.org/downloads/other13/mcg/gumcg300.tra`
- `research/source/www.ecgsim.org/downloads/other13/mcg/gumcg.int`

### ASCII Matrix

Text matrix files begin with two integers:

```text
rows columns
value(1,1) value(1,2) ... value(1,columns)
...
value(rows,1) ... value(rows,columns)
```

Data values are floating-point numbers. `loadmat.m` reads values as `[columns, rows]` and transposes them before returning, so parser implementations should return shape `(rows, columns)`.

Sample dimensions:

| File | Rows | Columns |
| --- | ---: | ---: |
| `wct.tra` | 300 | 257 |
| `gumcg300.tra` | 81 | 257 |
| `gumcg.int` | 81 | 100 |

### Raw Binary Matrix

`loadmat.m` also supports a binary format with:

```text
int32 rows
int32 columns
float32 data[columns][rows]
```

The MATLAB helper reads the data as `[columns, rows]`, then transposes it.

Endian is not stated in the MATLAB file. MATLAB `fread(..., 'long')` and `fread(..., 'float')` use the platform default unless specified. Treat endian as an open question until real binary examples are found.

### `;;mbfmat` Binary Matrix

`loadmat.m` recognizes a second binary matrix flavor with magic bytes:

```text
;;mbfmat
```

The observed reader flow is:

```text
magic[8]
char
int32 header_size
char
char
char
int32 rows
int32 columns
float64 data[columns][rows]
```

The `header_size` field is read but not used by the MATLAB script.

## ASCII Vector Files

Known source-parameter vector extensions:

- `.user.dep`
- `.user.rep`
- `.user.ampl`
- `.user.rest`
- `.user.depslope`
- `.user.repslope`
- `.user.platslope`

Manual-described shape:

```text
rows 1
value(1)
...
value(rows)
```

The manual calls this an "asci" text format. Treat it as a one-column matrix/vector.

Known units:

- `.user.dep`: depolarization time in milliseconds.
- `.user.rep`: repolarization time in milliseconds.
- `.user.ampl`: amplitude in millivolts.
- `.user.rest`: resting potential in millivolts.

Unknown units:

- `.user.depslope`
- `.user.repslope`
- `.user.platslope`

## TMP Waveform Matrix

Known extension:

- `.user.source`

The manual describes this as the TMP waveform at every source node for user-adapted parameter settings. It uses matrix format.

Likely dimensions are source nodes by time samples, but confirm with exported cases before implementing semantic assumptions.

Units:

- TMP amplitude is likely millivolts, based on source parameter units, but the matrix unit is not explicitly documented in the export text.
- Time sampling should be checked against the case or ECG sample rate.

## ECG Matrices

Known extensions:

- `.refECG`: measured ECG matrix.
- `.adaptECG`: simulated ECG matrix with adapted parameter values.

The manual states ECG sample frequency is 1000 Hz. It also notes that measured signals may be fewer than thorax nodes and that remaining body-surface signals may be interpolated.

Expected parser behavior:

- Read as matrix format.
- Preserve row and column counts.
- Associate with sibling `.elec` file when present.
- Do not assume all rows are standard 12 leads; lead system varies by file name and case.

## Electrode Files

Known extension:

- `.elec`

The manual calls electrode files ASCII. For the 12-lead system, electrode positions are ordered as:

```text
VR, VL, VF, V1, V2, V3, V4, V5, V6
```

`readECGsim.m` loads electrode files with `loadmat` and then keeps columns `2:4`, implying exported electrode files may have an index/name column followed by x/y/z coordinates.

Known units:

- The manual does not state units for `.elec`; likely geometry coordinates, but confirm from exported data.

## Geometry `.tri` Files

Known examples:

- `research/source/www.ecgsim.org/downloads/other13/geometry/heart.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/thorax.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/rlung.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/llung.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/lcav.tri`
- `research/source/www.ecgsim.org/downloads/other13/geometry/rcav.tri`

### ASCII Triangulation

Text `.tri` files begin with point count, followed by indexed point rows, triangle count, and indexed triangle rows:

```text
point_count
point_index x y z
...
triangle_count
triangle_index node_index_1 node_index_2 node_index_3
...
```

Coordinates are documented as meters.

Triangle orientation is defined by the order of node indices. When viewed from outside the surface, nodes are ordered clockwise.

Sample dimensions:

| File | Points | Triangles |
| --- | ---: | ---: |
| `heart.tri` | 257 | 510 |
| `thorax.tri` | 300 | 596 |
| `rlung.tri` | 116 | 228 |
| `llung.tri` | 116 | 228 |
| `lcav.tri` | 72 | 140 |
| `rcav.tri` | 107 | 210 |

### `;;mbftri` Binary Triangulation

`loadtri.m` recognizes a binary geometry flavor with magic bytes:

```text
;;mbftri
```

The observed reader flow is:

```text
magic[8]
char
int32 header_size
char
char
char
int32 point_count
int32 coordinate_columns
char
int32 triangle_count
int32 triangle_columns
float64 points[coordinate_columns][point_count]
int32 triangles[triangle_columns][triangle_count]
```

The MATLAB helper increments binary triangle indices by one after reading. That implies binary `.tri` triangle indices are zero-based on disk, while ASCII `.tri` files are one-based.

Endian is not stated; verify before implementing binary support.

## Transfer Matrix `.tra` Files

Known examples:

- `research/source/www.ecgsim.org/downloads/other13/geometry/wct.tra`
- `research/source/www.ecgsim.org/downloads/other13/mcg/gumcg300.tra`

`.tra` files use matrix format. Examples:

- `wct.tra`: 300 by 257.
- `gumcg300.tra`: 81 by 257.

Interpretation depends on context:

- The old `wct.tra` appears to map heart/source points to thorax/body-surface points with WCT reference.
- `gumcg300.tra` maps source points to an 81-point MCG observation grid.

Units are not explicitly documented in the export-format manual. The transfer manual describes transfer-function displays in microvolts per square centimeter, but parser code should not assign units until confirmed for exported matrix values.

## MCG Observation `.obs` Files

Known example:

- `research/source/www.ecgsim.org/downloads/other13/mcg/gumcg.obs`

The file follows the point portion of ASCII `.tri` geometry:

```text
point_count
point_index x y z
...
```

Sample:

- `gumcg.obs`: 81 observation points.

Units are not explicitly documented in the MCG helper page. Coordinates look meter-scale and should be treated as geometry coordinates pending confirmation.

## MCG Signal `.int` Files

Known example:

- `research/source/www.ecgsim.org/downloads/other13/mcg/gumcg.int`

`.int` uses matrix format. The sample file is 81 by 100.

Likely interpretation:

- rows: MCG observation points.
- columns: time samples.

Units and sample rate are not documented in the inspected files.

## Layout `.lay` Files

Known example:

- `research/source/www.ecgsim.org/downloads/other13/mcg/mcg.lay`

Observed text structure:

```text
entry_count
signal_index x y width height label
...
```

Sample:

- `mcg.lay`: 9 entries.

Likely purpose:

- Defines display layout for selected signals.

Units:

- `x`, `y`, `width`, and `height` appear to be normalized display coordinates.

## Logical Components Expected By `readECGsim.m`

The MATLAB export reader expects these model files when present:

- `atria.tri`
- `ventricle.tri`
- `lcav.tri`
- `rcav.tri`
- `llung.tri`
- `rlung.tri`
- `thorax.tri`
- `atria.adj2d`, `atria.adj3d`, `ATRIA.adjanis`
- `atria.dst2d`, `ATRIA.dst3d`, `ATRIA.dstanis`
- `ventricle.adj2d`, `ventricle.adj3d`, `ventricle.adjanis`
- `ventricle.dst2d`, `ventricle.dst3d`, `ventricle.dstanis`
- `atria2Thorax.mat`, `atria2atria.mat`, `atria2Ventricles.mat`
- `atria2RLung.mat`, `atria2LLung.mat`, `atria2LCavity.mat`, `atria2RCavity.mat`
- `ventricles2Thorax.mat`, `ventricles2atria.mat`, `ventricles2Ventricles.mat`
- `ventricles2RLung.mat`, `ventricles2LLung.mat`, `ventricles2LCavity.mat`, `ventricles2RCavity.mat`
- `atria2standard12lead.mat` or `atria2standard_12.mat`
- `ventricles2standard12lead.mat` or `ventricles2standard_12.mat`

ECG files are discovered as `*.refECG`; the reader then expects a matching `.elec` file with the same prefix.

Beat files are discovered as `user.*` in beat directories.

## Open Questions

- Endianness for binary `;;mbfmat`, raw binary matrix, and `;;mbftri` on non-Windows platforms.
- Whether any current 3.0 case export still writes binary matrix/geometry variants.
- Exact units for `.elec`, `.tra`, `.int`, `.user.source`, and slope parameters.
- Whether `.adaptECG` is always present or only after user edits.
- Whether exported source parameters include both initial and adapted values or only adapted values.
- How multiple beats are represented beyond `beat1`, since `readECGsim.m` only reads `beat1`.

## Parser Implementation Notes

- Implement ASCII matrix/vector support first; all archived legacy example files are text.
- Keep binary `;;mbfmat` and `;;mbftri` support as explicit follow-up paths unless binary fixtures are found.
- Return matrix data in `(rows, columns)` order, matching manual terminology and MATLAB helper output after transposition.
- Preserve original file path, detected format, dimensions, and units/unknown-unit metadata with parsed data.

## Implemented Reader Notes

`ecgsim.io.read_matrix` and `ecgsim.io.read_vector` were added for task 0004.

Current behavior:

- ASCII matrices require exactly `rows * columns` numeric values after the two-integer header.
- Raw binary matrices are interpreted as little-endian `int32 rows`, `int32 columns`, then `float32` column-major payload.
- `;;mbfmat` matrices are interpreted as little-endian headers with `float64` column-major payload.
- Returned matrix values are immutable tuples in row-major `(rows, columns)` order.
- `read_vector` accepts only one-column matrices and returns a flat immutable tuple.

Numeric parsing does not apply tolerances while reading. Tests use approximate comparisons only for floating-point assertions.

`ecgsim.io.read_geometry` was added for task 0005.

Current behavior:

- ASCII `.tri` and binary `;;mbftri` files are supported.
- Returned points are `(x, y, z)` float tuples with units recorded as `m`.
- Returned triangles use zero-based indices for Python/rendering code.
- `source_index_base` records the on-disk convention: `1` for ASCII `.tri`, `0` for `;;mbftri`.
- Binary `;;mbftri` is interpreted as little-endian, matching the initial matrix-reader assumption.
- ASCII `.tri` files may contain trailing metadata after the expected triangle rows; the mesh reader ignores that trailing text.
