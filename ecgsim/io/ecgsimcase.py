"""Metadata-only reader for legacy ECGSIM .ECGsimcase files."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from functools import lru_cache
import hashlib
import math
from pathlib import Path
import struct

from ecgsim.io.geometry import GeometryData
from ecgsim.io.matrix import MatrixData, VectorData


ROOT_SIGNATURE = "PECGsimData"
PMATRIX_SIGNATURE = "PMatrix"
PGEOMETRY_SIGNATURE = "PGeometry"
PGRAPH_GEOMETRY_SIGNATURE = "PGraphGeometry"
PVECTOR_SIGNATURE = "PVector"
PSOURCE_SIGNATURE = "PSource"
PSOURCE_PARAMETER_SIGNATURE = "PSourceParameter"
PACTIVATION_CONSTRUCTION_SIGNATURE = "PActivationConstruction"
PLEAD_SYSTEM_SIGNATURE = "PLeadSystem"
PLEAD_SIGNATURE = "PLead"
PLEAD_REFERENCE_SIGNATURE = "PLeadReference"
PSHOW_LEAD_SIGNATURE = "PShowLead"
PRINTABLE_MIN = 0x20
PRINTABLE_MAX = 0x7E
GEOMETRY_NAMES_BY_INDEX = (
    "thorax",
    "heart",
    "empty_geometry_1",
    "empty_geometry_2",
    "right_lung",
    "left_lung",
    "auxiliary_geometry_1",
    "auxiliary_geometry_2",
)
SOURCE_KINDS_BY_INDEX = ("atria", "ventricles")
SOURCE_PARAMETER_NAMES = (
    "depolarizationMs",
    "repolarizationMs",
    "plateauSlope",
    "restingPotential",
    "amplitude",
    "depolarizationSlope",
    "repolarizationSlope",
)


class ECGsimCaseFormatError(ValueError):
    """Raised when an ECGsimcase file does not match the known container shape."""


@dataclass(frozen=True)
class StringEntry:
    """A length-prefixed UTF-16LE string found in a case file."""

    offset: int
    byte_length: int
    text: str


@dataclass(frozen=True)
class ECGsimCaseMetadata:
    """Metadata and object-marker inventory for an ECGsimcase file."""

    source_path: Path
    byte_size: int
    sha256: str
    entropy_bits_per_byte: float
    root_signature: str
    strings: tuple[StringEntry, ...]
    marker_counts: dict[str, int]
    marker_offsets: dict[str, tuple[int, ...]]
    lead_systems: tuple[str, ...]
    unsupported_payloads: tuple[str, ...]


@dataclass(frozen=True)
class ECGsimCaseGeometry:
    """A named ``PGeometry`` payload parsed from an ECGsimcase file."""

    name: str
    marker_offset: int
    geometry: GeometryData

    @property
    def point_count(self) -> int:
        return self.geometry.point_count

    @property
    def triangle_count(self) -> int:
        return self.geometry.triangle_count


@dataclass(frozen=True)
class ECGsimCaseGraphGeometry:
    """Parsed ``PGraphGeometry`` source-surface mesh and payload inventory.

    The point/triangle mesh layout is confirmed for archived cases. Wall-side
    and transmural pairing semantics are not yet confirmed, so this object does
    not expose interpreted opposite-wall pairs.
    """

    id: str
    marker_offset: int
    values_offset: int
    end_offset: int
    storage_format: str
    version: int | None
    scale: float | None
    flag: int | None
    geometry: GeometryData
    header_ints: tuple[int, ...]
    header_floats: tuple[float, ...]
    payload_bytes: int
    nested_matrix_offsets: tuple[int, ...]
    interpretation: str

    @property
    def point_count(self) -> int:
        return self.geometry.point_count

    @property
    def triangle_count(self) -> int:
        return self.geometry.triangle_count


@dataclass(frozen=True)
class ECGsimCaseVector:
    """A vector payload with its original case-file offset."""

    source_offset: int
    values: tuple[float, ...]
    storage_format: str

    @property
    def length(self) -> int:
        return len(self.values)


@dataclass(frozen=True)
class ECGsimCaseSourceParameter:
    """Initial/adapted values for one source parameter."""

    name: str
    parameter_offset: int
    initial: ECGsimCaseVector | None
    adapted: ECGsimCaseVector | None
    units: str


@dataclass(frozen=True)
class ECGsimCaseSourceBeat:
    """A stable beat container for source parameters."""

    id: str
    parameters: tuple[ECGsimCaseSourceParameter, ...]


@dataclass(frozen=True)
class ECGsimCaseActivationEntry:
    """One raw activation construction table row with conservative field names."""

    integer_field: int
    float_field_1: float
    float_field_2: float


@dataclass(frozen=True)
class ECGsimCaseActivation:
    """Activation/focus payload summary for a source."""

    source_offset: int
    version: int
    entry_count: int
    entries: tuple[ECGsimCaseActivationEntry, ...]
    storage_format: str
    interpretation: str


@dataclass(frozen=True)
class ECGsimCaseSource:
    """A parsed source container with stable source and beat IDs."""

    id: str
    kind: str
    source_offset: int
    beats: tuple[ECGsimCaseSourceBeat, ...]
    activation: ECGsimCaseActivation | None
    unknown_vectors: tuple[ECGsimCaseVector, ...]


@dataclass(frozen=True)
class ECGsimCaseElectrode:
    """Electrode position parsed from a lead-system block."""

    id: str
    label: str
    position: tuple[float, float, float]
    units: str
    thorax_node_index: int | None = None


@dataclass(frozen=True)
class ECGsimCaseLeadSystem:
    """Lead-system metadata and confirmed electrode positions."""

    id: str
    name: str
    source_offset: int
    electrodes: tuple[ECGsimCaseElectrode, ...]
    lead_labels: tuple[str, ...]
    reference_labels: tuple[str, ...]
    shown_lead_labels: tuple[str, ...]
    matrix_offsets: tuple[int, ...]
    unsupported_fields: tuple[str, ...]


@dataclass(frozen=True)
class ECGsimCaseFiducials:
    """Fiducial samples used by legacy baseline coupling when known."""

    status: str
    baseline_start_index: int | None
    baseline_end_index: int | None
    interpretation: str


@dataclass(frozen=True)
class ECGsimCaseSignalMetadata:
    """Known ECG/surface-potential matrix metadata."""

    matrix_offset: int
    rows: int
    columns: int
    sample_rate_hz: int
    signal_kind: str
    units: str
    fiducials: ECGsimCaseFiducials
    unsupported_fields: tuple[str, ...]


@dataclass(frozen=True)
class ECGsimCaseMatrixInventoryEntry:
    """Shape and role hint for one ``PMatrix`` marker in an ECGsimcase file."""

    index: int
    offset: int
    version: int | None
    rows: int | None
    columns: int | None
    status: str
    role_hint: str
    owner_hint: str | None = None
    error: str | None = None


@dataclass(frozen=True)
class ECGsimCaseLeadObjectInventoryEntry:
    """Conservative inventory for lead, reference, and show-lead objects."""

    kind: str
    index: int
    offset: int
    lead_system_name: str
    version: int | None
    label: str | None
    trailing_int32: tuple[int, ...]
    trailing_float32: tuple[float, ...]
    trailing_bytes: int
    status: str
    interpretation: str
    error: str | None = None


DERIVED_FIDUCIALS_BY_SHA256 = {
    "4da15b759b8bc4880843bc647a257f66e36b64042583d0ad1c3e11bdc6169c4a": ECGsimCaseFiducials(
        status="derived-from-legacy-export",
        baseline_start_index=5,
        baseline_end_index=499,
        interpretation=(
            "Baseline window inferred from shared near-zero runs in the promoted ECGSIM 3.0.1 "
            "normal male standard_12.adaptECG export; the matching case payload field remains undecoded."
        ),
    ),
}


@dataclass(frozen=True)
class ECGsimCase:
    """Normalized parsed case object for supported ECGsimcase payloads."""

    metadata: ECGsimCaseMetadata
    geometries: tuple[ECGsimCaseGeometry, ...]
    graph_geometries: tuple[ECGsimCaseGraphGeometry, ...]
    sources: tuple[ECGsimCaseSource, ...]
    lead_systems: tuple[ECGsimCaseLeadSystem, ...]
    signal_metadata: ECGsimCaseSignalMetadata


def load_case(path: str | Path, *, strict: bool = False) -> ECGsimCase:
    """Load supported ECGsimcase objects through one high-level API."""

    metadata = read_ecgsimcase_metadata(path)
    case = ECGsimCase(
        metadata=metadata,
        geometries=read_ecgsimcase_geometries(metadata.source_path),
        graph_geometries=read_ecgsimcase_graph_geometries(metadata.source_path),
        sources=read_ecgsimcase_sources(metadata.source_path),
        lead_systems=read_ecgsimcase_lead_systems(metadata.source_path),
        signal_metadata=read_ecgsimcase_signal_metadata(metadata.source_path),
    )
    if strict:
        if not case.geometries:
            raise ECGsimCaseFormatError(f"{metadata.source_path} has no parsed geometries")
        if not case.sources:
            raise ECGsimCaseFormatError(f"{metadata.source_path} has no parsed sources")
        if not case.lead_systems:
            raise ECGsimCaseFormatError(f"{metadata.source_path} has no parsed lead systems")
    return case


def read_ecgsimcase_metadata(path: str | Path) -> ECGsimCaseMetadata:
    """Read metadata and object markers without parsing numeric payloads."""

    source_path = Path(path)
    stat = source_path.stat()
    return _read_ecgsimcase_metadata_cached(str(source_path), stat.st_mtime_ns, stat.st_size)


@lru_cache(maxsize=16)
def _read_ecgsimcase_metadata_cached(path: str, mtime_ns: int, byte_size: int) -> ECGsimCaseMetadata:
    source_path = Path(path)
    data = source_path.read_bytes()
    if not data:
        raise ECGsimCaseFormatError(f"{source_path} is empty")
    if len(data) != byte_size:
        raise ECGsimCaseFormatError(f"{source_path} size changed while reading")

    strings = tuple(find_length_prefixed_utf16le(data, min_chars=2))
    if not strings or strings[0].offset != 0 or strings[0].text != ROOT_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} does not start with {ROOT_SIGNATURE!r}")

    marker_offsets: dict[str, list[int]] = {}
    for entry in strings:
        if entry.text.startswith("P"):
            marker_offsets.setdefault(entry.text, []).append(entry.offset)

    lead_systems: list[str] = []
    for index, entry in enumerate(strings):
        if entry.text == "PLeadSystem" and index + 1 < len(strings):
            lead_systems.append(strings[index + 1].text)

    frozen_offsets = {name: tuple(offsets) for name, offsets in marker_offsets.items()}
    marker_counts = dict(Counter({name: len(offsets) for name, offsets in frozen_offsets.items()}))

    return ECGsimCaseMetadata(
        source_path=source_path,
        byte_size=len(data),
        sha256=hashlib.sha256(data).hexdigest(),
        entropy_bits_per_byte=shannon_entropy(data),
        root_signature=strings[0].text,
        strings=strings,
        marker_counts=marker_counts,
        marker_offsets=frozen_offsets,
        lead_systems=tuple(lead_systems),
        unsupported_payloads=(
            "PMatrix numeric payloads",
            "PGeometry numeric payloads",
            "PGraphGeometry payloads",
            "PSource/PSourceParameter payloads",
            "unnamed PVector payloads",
            "PActivationConstruction payloads",
            "PLead/PShowLead payloads",
        ),
    )


def read_ecgsimcase_geometries(path: str | Path) -> tuple[ECGsimCaseGeometry, ...]:
    """Read all known ``PGeometry`` payloads from an ECGsimcase file.

    The observed payload shape is a marker, ``int32`` version, ``int32`` flag,
    ``int32`` point count, row-major float32 XYZ triplets, ``int32`` triangle
    count, then zero-based int32 triangle triplets.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    geometries: list[ECGsimCaseGeometry] = []

    for index, offset in enumerate(metadata.marker_offsets.get(PGEOMETRY_SIGNATURE, ())):
        name = GEOMETRY_NAMES_BY_INDEX[index] if index < len(GEOMETRY_NAMES_BY_INDEX) else f"geometry_{index}"
        geometries.append(
            ECGsimCaseGeometry(
                name=name,
                marker_offset=offset,
                geometry=_read_ecgsimcase_geometry_payload(data, source_path, offset),
            )
        )

    return tuple(geometries)


