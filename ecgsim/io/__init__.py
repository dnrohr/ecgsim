"""Legacy ECGSIM readers and writers."""

from ecgsim.io.geometry import GeometryData, GeometryFormatError, read_geometry
from ecgsim.io.matrix import MatrixData, MatrixFormatError, VectorData, read_matrix, read_vector

__all__ = [
    "GeometryData",
    "GeometryFormatError",
    "MatrixData",
    "MatrixFormatError",
    "VectorData",
    "read_geometry",
    "read_matrix",
    "read_vector",
]
