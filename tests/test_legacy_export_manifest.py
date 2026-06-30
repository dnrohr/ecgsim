from pathlib import Path
import tempfile
import unittest

from tools.summarize_legacy_export import build_manifest


class LegacyExportManifestTests(unittest.TestCase):
    def test_manifest_classifies_shapes_and_parity_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ecgs = root / "ecgs"
            model = root / "model"
            beat = root / "ventricular_beats" / "beat1"
            ecgs.mkdir()
            model.mkdir()
            beat.mkdir(parents=True)

            (ecgs / "standard.refECG").write_text("2 3\n1 2 3\n4 5 6\n", encoding="ascii")
            (ecgs / "standard.adaptECG").write_text("2 3\n1 1 1\n2 2 2\n", encoding="ascii")
            (beat / "user.dep").write_text("3 1\n10\n20\n30\n", encoding="ascii")
            (beat / "user.source").write_text("2 2\n-80 -79\n20 21\n", encoding="ascii")
            (model / "ventricle.tri").write_text(
                "3\n1 0 0 0\n2 1 0 0\n3 0 1 0\n1\n1 1 2 3\n",
                encoding="ascii",
            )

            manifest = build_manifest(root)

        self.assertEqual(manifest["fileCount"], 5)
        self.assertTrue(manifest["readyForNumericalParity"])
        self.assertEqual(
            manifest["parityArtifacts"]["tmpSource"]["paths"],
            ["ventricular_beats/beat1/user.source"],
        )

        files = {entry["path"]: entry for entry in manifest["files"]}
        self.assertEqual(files["ecgs/standard.refECG"]["classification"], "reference-ecg-matrix")
        self.assertEqual(files["ecgs/standard.refECG"]["numericSummary"]["rows"], 2)
        self.assertEqual(files["ecgs/standard.refECG"]["numericSummary"]["columns"], 3)
        self.assertEqual(
            files["ventricular_beats/beat1/user.dep"]["classification"],
            "source-parameter-vector",
        )
        self.assertEqual(files["ventricular_beats/beat1/user.dep"]["numericSummary"]["length"], 3)
        self.assertEqual(files["model/ventricle.tri"]["classification"], "geometry-triangulation")
        self.assertEqual(files["model/ventricle.tri"]["numericSummary"]["points"], 3)

    def test_manifest_reports_missing_raw_artifacts(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "notes.txt").write_text("manual capture notes\n", encoding="utf-8")

            manifest = build_manifest(root)

        self.assertFalse(manifest["readyForNumericalParity"])
        self.assertFalse(manifest["parityArtifacts"]["tmpSource"]["present"])
        self.assertFalse(manifest["parityArtifacts"]["adaptedEcg"]["present"])
        self.assertFalse(manifest["parityArtifacts"]["referenceEcg"]["present"])
        self.assertEqual(manifest["files"][0]["classification"], "unknown")
        self.assertIsNone(manifest["files"][0]["numericSummary"])