def read_ecgsimcase_graph_geometries(path: str | Path) -> tuple[ECGsimCaseGraphGeometry, ...]:
    """Read ``PGraphGeometry`` source meshes without assigning wall semantics."""

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    all_marker_offsets = _all_marker_offsets(metadata) + (len(data),)
    graph_geometries: list[ECGsimCaseGraphGeometry] = []

    for index, offset in enumerate(metadata.marker_offsets.get(PGRAPH_GEOMETRY_SIGNATURE, ())):
        marker, values_offset = _read_marker(data, source_path, offset)
        if marker != PGRAPH_GEOMETRY_SIGNATURE:
            raise ECGsimCaseFormatError(
                f"{source_path} marker at {offset} is {marker!r}, not PGraphGeometry"
            )
        end_offset = next(next_offset for next_offset in all_marker_offsets if next_offset > offset)
        graph = _read_ecgsimcase_graph_geometry_payload(data, source_path, values_offset, end_offset)
        nested_matrix_offsets = _marker_offsets_in_range(
            metadata,
            PMATRIX_SIGNATURE,
            values_offset,
            end_offset,
        )
        graph_geometries.append(
            ECGsimCaseGraphGeometry(
                id=f"graphGeometry{index + 1}",
                marker_offset=offset,
                values_offset=values_offset,
                end_offset=end_offset,
                storage_format=(
                    f"ecgsimcase-pgraphgeometry-v{graph['version']}-mesh"
                    if graph["version"] and graph["version"] > 0
                    else "ecgsimcase-pgraphgeometry-unknown"
                ),
                version=graph["version"],
                scale=graph["scale"],
                flag=graph["flag"],
                geometry=graph["geometry"],
                header_ints=graph["header_ints"],
                header_floats=graph["header_floats"],
                payload_bytes=end_offset - values_offset,
                nested_matrix_offsets=nested_matrix_offsets,
                interpretation=(
                    "PGraphGeometry source mesh parsed as float32 XYZ points and int32 "
                    "triangle indices; wall-side, opposite-wall, and transmural pairing "
                    "semantics are not confirmed."
                ),
            )
        )

    return tuple(graph_geometries)


