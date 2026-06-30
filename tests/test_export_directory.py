import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from ecgsim.io import (
    export_case_directory,
    load_case,
    read_ecgsimcase_matrix,
    read_geometry,
    read_matrix,
    read_vector,
)


CASE = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")


class ExportDirectoryTests(unittest.TestCase):
    def test_exports_supported_case_files_readable_by_project_readers(self) -> None:
        case = load_case(CASE)

        with tempfile.TemporaryDirectory() as tmp:
            output_dir = Path(tmp) / "normal-export"
            result = export_case_directory(case, output_dir)

            self.assertEqual(result.output_dir, output_dir)
            self.assertTrue((output_dir / "metadata.json").exists())
            self.assertTrue((output_dir / "model" / "ventricle.tri").exists())
            self.assertTrue((output_dir / "model" / "thorax.tri").exists())
            self.assertTrue((output_dir / "ecgs" / "thorax.refECG").exists())
            self.assertTrue((output_dir / "ventricular_beats" / "beat1" / "user.dep").exists())

            heart = next(geometry for geometry in case.geometries if geometry.name == "heart")
            exported_heart = read_geometry(output_dir / "model" / "ventricle.tri")
            self.assertEqual(exported_heart.point_count, heart.point_count)
            self.assertEqual(exported_heart.triangle_count, heart.triangle_count)
            self.assertEqual(exported_heart.source_index_base, 1)
            self.assertEqual(exported_heart.units, "m")
            self.assertAlmostEqual(exported_heart.points[0][0], heart.geometry.points[0][0] / 1000)

            ventricles = next(source for source in case.sources if source.kind == "ventricles")
            depolarization = next(
                parameter
                for parameter in ventricles.beats[0].parameters
                if parameter.name == "depolarizationMs"
            )
            exported_depolarization = read_vector(
                output_dir / "ventricular_beats" / "beat1" / "user.dep"
            )
            self.assertEqual(exported_depolarization.length, depolarization.adapted.length)
            self.assertAlmostEqual(exported_depolarization.values[0], depolarization.adapted.values[0])

            source_matrix = read_ecgsimcase_matrix(CASE, case.signal_metadata.matrix_offset)
            exported_matrix = read_matrix(output_dir / "ecgs" / "thorax.refECG")
            self.assertEqual(exported_matrix.rows, source_matrix.rows)
            self.assertEqual(exported_matrix.columns, source_matrix.columns)
            self.assertAlmostEqual(exported_matrix.values[0][0], source_matrix.values[0][0])

            metadata = json.loads((output_dir / "metadata.json").read_text(encoding="utf-8"))
            self.assertEqual(metadata["format"], "org.ecgsim.export-directory")
            self.assertIn("model/ventricle.tri", metadata["writtenFiles"])
            self.assertIn("ecgs/thorax.refECG", metadata["writtenFiles"])
            self.assertIn("electrode .elec files", metadata["unsupportedMembers"])
            self.assertIn("TMP waveform .user.source matrices", metadata["unsupportedMembers"])

    def test_module_command_exports_case(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            output_dir = Path(tmp) / "cli-export"
            result = subprocess.run(
                [sys.executable, "-m", "ecgsim.cli.export_case", str(CASE), str(output_dir)],
                check=True,
                capture_output=True,
                text=True,
            )

            self.assertIn("exported:", result.stdout)
            self.assertIn("unsupported_members:", result.stdout)
            self.assertTrue((output_dir / "metadata.json").exists())
            self.assertTrue((output_dir / "model" / "thorax.tri").exists())
