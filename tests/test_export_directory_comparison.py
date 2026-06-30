from pathlib import Path
import tempfile
import unittest

from tools.compare_export_directories import compare_export_directories


class ExportDirectoryComparisonTests(unittest.TestCase):
    def test_matching_supported_export_files_pass(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            legacy = root / "legacy"
            modern = root / "modern"
            write_supported_subset(legacy)
            write_supported_subset(modern)

            report = compare_export_directories(legacy, modern)

        self.assertEqual(report["status"], "passed")
        self.assertEqual(report["failedCount"], 0)
        self.assertEqual(report["comparedCount"], 3)
        paths = {item["path"]: item for item in report["comparisons"]}
        self.assertEqual(paths["ecgs/thorax.refECG"]["status"], "passed")
        self.assertEqual(paths["ventricular_beats/beat1/user.dep"]["status"], "passed")
        self.assertEqual(paths["model/ventricle.tri"]["status"], "passed")

    def test_value_mismatch_fails_with_diagnostic(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            legacy = root / "legacy"
            modern = root / "modern"
            write_supported_subset(legacy)
            write_supported_subset(modern)
            (legacy / "ecgs" / "thorax.refECG").write_text("2 2\n1 2\n3 99\n", encoding="ascii")

            report = compare_export_directories(legacy, modern)

        self.assertEqual(report["status"], "failed")
        mismatch = next(item for item in report["comparisons"] if item["path"] == "ecgs/thorax.refECG")
        self.assertEqual(mismatch["status"], "failed")
        self.assertIn("index 3", mismatch["message"])
        self.assertIn("actual=99.0", mismatch["message"])

    def test_missing_legacy_file_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            legacy = root / "legacy"
            modern = root / "modern"
            write_supported_subset(legacy)
            write_supported_subset(modern)
            (legacy / "ventricular_beats" / "beat1" / "user.dep").unlink()

            report = compare_export_directories(legacy, modern)

        self.assertEqual(report["status"], "failed")
        missing = next(
            item for item in report["comparisons"] if item["path"] == "ventricular_beats/beat1/user.dep"
        )
        self.assertEqual(missing["status"], "missing-in-legacy")


def write_supported_subset(root: Path) -> None:
    (root / "ecgs").mkdir(parents=True)
    (root / "model").mkdir(parents=True)
    (root / "ventricular_beats" / "beat1").mkdir(parents=True)
    (root / "ecgs" / "thorax.refECG").write_text("2 2\n1 2\n3 4\n", encoding="ascii")
    (root / "ventricular_beats" / "beat1" / "user.dep").write_text(
        "3 1\n10\n20\n30\n",
        encoding="ascii",
    )
    (root / "model" / "ventricle.tri").write_text(
        "3\n1 0 0 0\n2 1 0 0\n3 0 1 0\n1\n1 1 2 3\n",
        encoding="ascii",
    )
