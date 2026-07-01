import json
import math
from pathlib import Path
import unittest

from ecgsim.core import (
    assert_numeric_matrices_close,
    assert_numeric_sequences_close,
    compare_numeric_matrices,
    compare_numeric_sequences,
    generate_tmp_matrix_from_vectors,
)
from ecgsim.io import (
    read_ecgsimcase_matrix,
    read_ecgsimcase_sources,
    read_legacy_row_major_matrix,
    read_vector,
)
from tools.promote_legacy_parity_fixtures import verify_fixture_manifest


class NumericalParityHarnessTests(unittest.TestCase):
    def test_compare_numeric_sequences_accepts_abs_or_relative_tolerance(self) -> None:
        comparison = compare_numeric_sequences(
            (1.0, 1000.0),
            (1.0 + 5e-7, 1000.001),
            abs_tolerance=1e-6,
            rel_tolerance=1e-6,
        )

        self.assertTrue(comparison.passed, comparison.diagnostic("tolerance smoke"))
        self.assertEqual(comparison.compared_count, 2)

    def test_injected_difference_fails_with_index_and_values(self) -> None:
        with self.assertRaisesRegex(AssertionError, "index 1"):
            assert_numeric_sequences_close(
                (1.0, 2.25, 3.0),
                (1.0, 2.0, 3.0),
                abs_tolerance=1e-6,
                rel_tolerance=1e-6,
                label="injected difference",
            )

    def test_matrix_comparison_reports_shape_max_and_rms_diagnostics(self) -> None:
        comparison = compare_numeric_matrices(
            ((1.0, 2.0), (3.0, 4.0)),
            ((1.0, 2.0), (3.0, 6.0)),
            max_abs_tolerance=0.5,
            rms_tolerance=0.5,
        )

        self.assertFalse(comparison.passed)
        self.assertEqual(comparison.compared_count, 4)
        self.assertEqual(comparison.worst_mismatch.index, 3)
        self.assertIn("row 1, column 1", comparison.diagnostic("matrix injection"))
        self.assertIn("max_abs_error=2", comparison.diagnostic("matrix injection"))
        self.assertIn("rms_error=1", comparison.diagnostic("matrix injection"))

        shape_comparison = compare_numeric_matrices(
            ((1.0, 2.0),),
            ((1.0,),),
            max_abs_tolerance=0.0,
            rms_tolerance=0.0,
        )
        self.assertFalse(shape_comparison.passed)
        self.assertIn("shape differs", shape_comparison.diagnostic("shape injection"))

    def test_assert_numeric_matrices_close_fails_with_position_diagnostic(self) -> None:
        with self.assertRaisesRegex(AssertionError, "row 0, column 1"):
            assert_numeric_matrices_close(
                ((0.0, 10.0),),
                ((0.0, 0.0),),
                max_abs_tolerance=1e-6,
                rms_tolerance=1e-6,
                label="injected matrix difference",
            )

    def test_surface_potential_fixture_matches_source_matrix_samples(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/ecg-signals.json").read_text(encoding="utf-8"))
        matrix = read_ecgsimcase_matrix(Path(fixture["source"]), fixture["sourceMatrixOffset"])

        expected = [matrix.values[row][column] for row, column in ((0, 0), (0, 575), (299, 0), (299, 575))]
        actual = [
            fixture["surfaceMap"]["valuesByNode"][row][column]
            for row, column in ((0, 0), (0, 575), (299, 0), (299, 575))
        ]

        assert_numeric_sequences_close(
            actual,
            expected,
            abs_tolerance=1e-6,
            rel_tolerance=1e-6,
            label="surface potential fixture samples",
        )

    def test_tmp_parameter_fixture_matches_parsed_source_samples(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/tmp-waveforms.json").read_text(encoding="utf-8"))
        ventricles = next(source for source in read_ecgsimcase_sources(Path(fixture["source"])) if source.kind == "ventricles")
        parameters = {parameter.name: parameter for parameter in ventricles.beats[0].parameters}
        depolarization = parameters["depolarizationMs"].initial.values

        actual = [
            fixture["parameterVectors"]["depolarizationMs"]["initial"][index]
            for index in (0, 143, 287, 431, 575)
        ]
        expected = [depolarization[index] for index in (0, 143, 287, 431, 575)]

        assert_numeric_sequences_close(
            actual,
            expected,
            abs_tolerance=1e-6,
            rel_tolerance=1e-6,
            label="TMP depolarization fixture samples",
        )

    def test_promoted_legacy_fixture_scenario_has_readable_numerical_artifacts(self) -> None:
        fixture_root = Path("tests/fixtures/legacy-parity/normal-male-ecgsim301")
        verification = verify_fixture_manifest(fixture_root)
        self.assertEqual(verification["status"], "passed")

        manifest = json.loads((fixture_root / "manifest.json").read_text(encoding="utf-8"))
        matrix_entries = [
            entry
            for entry in manifest["files"]
            if entry["classification"] in {
                "tmp-source-matrix",
                "reference-ecg-matrix",
                "adapted-ecg-matrix",
            }
        ]
        self.assertEqual(len(matrix_entries), 7)

        shapes = {}
        for entry in matrix_entries:
            with self.subTest(path=entry["path"]):
                matrix = read_legacy_row_major_matrix(fixture_root / entry["path"])
                summary = entry["numericSummary"]
                shapes[entry["path"]] = (matrix.rows, matrix.columns)
                self.assertEqual(matrix.storage_format, "binary-float32-row-major")
                self.assertEqual((matrix.rows, matrix.columns), (summary["rows"], summary["columns"]))
                self.assertGreater(_matrix_dynamic_range(matrix.values), 0.0)
                self.assertTrue(all(math.isfinite(value) for row in matrix.values for value in row))

        self.assertEqual(shapes["ventricular_beats/beat1/user.source"], (257, 505))
        self.assertEqual(shapes["ecgs/standard_12.refECG"], (12, 500))
        self.assertEqual(shapes["ecgs/standard_12.adaptECG"], (12, 505))
        self.assertEqual(shapes["ecgs/BSM_(nijmegen_64).refECG"], (64, 500))

    def test_promoted_normal_young_legacy_ecg_scenario_has_readable_artifacts(self) -> None:
        fixture_root = Path("tests/fixtures/legacy-parity/normal-young-male-ecgsim301")
        verification = verify_fixture_manifest(fixture_root)
        self.assertEqual(verification["status"], "passed")

        manifest = json.loads((fixture_root / "manifest.json").read_text(encoding="utf-8"))
        self.assertEqual(manifest["artifactNames"], ["referenceEcg", "adaptedEcg"])
        self.assertEqual(manifest["fileCount"], 6)
        shapes = {}
        for entry in manifest["files"]:
            with self.subTest(path=entry["path"]):
                matrix = read_legacy_row_major_matrix(fixture_root / entry["path"])
                summary = entry["numericSummary"]
                shapes[entry["path"]] = (matrix.rows, matrix.columns)
                self.assertEqual(matrix.storage_format, "binary-float32-row-major")
                self.assertEqual((matrix.rows, matrix.columns), (summary["rows"], summary["columns"]))
                self.assertGreater(_matrix_dynamic_range(matrix.values), 0.0)
                self.assertTrue(all(math.isfinite(value) for row in matrix.values for value in row))

        self.assertEqual(shapes["ecgs/standard_12.refECG"], (12, 700))
        self.assertEqual(shapes["ecgs/standard_12.adaptECG"], (12, 638))
        self.assertEqual(shapes["ecgs/BSM_(nijmegen_64).refECG"], (64, 700))

    def test_generated_tmp_matrix_matches_promoted_legacy_scenario_tolerance(self) -> None:
        fixture_root = Path("tests/fixtures/legacy-parity/normal-male-ecgsim301")
        beat = fixture_root / "ventricular_beats" / "beat1"
        parameter_vectors = {
            "depolarizationMs": {"adapted": read_vector(beat / "user.dep").values},
            "repolarizationMs": {"adapted": read_vector(beat / "user.rep").values},
            "restingPotential": {"adapted": read_vector(beat / "user.rest").values},
            "amplitude": {"adapted": read_vector(beat / "user.ampl").values},
            "plateauSlope": {"adapted": read_vector(beat / "user.platslope").values},
            "depolarizationSlope": {"adapted": read_vector(beat / "user.depslope").values},
            "repolarizationSlope": {"adapted": read_vector(beat / "user.repslope").values},
        }
        legacy = read_legacy_row_major_matrix(beat / "user.source")
        generated = generate_tmp_matrix_from_vectors(
            parameter_vectors,
            "adapted",
            sample_count=legacy.columns,
            precision=None,
        )

        assert_numeric_matrices_close(
            generated,
            legacy.values,
            max_abs_tolerance=1.8,
            rms_tolerance=0.52,
            label="normal-male-ecgsim301 adapted TMP source matrix",
        )


def _matrix_dynamic_range(rows: tuple[tuple[float, ...], ...]) -> float:
    values = [value for row in rows for value in row]
    return max(values) - min(values)


if __name__ == "__main__":
    unittest.main()
