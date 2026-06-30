import json
from pathlib import Path
import unittest

from ecgsim.core import assert_numeric_sequences_close, compare_numeric_sequences
from ecgsim.io import read_ecgsimcase_matrix, read_ecgsimcase_sources


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


if __name__ == "__main__":
    unittest.main()