def read_ecgsimcase_sources(path: str | Path) -> tuple[ECGsimCaseSource, ...]:
    """Read source parameter and activation summaries from an ECGsimcase file."""

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    source_offsets = metadata.marker_offsets.get(PSOURCE_SIGNATURE, ())
    source_ends = source_offsets[1:] + metadata.marker_offsets.get("PLeadSystem", (len(data),))[:1]
    sources: list[ECGsimCaseSource] = []

    for source_index, (source_offset, source_end) in enumerate(zip(source_offsets, source_ends)):
        kind = SOURCE_KINDS_BY_INDEX[source_index] if source_index < len(SOURCE_KINDS_BY_INDEX) else "unknown"
        parameter_offsets = _marker_offsets_in_range(metadata, PSOURCE_PARAMETER_SIGNATURE, source_offset, source_end)
        activation_offsets = _marker_offsets_in_range(
            metadata, PACTIVATION_CONSTRUCTION_SIGNATURE, source_offset, source_end
        )
        boundary_offsets = tuple(sorted(parameter_offsets + activation_offsets + (source_end,)))
        parameters: list[ECGsimCaseSourceParameter] = []
        assigned_vector_offsets: set[int] = set()

        for parameter_index, parameter_offset in enumerate(parameter_offsets):
            parameter_end = next(boundary for boundary in boundary_offsets if boundary > parameter_offset)
            vector_offsets = _marker_offsets_in_range(metadata, PVECTOR_SIGNATURE, parameter_offset, parameter_end)
            vectors = tuple(_read_ecgsimcase_vector_payload(data, source_path, offset) for offset in vector_offsets)
            assigned_vector_offsets.update(vector_offsets[:2])
            name = (
                SOURCE_PARAMETER_NAMES[parameter_index]
                if parameter_index < len(SOURCE_PARAMETER_NAMES)
                else f"unknownParameter{parameter_index + 1}"
            )
            parameters.append(
                ECGsimCaseSourceParameter(
                    name=name,
                    parameter_offset=parameter_offset,
                    initial=vectors[0] if len(vectors) > 0 else None,
                    adapted=vectors[1] if len(vectors) > 1 else None,
                    units=_source_parameter_units(name),
                )
            )

        all_vector_offsets = _marker_offsets_in_range(metadata, PVECTOR_SIGNATURE, source_offset, source_end)
        unknown_vectors = tuple(
            _read_ecgsimcase_vector_payload(data, source_path, offset)
            for offset in all_vector_offsets
            if offset not in assigned_vector_offsets
        )
        activation = (
            _read_ecgsimcase_activation(data, source_path, activation_offsets[0]) if activation_offsets else None
        )
        sources.append(
            ECGsimCaseSource(
                id=f"source{source_index + 1}",
                kind=kind,
                source_offset=source_offset,
                beats=(ECGsimCaseSourceBeat(id="beat1", parameters=tuple(parameters)),),
                activation=activation,
                unknown_vectors=unknown_vectors,
            )
        )

    return tuple(sources)


