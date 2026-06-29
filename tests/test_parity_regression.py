import hashlib
import json
from pathlib import Path
import unittest

from ecgsim.io import read_ecgsimcase_matrix, read_ecgsimcase_vector, read_geometry


class ParityRegressionTests(unittest.TestCase):
    def test_legacy_screenshot_manifest_matches_tracked_file(self) -> None:
        manifest_path = Path("research/legacy-exports/screenshots-manifest.json")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest["fileCount"], 1)
        self.assertEqual(manifest["totalBytes"], 292650)
        entry = manifest["files"][0]
        self.assertEqual(entry["path"], "normal-male-main-window.png")

        screenshot_path = Path("research/legacy-exports/screenshots") / entry["path"]
        payload = screenshot_path.read_bytes()
        self.assertEqual(len(payload), entry["bytes"])
        self.assertEqual(hashlib.sha256(payload).hexdigest(), entry["sha256"])

    def test_viewer_geometry_fixtures_match_source_counts_and_rounding(self) -> None:
        root = Path("research/source/www.ecgsim.org/downloads/other13/geometry")
        fixture_expectations = [
            ("app/viewer/public/fixtures/heart.json", "heart.tri", None),
            ("app/viewer/public/fixtures/thorax.json", "thorax.tri", "thorax"),
            ("app/viewer/public/fixtures/thorax.json", "llung.tri", "leftLung"),
            ("app/viewer/public/fixtures/thorax.json", "rlung.tri", "rightLung"),
        ]

        for fixture_path, source_name, mesh_name in fixture_expectations:
            with self.subTest(source=source_name):
                source = read_geometry(root / source_name)
                fixture = json.loads(Path(fixture_path).read_text(encoding="utf-8"))
                mesh = fixture["meshes"][mesh_name] if mesh_name else fixture

                self.assertEqual(mesh["pointCount"], source.point_count)
                self.assertEqual(mesh["triangleCount"], source.triangle_count)
                self.assertEqual(tuple(mesh["triangles"][0]), source.triangles[0])
                for actual, expected in zip(mesh["points"][0], source.points[0]):
                    self.assertAlmostEqual(actual, expected, delta=5e-5)

    def test_signal_fixture_matches_known_case_payload_shape_and_samples(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/ecg-signals.json").read_text(encoding="utf-8"))

        self.assertEqual(fixture["rows"], 300)
        self.assertEqual(fixture["columns"], 1000)
        self.assertEqual(fixture["sampleRateHz"], 1000)
        self.assertEqual(fixture["units"], "mV")
        self.assertEqual(len(fixture["traces"]), 6)
        self.assertEqual(len(fixture["traces"][0]["values"]), 1000)

        matrix = read_ecgsimcase_matrix(Path(fixture["source"]), fixture["sourceMatrixOffset"])
        self.assertEqual(matrix.rows, fixture["rows"])
        self.assertEqual(matrix.columns, fixture["columns"])
        self.assertAlmostEqual(fixture["traces"][0]["values"][0], matrix.values[0][0], delta=1e-6)
        self.assertAlmostEqual(fixture["traces"][0]["values"][999], matrix.values[0][999], delta=1e-6)

    def test_tmp_fixture_matches_known_parameter_vectors(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/tmp-waveforms.json").read_text(encoding="utf-8"))

        self.assertEqual(fixture["nodeCount"], 576)
        self.assertEqual(fixture["sampleCount"], 576)
        self.assertEqual(fixture["sampleRateHz"], 1000)
        self.assertEqual(len(fixture["nodes"]), 5)

        path = Path(fixture["source"])
        depolarization = read_ecgsimcase_vector(path, 11272300)
        self.assertEqual(depolarization.length, fixture["nodeCount"])
        self.assertAlmostEqual(
            fixture["nodes"][0]["parameters"]["depolarizationMs"]["initial"],
            depolarization.values[0],
            delta=1e-6,
        )
        self.assertAlmostEqual(
            fixture["nodes"][-1]["parameters"]["depolarizationMs"]["initial"],
            depolarization.values[575],
            delta=1e-6,
        )
