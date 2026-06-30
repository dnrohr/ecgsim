# ECGsimcase Object Model

Status: parser design target for tasks `0030` through `0034`.

This document defines the stable names and data boundaries for a real `.ECGsimcase` loader. It does not claim the binary layout is fully known yet.

## Goals

- Replace offset-driven readers with named case objects.
- Keep binary parsing in Python `io`; the browser app should consume app-ready JSON or a future loader service.
- Preserve unknown payloads safely so unsupported data is not silently discarded.
- Use names that map to legacy ECGSIM exports, manual terminology, and `readECGsim.m`.

## Public Loader Shape

Future parser work should expose one high-level API:

```python
def load_case(path: str | Path, *, strict: bool = False) -> ECGsimCase:
    ...
```

`strict=False` should parse every known payload and retain unknown payload references. `strict=True` may fail when a required object type is malformed or when a known case object cannot be interpreted.

## Stable Data Structures

These are the intended Python dataclass names and field semantics. Implementation may add helper fields, but public names should remain stable once introduced.

```python
@dataclass(frozen=True)
class ECGsimCase:
    metadata: CaseMetadata
    ecg: ECGBlock | None
    volume_conductor: VolumeConductorModel
    sources: tuple[SourceModel, ...]
    lead_systems: tuple[LeadSystem, ...]
    unknown_objects: tuple[UnknownCaseObject, ...]
```

```python
@dataclass(frozen=True)
class CaseMetadata:
    source_path: Path
    byte_size: int
    sha256: str
    root_signature: str
    marker_counts: Mapping[str, int]
    marker_offsets: Mapping[str, tuple[int, ...]]
    strings: tuple[StringEntry, ...]
```

```python
@dataclass(frozen=True)
class CaseMatrix:
    object_id: str
    role: MatrixRole
    rows: int
    columns: int
    values: tuple[tuple[float, ...], ...]
    units: str | None
    source_offset: int
```

```python
@dataclass(frozen=True)
class CaseVector:
    object_id: str
    role: VectorRole
    values: tuple[float, ...]
    units: str | None
    source_offset: int
```

```python
@dataclass(frozen=True)
class GeometrySurface:
    id: str
    kind: GeometryKind
    vertices: tuple[Point3D, ...]
    triangles: tuple[Triangle, ...]
    units: str | None
    source_offset: int
```

```python
@dataclass(frozen=True)
class GraphGeometry:
    id: str
    source_kind: SourceKind | None
    adjacency_surface: CaseMatrix | None
    adjacency_3d: CaseMatrix | None
    distance_surface: CaseMatrix | None
    distance_3d: CaseMatrix | None
    anisotropic_adjacency: CaseMatrix | None
    anisotropic_distance: CaseMatrix | None
    unknown_matrices: tuple[CaseMatrix, ...]
```

```python
@dataclass(frozen=True)
class VolumeConductorModel:
    geometries: tuple[GeometrySurface, ...]
    graph_geometries: tuple[GraphGeometry, ...]
    transfer_matrices: tuple[TransferMatrix, ...]
    unknown_matrices: tuple[CaseMatrix, ...]
```

```python
@dataclass(frozen=True)
class TransferMatrix:
    source_kind: SourceKind | None
    target: TransferTarget
    matrix: CaseMatrix
    wct_referenced: bool | None
```

```python
@dataclass(frozen=True)
class SourceModel:
    id: str
    kind: SourceKind
    beats: tuple[SourceBeat, ...]
    activation: ActivationConstruction | None
    source_geometry_id: str | None
    unknown_vectors: tuple[CaseVector, ...]
```

```python
@dataclass(frozen=True)
class SourceBeat:
    id: str
    parameters: Mapping[SourceParameterName, SourceParameterValues]
    tmp_waveforms: CaseMatrix | None
```

```python
@dataclass(frozen=True)
class SourceParameterValues:
    initial: CaseVector | None
    adapted: CaseVector | None
    units: str | None
```

```python
@dataclass(frozen=True)
class ActivationConstruction:
    source_kind: SourceKind | None
    vectors: tuple[CaseVector, ...]
    interpretation: str | None
```

```python
@dataclass(frozen=True)
class ECGBlock:
    measured: CaseMatrix | None
    initial: CaseMatrix | None
    adapted: CaseMatrix | None
    sample_rate_hz: float | None
    time_units: str | None
    unknown_matrices: tuple[CaseMatrix, ...]
```

```python
@dataclass(frozen=True)
class LeadSystem:
    id: str
    name: str
    electrodes: tuple[Electrode, ...]
    references: tuple[LeadReference, ...]
    leads: tuple[Lead, ...]
    shown_leads: tuple[ShownLead, ...]
    transfer_matrices: tuple[TransferMatrix, ...]
```

```python
@dataclass(frozen=True)
class Electrode:
    id: str
    label: str | None
    position: Point3D | None
    thorax_node_index: int | None
```

```python
@dataclass(frozen=True)
class Lead:
    id: str
    label: str
    positive_electrode_id: str | None
    negative_electrode_id: str | None
    reference_id: str | None
```

```python
@dataclass(frozen=True)
class LeadReference:
    id: str
    kind: str
    electrode_ids: tuple[str, ...]
```

```python
@dataclass(frozen=True)
class ShownLead:
    lead_id: str
    row: int | None
    column: int | None
    visible: bool
```

```python
@dataclass(frozen=True)
class UnknownCaseObject:
    marker: str
    source_offset: int
    byte_length: int | None
    reason: str
```

## Enumerations

Use lowercase string values when serializing to JSON.