def read_ecgsimcase_lead_systems(path: str | Path) -> tuple[ECGsimCaseLeadSystem, ...]:
    """Read lead-system names, electrodes, and nested lead-label summaries."""

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    lead_offsets = metadata.marker_offsets.get(PLEAD_SYSTEM_SIGNATURE, ())
    lead_systems: list[ECGsimCaseLeadSystem] = []

    for index, offset in enumerate(lead_offsets):
        name_entry = _next_string_after(metadata, offset)
        if name_entry is None:
            raise ECGsimCaseFormatError(f"{source_path} PLeadSystem at {offset} has no name string")
        values_offset = name_entry.offset + 4 + name_entry.byte_length
        if values_offset + 4 > len(data):
            raise ECGsimCaseFormatError(f"{source_path} PLeadSystem at {offset} has no electrode count")
        (electrode_count,) = struct.unpack_from("<i", data, values_offset)
        if electrode_count < 0:
            raise ECGsimCaseFormatError(
                f"{source_path} PLeadSystem at {offset} has invalid electrode count {electrode_count}"
            )
        electrode_start = values_offset + 4
        electrode_bytes = electrode_count * 3 * 4
        if electrode_start + electrode_bytes > len(data):
            raise ECGsimCaseFormatError(f"{source_path} PLeadSystem electrodes at {offset} overrun the file")
        flat = struct.unpack_from(f"<{electrode_count * 3}f", data, electrode_start) if electrode_count else ()
        electrodes = tuple(
            ECGsimCaseElectrode(
                id=f"{_slug(name_entry.text)}-electrode-{electrode_index + 1}",
                label=f"E{electrode_index + 1}",
                position=(
                    float(flat[electrode_index * 3]),
                    float(flat[electrode_index * 3 + 1]),
                    float(flat[electrode_index * 3 + 2]),
                ),
                units="case-coordinate-units",
            )
            for electrode_index in range(electrode_count)
        )
        end = lead_offsets[index + 1] if index + 1 < len(lead_offsets) else len(data)
        lead_systems.append(
            ECGsimCaseLeadSystem(
                id=f"leadSystem{index + 1}",
                name=name_entry.text,
                source_offset=offset,
                electrodes=electrodes,
                lead_labels=_labels_for_nested_markers(metadata, PLEAD_SIGNATURE, offset, end, "lead"),
                reference_labels=_labels_for_nested_markers(
                    metadata, PLEAD_REFERENCE_SIGNATURE, offset, end, "reference"
                ),
                shown_lead_labels=_labels_for_nested_markers(metadata, PSHOW_LEAD_SIGNATURE, offset, end, "shown"),
                matrix_offsets=_marker_offsets_in_range(metadata, PMATRIX_SIGNATURE, offset, end),
                unsupported_fields=(
                    "lead polarity/reference electrode fields",
                    "shown-lead layout fields",
                    "fiducial/time-base fields",
                ),
            )
        )

    return tuple(lead_systems)


def read_ecgsimcase_signal_metadata(path: str | Path) -> ECGsimCaseSignalMetadata:
    """Read metadata for the first known case signal matrix."""

    source_path = Path(path)
    metadata = read_ecgsimcase_metadata(source_path)
    matrix_offset = metadata.marker_offsets[PMATRIX_SIGNATURE][0]
    matrix = read_ecgsimcase_matrix(source_path, matrix_offset)
    fiducials = DERIVED_FIDUCIALS_BY_SHA256.get(
        metadata.sha256,
        ECGsimCaseFiducials(
            status="unavailable",
            baseline_start_index=None,
            baseline_end_index=None,
            interpretation=(
                "Legacy baseline coupling should use P-wave start and T-wave termination; "
                "these samples have not been located in the parsed case payload."
            ),
        ),
    )
    unsupported_fields = ["measured/initial/adapted signal classification"]
    if fiducials.status == "unavailable":
        unsupported_fields.append("P-wave/T-wave fiducial samples for baseline correction")
    return ECGsimCaseSignalMetadata(
        matrix_offset=matrix_offset,
        rows=matrix.rows,
        columns=matrix.columns,
        sample_rate_hz=1000,
        signal_kind="thorax-node surface potentials",
        units="mV",
        fiducials=fiducials,
        unsupported_fields=tuple(unsupported_fields),
    )


