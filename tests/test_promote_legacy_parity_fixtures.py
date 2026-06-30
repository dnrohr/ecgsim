from pathlib import Path
import tempfile
import unittest

from tools.promote_legacy_parity_fixtures import promote_fixtures


class PromoteLegacyParityFixturesTests(unittest.TestCase):
    def test_promotes_selected_artifacts_and_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            capture = root / "capture"
            output = root / "fixtures" / "normal-male"
            write_capture(capture)

            manifest = promote_fixtures(capture, output, artifacts=("tmpSource",), case_id="normal-male")

            promoted = output / "ventricular_beats" / "beat1" / "user.source"
            self.assertTrue(promoted.exists())
            self.assertEqual(promoted.read_text(encoding="ascii"), "2 2\n-80 -79\n20 21\n")
            self.assertEqual(manifest["schema"], "org.ecgsim.legacy-parity-fixture-set")
            self.assertEqual(manifest["caseId"], "normal-male")
            self.assertEqual(manifest["artifactNames"], ["tmpSource"])
            self.assertEqual(manifest["fileCount"], 1)
            self.assertEqual(manifest["files"][0]["path"], "ventricular_beats/beat1/user.source")
            self.assertEqual(manifest["files"][0]["numericSummary"]["rows"], 2)
            self.assertTrue((output / "manifest.json").exists())

    def test_requires_requested_artifacts_to_exist(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            capture = root / "capture"
            output = root / "fixtures"
            write_capture(capture, include_adapted=False)

            with self.assertRaisesRegex(ValueError, "adaptedEcg"):
                promote_fixtures(capture, output, artifacts=("adaptedEcg",))

            self.assertFalse(output.exists())


def write_capture(capture: Path, *, include_adapted: bool = True) -> None:
    ecgs = capture / "ecgs"
    beat = capture / "ventricular_beats" / "beat1"
    ecgs.mkdir(parents=True)
    beat.mkdir(parents=True)
    (ecgs / "lead.refECG").write_text("2 2\n1 2\n3 4\n", encoding="ascii")
    if include_adapted:
        (ecgs / "lead.adaptECG").write_text("2 2\n1 2\n3 5\n", encoding="ascii")
    (beat / "user.source").write_text("2 2\n-80 -79\n20 21\n", encoding="ascii")
