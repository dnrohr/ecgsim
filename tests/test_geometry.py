from pathlib import Path
import struct
import tempfile
import unittest

from ecgsim.io import GeometryFormatError, read_geometry


class GeometryReaderTests(unittest.TestCase):
    LEGACY_CASES = {
        "heart.tri": (257, 510, (0.0473, 0.0409, 0.0428), (49, 50, 143)),
        "lcav.tri": (72, 140, (-0.0025, 0.0549, 0.0178), (6, 7, 1)),
        "llung.tri": (116, 228, (-0.0127, 0.0429, 0.1500), (0, 2, 1)),
        "rcav.tri": (107, 210, (0.0107, 0.0103, -0.0145), (10, 12, 11)),
        "rlung.tri": (116, 228, (-0.0098, -0.0594, 0.1500), (0, 2, 1)),
        "thorax.tri": (300, 596, (-0.0379, -0.2285, 0.1250), (96, 264, 293)),
    }

    def test_reads_all_archived_ascii_tri_files(self) -> None:
        root = Path("research/source/www.ecgsim.org/downloads/other13/geometry")

        for name, (points, triangles, first_point, first_triangle) in self.LEGACY_CASES.items():
            with self.subTest(name=name):
                geometry = read_geometry(root / name)

                self.assertEqual(geometry.point_count, points)
                self.assertEqual(geometry.triangle_count, triangles)
                self.assertEqual(geometry.storage_format, "ascii-tri")
                self.assertEqual(geometry.units, "m")
                self.assertEqual(geometry.source_index_base, 1)
                self.assertEqual(geometry.points[0], first_point)
                self.assertEqual(geometry.triangles[0], first_triangle)

    def test_reads_ascii_geometry_without_triangles(self) -> None:
        path = self.write_fixture("2\n1 0 0 0\n2 1 0 0\n")

        geometry = read_geometry(path)

        self.assertEqual(geometry.point_count, 2)
        self.assertEqual(geometry.triangle_count, 0)

    def test_rejects_malformed_ascii_geometry(self) -> None:
        path = self.write_fixture("1\n1 0 0 0\n1\n1 1 2 3\n")

        with self.assertRaises(GeometryFormatError):
            read_geometry(path)

    def test_reads_mbftri_binary_geometry(self) -> None:
        header = b";;mbftri" + b"\0" + struct.pack("<i", 0) + b"\0\0\0"
        body = struct.pack("<ii", 3, 3) + b"\0" + struct.pack("<ii", 1, 3)
        points_column_major = struct.pack("<9d", 0, 1, 0, 0, 0, 1, 0, 0, 0)
        triangles_column_major = struct.pack("<3i", 0, 1, 2)
        path = self.write_fixture(header + body + points_column_major + triangles_column_major)

        geometry = read_geometry(path)

        self.assertEqual(geometry.point_count, 3)
        self.assertEqual(geometry.triangle_count, 1)
        self.assertEqual(geometry.source_index_base, 0)
        self.assertEqual(geometry.storage_format, "mbftri")
        self.assertEqual(geometry.points, ((0.0, 0.0, 0.0), (1.0, 0.0, 0.0), (0.0, 1.0, 0.0)))
        self.assertEqual(geometry.triangles, ((0, 1, 2),))

    def write_fixture(self, content: str | bytes) -> Path:
        handle = tempfile.NamedTemporaryFile(delete=False, suffix=".tri")
        path = Path(handle.name)
        mode_content = content.encode("ascii") if isinstance(content, str) else content
        with handle:
            handle.write(mode_content)
        self.addCleanup(path.unlink, missing_ok=True)
        return path