def read_ecgsimcase_matrix_inventory(path: str | Path) -> tuple[ECGsimCaseMatrixInventoryEntry, ...]:
    """Inventory all ``PMatrix`` markers with conservative role hints."""

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    lead_systems = read_ecgsimcase_lead_systems(source_path)
    lead_owner_by_offset = {
        offset: lead_system.name
        for lead_system in lead_systems
        for offset in lead_system.matrix_offsets
    }
    lead_counts_by_offset = {
        offset: (len(lead_system.electrodes), len(lead_system.lead_labels), len(lead_system.shown_lead_labels))
        for lead_system in lead_systems
        for offset in lead_system.matrix_offsets
    }
    graph_counts = tuple(
        graph.point_count for graph in read_ecgsimcase_graph_geometries(source_path) if graph.point_count
    )
    source_counts = tuple(
        parameter.adapted.length
        for source in read_ecgsimcase_sources(source_path)
        for beat in source.beats
        for parameter in beat.parameters
        if parameter.adapted is not None and parameter.adapted.length
    )
    signal_rows = None
    signal_columns = None
    try:
        signal = read_ecgsimcase_signal_metadata(source_path)
        signal_rows = signal.rows
        signal_columns = signal.columns
    except ECGsimCaseFormatError:
        pass

    entries: list[ECGsimCaseMatrixInventoryEntry] = []
    for index, offset in enumerate(metadata.marker_offsets.get(PMATRIX_SIGNATURE, ()), start=1):
        error = None
        try:
            version, rows, columns = _read_ecgsimcase_matrix_header(data, source_path, offset)
            if rows <= 0 or columns <= 0:
                status = "empty-placeholder"
            else:
                read_ecgsimcase_matrix(source_path, offset)
                status = "parsed"
        except ECGsimCaseFormatError as exc:
            error = str(exc)
            status = "unsupported"
            try:
                version, rows, columns = _read_ecgsimcase_matrix_header(data, source_path, offset)
            except ECGsimCaseFormatError:
                version = rows = columns = None

        entries.append(
            ECGsimCaseMatrixInventoryEntry(
                index=index,
                offset=offset,
                version=version,
                rows=rows,
                columns=columns,
                status=status,
                role_hint=_matrix_role_hint(
                    offset,
                    rows,
                    columns,
                    index,
                    signal_rows,
                    signal_columns,
                    graph_counts,
                    source_counts,
                    lead_counts_by_offset,
                ),
                owner_hint=lead_owner_by_offset.get(offset),
                error=error,
            )
        )

    return tuple(entries)


def read_ecgsimcase_lead_object_inventory(path: str | Path) -> tuple[ECGsimCaseLeadObjectInventoryEntry, ...]:
    """Inventory ``PLead``, ``PLeadReference``, and ``PShowLead`` payloads."""

    source_path = Path(path)
    data = source_path.read_bytes()
    metadata = read_ecgsimcase_metadata(source_path)
    lead_system_offsets = metadata.marker_offsets.get(PLEAD_SYSTEM_SIGNATURE, ())
    entries: list[ECGsimCaseLeadObjectInventoryEntry] = []
    global_index = 0

    for system_index, system_offset in enumerate(lead_system_offsets):
        system_end = (
            lead_system_offsets[system_index + 1]
            if system_index + 1 < len(lead_system_offsets)
            else len(data)
        )
        name_entry = _next_string_after(metadata, system_offset)
        system_name = name_entry.text if name_entry is not None else f"leadSystem{system_index + 1}"
        for kind in (PLEAD_SIGNATURE, PLEAD_REFERENCE_SIGNATURE, PSHOW_LEAD_SIGNATURE):
            for offset in _marker_offsets_in_range(metadata, kind, system_offset, system_end):
                global_index += 1
                try:
                    version, label, trailing = _read_labeled_payload_tail(data, source_path, offset, kind)
                    trailing_int32 = (
                        struct.unpack_from(f"<{len(trailing) // 4}i", trailing)
                        if len(trailing) >= 4
                        else ()
                    )
                    trailing_float32 = (
                        struct.unpack_from(f"<{len(trailing) // 4}f", trailing)
                        if len(trailing) >= 4
                        else ()
                    )
                    entries.append(
                        ECGsimCaseLeadObjectInventoryEntry(
                            kind=kind,
                            index=global_index,
                            offset=offset,
                            lead_system_name=system_name,
                            version=version,
                            label=label,
                            trailing_int32=tuple(int(value) for value in trailing_int32),
                            trailing_float32=tuple(float(value) for value in trailing_float32),
                            trailing_bytes=len(trailing),
                            status="parsed",
                            interpretation=(
                                "label and raw trailing numeric fields preserved; polarity, "
                                "reference, and display-layout semantics are not fully decoded"
                            ),
                        )
                    )
                except ECGsimCaseFormatError as exc:
                    entries.append(
                        ECGsimCaseLeadObjectInventoryEntry(
                            kind=kind,
                            index=global_index,
                            offset=offset,
                            lead_system_name=system_name,
                            version=None,
                            label=None,
                            trailing_int32=(),
                            trailing_float32=(),
                            trailing_bytes=0,
                            status="unsupported",
                            interpretation="payload could not be decoded as a labeled lead object",
                            error=str(exc),
                        )
                    )

    return tuple(entries)