| Enum | Values |
| --- | --- |
| `SourceKind` | `atria`, `ventricles`, `unknown` |
| `GeometryKind` | `atria`, `ventricles`, `thorax`, `left_lung`, `right_lung`, `left_cavity`, `right_cavity`, `unknown` |
| `MatrixRole` | `surface_potentials`, `transfer`, `adjacency`, `distance`, `ecg`, `tmp_waveforms`, `unknown` |
| `VectorRole` | `source_parameter`, `activation`, `electrode_index`, `unknown` |
| `SourceParameterName` | `depolarization_ms`, `depolarization_slope`, `repolarization_ms`, `plateau_slope`, `resting_potential`, `amplitude`, `repolarization_slope`, `unknown` |
| `TransferTarget` | `thorax`, `atria`, `ventricles`, `left_lung`, `right_lung`, `left_cavity`, `right_cavity`, `lead_system`, `unknown` |

## Marker Coverage

The model must cover every marker group currently reported by `ecgsim-case-info`.

| Marker | Object-model destination | Initial parser behavior |
| --- | --- | --- |
| `PECGsimData` | `CaseMetadata.root_signature` | Validate root marker. |
| `PECG` | `ECGBlock` | Parse container, attach leading signal matrices when role is known. |
| `PMatrix` | `CaseMatrix`, `TransferMatrix`, `ECGBlock`, `VolumeConductorModel`, `GraphGeometry` | Parse shape/values when layout is recognized; otherwise retain `UnknownCaseObject`. |
| `PVolumeConductor` | `VolumeConductorModel` | Use as boundary for geometry, graph, and transfer objects. |
| `PGeometry` | `GeometrySurface` | Parse vertices/triangles once layout and units are confirmed. |
| `PGraphGeometry` | `GraphGeometry` | Attach adjacency/distance matrices by order and shape where confirmed. |
| `PSource` | `SourceModel` | Create atrial/ventricular source containers; mark kind `unknown` until identified. |
| `PSourceParameter` | `SourceParameterValues` | Attach named parameter vectors by order only after confirmed. |
| `PVector` | `CaseVector` | Parse vector values and assign roles; retain unknown vectors. |
| `PActivationConstruction` | `ActivationConstruction` | Preserve vectors even when focus semantics are unknown. |
| `PLeadSystem` | `LeadSystem` | Parse name immediately; attach electrodes, leads, references, shown leads. |
| `PLead` | `Lead` | Parse labels/references when primitive layout is confirmed. |
| `PLeadReference` | `LeadReference` | Preserve reference definitions for WCT/zeromean/extremity behavior. |
| `PShowLead` | `ShownLead` | Preserve display ordering and visibility for Leads view parity. |

## Naming And Units

- Use zero-based node indices internally.
- Preserve source offsets on parsed objects for debugging and regression tests.
- Keep geometry coordinates as parsed, with `units=None` until meters versus display units are confirmed.
- Source timing values should be exposed in milliseconds only after parser evidence confirms the scale.
- ECG and BSPM values should be exposed in millivolts only after raw export or case metadata confirms the scale.
- Do not infer atria versus ventricles only from object order in strict mode; use order as a temporary fallback with a warning or unknown marker in non-strict mode.

## Unknown Field Policy

When a parser reaches an object marker but cannot safely interpret its payload:

- Record `UnknownCaseObject(marker, source_offset, byte_length, reason)`.
- Continue parsing later markers if the next marker offset is known.
- Never fabricate units, labels, source kind, lead polarity, or parameter names.
- In `strict=True`, fail only when the caller requested a fully understood object needed by the target workflow.
- Surface unknowns through CLI and fixture manifests so the app can show a truthful unsupported-data notice.

Safe fallback behavior for the viewer:

- Missing geometry: hide that pane and report unsupported geometry for the case.
- Missing source parameters: disable TMP editing and recomputation for that source.
- Missing lead systems: keep ECG plots unavailable rather than showing stale bundled traces.
- Missing activation/focus data: disable focus tools for that case.
- Unknown matrices/vectors: preserve metadata and offsets; do not include them in scientific outputs.

## Fixture Migration

Current viewer fixtures are generated from external `.tri` files and known offsets. Tasks `0030` through `0033` should migrate fixture generation in this order:

1. `tools/export_viewer_fixtures.py` calls `load_case(path)` for metadata and supported objects.
2. Heart and thorax fixtures read `ECGsimCase.volume_conductor.geometries` instead of archived `.tri` files when available.
3. TMP fixtures read `SourceModel.beats[*].parameters` instead of hard-coded `PVector` offsets.
4. ECG fixtures read `ECGBlock` and `LeadSystem` objects instead of hard-coded first-matrix previews.
5. Fixture JSON includes `unknownObjects` and `unsupportedFeatures` summaries derived from the case object.
6. Browser file-open work switches from metadata comparison to app-ready case JSON produced from the same object model.

Until the viewer can parse cases through a service or local bridge, the browser should not parse `.ECGsimcase` binary streams directly.

## Open Binary Questions

- Exact primitive layout and byte span for each object type.
- Geometry units and the mapping from the eight `PGeometry` entries to anatomical names.
- Which `PMatrix` entries are ECG, BSPM, transfer, adjacency, and distance matrices.
- Which `PSource` block is atrial versus ventricular.
- How `PSourceParameter` names are encoded, or whether names must be inferred from ordering.
- Whether `initial` and `adapted` values are always paired in the case.
- How multiple beats beyond `beat1` are represented.
- Lead polarity, reference definitions, and shown-lead layout fields.
- Sample rate/fiducial fields for ECG and BSPM matrices.
- Whether transfer matrices are already WCT-referenced inside `.ECGsimcase`.
