"""Legacy ECGSIM readers and writers."""

from ecgsim.io.matrix import MatrixData, MatrixFormatError, VectorData, read_matrix, read_vector

__all__ = [
    "MatrixData",
    "MatrixFormatError",
    "VectorData",
    "read_matrix",
    "read_vector",
]
