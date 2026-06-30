"""Legacy ECGSIM readers and writers."""

from ecgsim.io.ecgsimcase import (
    ECGsimCaseFormatError,
    ECGsimCaseGeometry,
    ECGsimCaseMetadata,
    StringEntry,
    read_ecgsimcase_geometries,
    read_ecgsimcase_matrix,
    read_ecgsimcase_metadata,
    read_ecgsimcase_vector,
)
from ecgsim.io.geometry import GeometryData, GeometryFormatError, read_geometry
from ecgsim.io.matrix import MatrixData, MatrixFormatError, VectorData, read_matrix, read_vector

__all__ = [
    "ECGsimCaseFormatError",
    "ECGsimCaseGeometry",
    "ECGsimCaseMetadata",
    "GeometryData",
    "GeometryFormatError",
    "MatrixData",
    "MatrixFormatError",
    "StringEntry",
    "VectorData",
    "read_ecgsimcase_geometries",
    "read_ecgsimcase_matrix",
    "read_ecgsimcase_metadata",
    "read_ecgsimcase_vector",
    "read_geometry",
    "read_matrix",
    "read_vector",
]