def read_ecgsimcase_matrix(path: str | Path, offset: int) -> MatrixData:
    """Read a known ``PMatrix`` payload from an ECGsimcase file.

    This is intentionally offset-driven while the full case object graph is
    still being mapped. The payload shape observed so far is:
    length-prefixed ``PMatrix`` marker, uint32 version, int32 rows, int32 columns,
    then row-major little-endian float32 values.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    version, rows, columns = _read_ecgsimcase_matrix_header(data, source_path, offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PMatrix at {offset} has invalid version {version}")
    if rows <= 0 or columns <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PMatrix at {offset} has invalid shape {rows}x{columns}")

    _marker, values_offset = _read_marker(data, source_path, offset)
    values_offset += 12
    expected_bytes = rows * columns * 4
    if values_offset + expected_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix values at {offset} overrun the file")
    flat = struct.unpack_from(f"<{rows * columns}f", data, values_offset)
    values = tuple(
        tuple(float(flat[row * columns + column]) for column in range(columns))
        for row in range(rows)
    )

    return MatrixData(
        rows=rows,
        columns=columns,
        values=values,
        source_path=source_path,
        storage_format=f"ecgsimcase-pmatrix-v{version}",
    )


def read_ecgsimcase_vector(path: str | Path, offset: int) -> VectorData:
    """Read a known ``PVector`` payload from an ECGsimcase file."""

    source_path = Path(path)
    data = source_path.read_bytes()
    vector = _read_ecgsimcase_vector_payload(data, source_path, offset)
    if vector.length <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PVector at {offset} has invalid length {vector.length}")

    return VectorData(
        length=vector.length,
        values=vector.values,
        source_path=source_path,
        storage_format=vector.storage_format,
    )


def _read_ecgsimcase_geometry_payload(data: bytes, source_path: Path, offset: int) -> GeometryData:
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != PGEOMETRY_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PGeometry")

    if values_offset + 12 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry header at {offset} overruns the file")
    version, _flags, point_count = struct.unpack_from("<iii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PGeometry at {offset} has invalid version {version}")
    if point_count < 0:
        raise ECGsimCaseFormatError(f"{source_path} PGeometry at {offset} has invalid point count {point_count}")

    point_start = values_offset + 12
    point_bytes = point_count * 3 * 4
    triangle_count_offset = point_start + point_bytes
    if triangle_count_offset + 4 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry points at {offset} overrun the file")
    flat_points = struct.unpack_from(f"<{point_count * 3}f", data, point_start) if point_count else ()
    points = tuple(
        (
            float(flat_points[row * 3]),
            float(flat_points[row * 3 + 1]),
            float(flat_points[row * 3 + 2]),
        )
        for row in range(point_count)
    )

    (triangle_count,) = struct.unpack_from("<i", data, triangle_count_offset)
    if triangle_count < 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PGeometry at {offset} has invalid triangle count {triangle_count}"
        )

    triangle_start = triangle_count_offset + 4
    triangle_bytes = triangle_count * 3 * 4
    if triangle_start + triangle_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PGeometry triangles at {offset} overrun the file")
    flat_triangles = (
        struct.unpack_from(f"<{triangle_count * 3}i", data, triangle_start) if triangle_count else ()
    )
    triangles = tuple(
        (
            int(flat_triangles[row * 3]),
            int(flat_triangles[row * 3 + 1]),
            int(flat_triangles[row * 3 + 2]),
        )
        for row in range(triangle_count)
    )
    for triangle in triangles:
        for point_index in triangle:
            if point_index < 0 or point_index >= point_count:
                raise ECGsimCaseFormatError(
                    f"{source_path} PGeometry at {offset} has triangle index {point_index} "
                    f"outside point range 0..{point_count - 1}"
                )

    return GeometryData(
        points=points,
        triangles=triangles,
        units="case-coordinate-units",
        source_index_base=0,
        source_path=source_path,
        storage_format=f"ecgsimcase-pgeometry-v{version}",
    )


def _read_ecgsimcase_graph_geometry_payload(
    data: bytes,
    source_path: Path,
    values_offset: int,
    end_offset: int,
) -> dict[str, object]:
    if end_offset - values_offset < 20:
        raise ECGsimCaseFormatError(f"{source_path} PGraphGeometry at {values_offset} is too short")

    version, scale, flag, point_count = struct.unpack_from("<ifii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PGraphGeometry at {values_offset} has invalid version {version}")
    if point_count < 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PGraphGeometry at {values_offset} has invalid point count {point_count}"
        )

    point_start = values_offset + 16
    point_bytes = point_count * 3 * 4
    triangle_count_offset = point_start + point_bytes
    if triangle_count_offset + 4 > end_offset:
        raise ECGsimCaseFormatError(f"{source_path} PGraphGeometry points at {values_offset} overrun payload")
    flat_points = struct.unpack_from(f"<{point_count * 3}f", data, point_start) if point_count else ()
    points = tuple(
        (
            float(flat_points[row * 3]),
            float(flat_points[row * 3 + 1]),
            float(flat_points[row * 3 + 2]),
        )
        for row in range(point_count)
    )

    (triangle_count,) = struct.unpack_from("<i", data, triangle_count_offset)
    if triangle_count < 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PGraphGeometry at {values_offset} has invalid triangle count {triangle_count}"
        )

    triangle_start = triangle_count_offset + 4
    triangle_bytes = triangle_count * 3 * 4
    if triangle_start + triangle_bytes != end_offset:
        raise ECGsimCaseFormatError(
            f"{source_path} PGraphGeometry at {values_offset} expected payload end "
            f"{triangle_start + triangle_bytes}, found {end_offset}"
        )
    flat_triangles = (
        struct.unpack_from(f"<{triangle_count * 3}i", data, triangle_start)
        if triangle_count
        else ()
    )
    triangles = tuple(
        (
            int(flat_triangles[row * 3]),
            int(flat_triangles[row * 3 + 1]),
            int(flat_triangles[row * 3 + 2]),
        )
        for row in range(triangle_count)
    )
    for triangle in triangles:
        for point_index in triangle:
            if point_index < 0 or point_index >= point_count:
                raise ECGsimCaseFormatError(
                    f"{source_path} PGraphGeometry at {values_offset} has triangle index {point_index} "
                    f"outside point range 0..{point_count - 1}"
                )

    header_byte_count = min(end_offset - values_offset, 48)
    header_value_count = header_byte_count // 4
    header_ints = (
        struct.unpack_from(f"<{header_value_count}i", data, values_offset)
        if header_value_count
        else ()
    )
    header_floats = (
        struct.unpack_from(f"<{header_value_count}f", data, values_offset)
        if header_value_count
        else ()
    )

    return {
        "version": version,
        "scale": float(scale),
        "flag": flag,
        "geometry": GeometryData(
            points=points,
            triangles=triangles,
            units="mm",
            source_index_base=0,
            source_path=source_path,
            storage_format=f"ecgsimcase-pgraphgeometry-v{version}",
        ),
        "header_ints": tuple(int(value) for value in header_ints),
        "header_floats": tuple(float(value) for value in header_floats),
    }


def _read_ecgsimcase_vector_payload(data: bytes, source_path: Path, offset: int) -> ECGsimCaseVector:
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != PVECTOR_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PVector")

    if values_offset + 8 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PVector header at {offset} overruns the file")
    version, length = struct.unpack_from("<ii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(f"{source_path} PVector at {offset} has invalid version {version}")
    if length < 0:
        raise ECGsimCaseFormatError(f"{source_path} PVector at {offset} has invalid length {length}")

    value_start = values_offset + 8
    expected_bytes = length * 4
    if value_start + expected_bytes > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PVector values at {offset} overrun the file")
    values = struct.unpack_from(f"<{length}f", data, value_start) if length else ()
    return ECGsimCaseVector(
        source_offset=offset,
        values=tuple(float(value) for value in values),
        storage_format=f"ecgsimcase-pvector-v{version}",
    )


def _read_ecgsimcase_activation(data: bytes, source_path: Path, offset: int) -> ECGsimCaseActivation:
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != PACTIVATION_CONSTRUCTION_SIGNATURE:
        raise ECGsimCaseFormatError(
            f"{source_path} marker at {offset} is {marker!r}, not PActivationConstruction"
        )
    if values_offset + 8 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PActivationConstruction at {offset} overruns the file")
    version, entry_count = struct.unpack_from("<ii", data, values_offset)
    if version <= 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PActivationConstruction at {offset} has invalid version {version}"
        )
    if entry_count < 0:
        raise ECGsimCaseFormatError(
            f"{source_path} PActivationConstruction at {offset} has invalid entry count {entry_count}"
        )
    record_start = values_offset + 8
    record_stride = 12
    expected_bytes = entry_count * record_stride
    if record_start + expected_bytes > len(data):
        raise ECGsimCaseFormatError(
            f"{source_path} PActivationConstruction records at {offset} overrun the file"
        )
    entries = tuple(
        ECGsimCaseActivationEntry(
            integer_field=integer_field,
            float_field_1=float(float_field_1),
            float_field_2=float(float_field_2),
        )
        for integer_field, float_field_1, float_field_2 in (
            struct.unpack_from("<iff", data, record_start + index * record_stride)
            for index in range(entry_count)
        )
    )
    return ECGsimCaseActivation(
        source_offset=offset,
        version=version,
        entry_count=entry_count,
        entries=entries,
        storage_format=f"ecgsimcase-pactivationconstruction-v{version}-records-iff",
        interpretation=(
            "activation/focus records preserved as raw int32,float32,float32 rows; "
            "field semantics are not yet confirmed"
        ),
    )


def _marker_offsets_in_range(
    metadata: ECGsimCaseMetadata, marker: str, start: int, end: int
) -> tuple[int, ...]:
    return tuple(offset for offset in metadata.marker_offsets.get(marker, ()) if start <= offset < end)


def _all_marker_offsets(metadata: ECGsimCaseMetadata) -> tuple[int, ...]:
    return tuple(sorted(offset for offsets in metadata.marker_offsets.values() for offset in offsets))


def _next_string_after(metadata: ECGsimCaseMetadata, offset: int) -> StringEntry | None:
    return next((entry for entry in metadata.strings if entry.offset > offset), None)


def _labels_for_nested_markers(
    metadata: ECGsimCaseMetadata, marker: str, start: int, end: int, fallback_prefix: str
) -> tuple[str, ...]:
    labels: list[str] = []
    offsets = _marker_offsets_in_range(metadata, marker, start, end)
    for index, offset in enumerate(offsets):
        next_string = _next_string_after(metadata, offset)
        if next_string is not None and next_string.offset < end and not next_string.text.startswith("P"):
            labels.append(next_string.text)
        else:
            labels.append(f"{fallback_prefix}{index + 1}")
    return tuple(labels)


def _slug(value: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in value).strip("-") or "lead-system"


def _source_parameter_units(name: str) -> str:
    return {
        "depolarizationMs": "ms",
        "repolarizationMs": "ms",
        "restingPotential": "mV",
        "amplitude": "mV",
        "plateauSlope": "unknown legacy slope unit",
        "depolarizationSlope": "unknown legacy slope unit",
        "repolarizationSlope": "unknown legacy slope unit",
    }.get(name, "unknown")


def _read_marker(data: bytes, source_path: Path, offset: int) -> tuple[str, int]:
    if offset < 0 or offset + 4 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} marker offset {offset} is outside the file")

    byte_length = struct.unpack_from("<I", data, offset)[0]
    text_start = offset + 4
    text_end = text_start + byte_length
    if text_end > len(data):
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} overruns the file")
    try:
        marker = data[text_start:text_end].decode("utf-16le")
    except UnicodeDecodeError as exc:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is not UTF-16LE") from exc
    return marker, text_end


def _read_ecgsimcase_matrix_header(data: bytes, source_path: Path, offset: int) -> tuple[int, int, int]:
    marker, header_offset = _read_marker(data, source_path, offset)
    if marker != PMATRIX_SIGNATURE:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not PMatrix")
    if header_offset + 12 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} PMatrix header at {offset} overruns the file")
    return struct.unpack_from("<iii", data, header_offset)


def _read_labeled_payload_tail(
    data: bytes,
    source_path: Path,
    offset: int,
    expected_marker: str,
) -> tuple[int, str, bytes]:
    marker, values_offset = _read_marker(data, source_path, offset)
    if marker != expected_marker:
        raise ECGsimCaseFormatError(f"{source_path} marker at {offset} is {marker!r}, not {expected_marker}")
    if values_offset + 8 > len(data):
        raise ECGsimCaseFormatError(f"{source_path} {expected_marker} at {offset} overruns label header")
    version = struct.unpack_from("<i", data, values_offset)[0]
    byte_length = struct.unpack_from("<I", data, values_offset + 4)[0]
    label_start = values_offset + 8
    label_end = label_start + byte_length
    if byte_length % 2 or label_end > len(data):
        raise ECGsimCaseFormatError(f"{source_path} {expected_marker} at {offset} has invalid label length")
    try:
        label = data[label_start:label_end].decode("utf-16le")
    except UnicodeDecodeError as exc:
        raise ECGsimCaseFormatError(f"{source_path} {expected_marker} at {offset} label is not UTF-16LE") from exc
    all_offsets = _all_marker_offsets(read_ecgsimcase_metadata(source_path)) + (len(data),)
    end_offset = next(next_offset for next_offset in all_offsets if next_offset > offset)
    return version, label, data[label_end:end_offset]


def _matrix_role_hint(
    offset: int,
    rows: int | None,
    columns: int | None,
    index: int,
    signal_rows: int | None,
    signal_columns: int | None,
    graph_counts: tuple[int, ...],
    source_counts: tuple[int, ...],
    lead_counts_by_offset: dict[int, tuple[int, int, int]],
) -> str:
    if rows is None or columns is None:
        return "unsupported PMatrix header"
    if rows <= 0 or columns <= 0:
        if offset in lead_counts_by_offset:
            return "empty lead-system transform placeholder"
        return "empty matrix placeholder"
    if index == 1 and rows == signal_rows and columns == signal_columns:
        return "root thorax-node surface-potential time series"
    if rows == signal_rows and columns in graph_counts + source_counts:
        return "thorax-by-source transfer matrix candidate"
    if rows in graph_counts + source_counts and columns in graph_counts + source_counts:
        if rows == columns:
            return "source graph distance/adjacency or source transfer candidate"
        return "source matrix candidate"
    owner_counts = lead_counts_by_offset.get(offset)
    if owner_counts is not None:
        electrode_count, lead_count, shown_lead_count = owner_counts
        if columns == electrode_count and rows in (3, lead_count, shown_lead_count):
            return "lead-system transform candidate"
        return "lead-system matrix candidate with unresolved transform semantics"
    return "unclassified PMatrix payload"


def find_length_prefixed_utf16le(
    data: bytes, *, min_chars: int = 3, max_chars: int = 256
) -> list[StringEntry]:
    """Find plausible uint32 length-prefixed UTF-16LE strings."""

    hits: list[StringEntry] = []
    limit = len(data) - 4
    offset = 0
    while offset <= limit:
        (byte_length,) = struct.unpack_from("<I", data, offset)
        if (
            byte_length >= min_chars * 2
            and byte_length <= max_chars * 2
            and byte_length % 2 == 0
            and offset + 4 + byte_length <= len(data)
        ):
            raw = data[offset + 4 : offset + 4 + byte_length]
            try:
                text = raw.decode("utf-16le")
            except UnicodeDecodeError:
                offset += 1
                continue
            if "\x00" not in text and is_reasonable_text(text):
                hits.append(StringEntry(offset, byte_length, text))
                offset += 4 + byte_length
                continue
        offset += 1
    return hits


def shannon_entropy(data: bytes) -> float:
    """Return byte-level Shannon entropy in bits per byte."""

    if not data:
        return 0.0
    counts = [0] * 256
    for byte in data:
        counts[byte] += 1
    total = len(data)
    entropy = 0.0
    for count in counts:
        if count:
            probability = count / total
            entropy -= probability * math.log2(probability)
    return entropy


def is_reasonable_text(text: str) -> bool:
    if not text:
        return False
    good = 0
    for ch in text:
        code = ord(ch)
        if ch in "\r\n\t" or PRINTABLE_MIN <= code <= PRINTABLE_MAX:
            good += 1
    return good / len(text) >= 0.85
