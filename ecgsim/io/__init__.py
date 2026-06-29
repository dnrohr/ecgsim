"""Legacy ECGSIM readers and writers."""

from ecgsim.io.ecgsimcase import (
    ECGsimCaseFormatError,
    ECGsimCaseMetadata,
    StringEntry,
    read_ecgsimcase_metadata,
)
from ecgsim.io.geometry import GeometryData, GeometryFormatError, read_geometry
from ecgsim.io.matrix import MatrixData, MatrixFormatError, VectorData, read_matrix, read_vector

__all__ = [
    "ECGsimCaseFormatError",
    "ECGsimCaseMetadata",
    "GeometryData",
    "GeometryFormatError",
    "MatrixData",
    "MatrixFormatError",
    "StringEntry",
    "VectorData",
    "read_ecgsimcase_metadata",
    "read_geometry",
    "read_matrix",
    "read_vector",
]
