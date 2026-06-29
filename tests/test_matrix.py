from pathlib import Path
import struct
import tempfile
import unittest

from ecgsim.io import MatrixFormatError, read_matrix, read_vector


class MatrixReaderTests(unittest.TestCase):
    def test_reads_ascii_matrix(self) -> None:
        path = self.write_fixture("2 3\n1 2 3\n4.5 -5 6e1\n")

        matrix = read_matrix(path)

        self.assertEqual(matrix.rows, 2)
        self.assertEqual(matrix.columns, 3)
        self.assertEqual(matrix.storage_format, "ascii")
        self.assertEqual(matrix.values[0], (1.0, 2.0, 3.0))
        self.assertEqual(matrix.values[1], (4.5, -5.0, 60.0))

    def test_reads_ascii_vector(self) -> None:
        path = self.write_fixture("3 1\n10\n11.5\n-2\n")

        vector = read_vector(path)

        self.assertEqual(vector.length, 3)
        self.assertEqual(vector.values, (10.0, 11.5, -2.0))
        self.assertEqual(vector.storage_format, "ascii")

    def test_rejects_non_vector_matrix_as_vector(self) -> None:
        path = self.write_fixture("1 2\n1 2\n")

        with self.assertRaises(MatrixFormatError):
            read_vector(path)

    def test_rejects_malformed_ascii_matrix(self) -> None:
        path = self.write_fixture("2 2\n1 2 3\n")

        with self.assertRaises(MatrixFormatError):
            read_matrix(path)

    def test_reads_raw_binary_matrix_as_column_major(self) -> None:
        payload = struct.pack("<ii6f", 2, 3, 1, 4, 2, 5, 3, 6)
        path = self.write_fixture(payload)

        matrix = read_matrix(path)

        self.assertEqual(matrix.rows, 2)
        self.assertEqual(matrix.columns, 3)
        self.assertEqual(matrix.storage_format, "binary-float32")
        self.assertEqual(matrix.values, ((1.0, 2.0, 3.0), (4.0, 5.0, 6.0)))

    def test_reads_mbfmat_binary_matrix_as_column_major(self) -> None:
        header = b";;mbfmat" + b"\0" + struct.pack("<i", 0) + b"\0\0\0"
        payload = header + struct.pack("<ii6d", 2, 3, 1, 4, 2, 5, 3, 6)
        path = self.write_fixture(payload)

        matrix = read_matrix(path)

        self.assertEqual(matrix.rows, 2)
        self.assertEqual(matrix.columns, 3)
        self.assertEqual(matrix.storage_format, "mbfmat-float64")
        self.assertEqual(matrix.values, ((1.0, 2.0, 3.0), (4.0, 5.0, 6.0)))

    def test_reads_archived_transfer_matrix_header_and_values(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/other13/geometry/wct.tra")

        matrix = read_matrix(path)

        self.assertEqual(matrix.rows, 300)
        self.assertEqual(matrix.columns, 257)
        self.assertAlmostEqual(matrix.values[0][0], -0.0137004)
        self.assertAlmostEqual(matrix.values[0][1], 0.00375359)

    def write_fixture(self, content: str | bytes) -> Path:
        suffix = ".mat"
        handle = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        path = Path(handle.name)
        mode_content = content.encode("ascii") if isinstance(content, str) else content
        with handle:
            handle.write(mode_content)
        self.addCleanup(path.unlink, missing_ok=True)
        return path
