from pathlib import Path
import tempfile
import unittest

from ecgsim.io import export_case_directory
from tools.read_ecgsim_compatibility import read_ecgsim_compatibility_report


CASE = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")


class ReadECGsimCompatibilityTests(unittest.TestCase):
    def test_reports_readable_ascii_files_and_missing_full_requirements(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write_minimal_export(root)
            report = read_ecgsim_compatibility_report(root)

        self.assertEqual(report["status"], "partial")
        self.assertEqual(report["unreadableCount"], 0)
        readable_paths = {item["path"] for item in report["readableFiles"]}
        self.assertIn("model/ventricle.tri", readable_paths)
        self.assertIn("ventricular_beats/beat1/user.dep", readable_paths)
        required = {item["path"]: item for item in report["requiredFiles"]}
        self.assertTrue(required["model/ventricle.tri"]["present"])
        self.assertFalse(required["model/ventricle.adj2d"]["present"])
        self.assertFalse(required["ecgs/standard_12.elec"]["present"])

    def test_generated_modern_export_is_partial_read_ecgsim_subset(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            export_dir = Path(tmp) / "normal-export"
            export_case_directory(CASE, export_dir)
            report = read_ecgsim_compatibility_report(export_dir)

        self.assertEqual(report["status"], "partial")
        self.assertEqual(report["unreadableCount"], 0)
        self.assertGreaterEqual(report["readableCount"], 10)
        readable = {item["path"]: item for item in report["readableFiles"]}
        self.assertEqual(readable["model/ventricle.tri"]["reader"], "loadtri-compatible-ascii")
        self.assertEqual(readable["ventricular_beats/beat1/user.source"]["reader"], "loadmat-compatible-ascii")
        required = {item["path"]: item for item in report["requiredFiles"]}
        self.assertTrue(required["model/thorax.tri"]["present"])
        self.assertFalse(required["model/ventricles2Thorax.mat"]["present"])
        self.assertFalse(required["ecgs/thorax.elec"]["present"])


def write_minimal_export(root: Path) -> None:
    (root / "model").mkdir(parents=True)
    (root / "ecgs").mkdir(parents=True)
    (root / "ventricular_beats" / "beat1").mkdir(parents=True)
    (root / "model" / "ventricle.tri").write_text(
        "3\n1 0 0 0\n2 1 0 0\n3 0 1 0\n1\n1 1 2 3\n",
        encoding="ascii",
    )
    (root / "ecgs" / "standard_12.refECG").write_text("2 3\n0 1 0\n1 0 -1\n", encoding="ascii")
    (root / "ventricular_beats" / "beat1" / "user.dep").write_text("3 1\n10\n20\n30\n", encoding="ascii")


if __name__ == "__main__":
    unittest.main()
