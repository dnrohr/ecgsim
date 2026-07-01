import unittest
from pathlib import Path

from ecgsim.core import (
    baseline_window_for_signal,
    filter_matrix,
    filter_signal,
    infer_baseline_window_from_zero_runs,
)
from ecgsim.io import MatrixData, read_legacy_row_major_matrix


class FilteringTests(unittest.TestCase):
    def test_dc_mode_passes_signal_through(self) -> None:
        self.assertEqual(filter_signal((1.0, 2.5, -1.0), "dc"), (1.0, 2.5, -1.0))

    def test_ac_mode_subtracts_trace_mean(self) -> None:
        filtered = filter_signal((1.0, 2.0, 3.0), "ac")

        self.assertEqual(filtered, (-1.0, 0.0, 1.0))
        self.assertAlmostEqual(sum(filtered) / len(filtered), 0.0)

    def test_baseline_mode_subtracts_line_between_fiducials(self) -> None:
        filtered = filter_signal(
            (10.0, 13.0, 18.0, 21.0, 22.0),
            "baseline",
            baseline_start_index=0,
            baseline_end_index=4,
        )

        self.assertEqual(filtered[0], 0.0)
        self.assertEqual(filtered[-1], 0.0)
        self.assertEqual(filtered[2], 2.0)

    def test_baseline_mode_uses_signal_ends_when_fiducials_are_unknown(self) -> None:
        filtered = filter_signal((5.0, 7.0, 9.0), "baseline")

        self.assertEqual(filtered, (0.0, 0.0, 0.0))

    def test_baseline_window_reports_fiducial_or_fallback_source(self) -> None:
        fiducial_window = baseline_window_for_signal(
            100,
            baseline_start_index=10,
            baseline_end_index=90,
        )
        fallback_window = baseline_window_for_signal(100)

        self.assertEqual((fiducial_window.start_index, fiducial_window.end_index), (10, 90))
        self.assertEqual(fiducial_window.source, "fiducials")
        self.assertEqual((fallback_window.start_index, fallback_window.end_index), (0, 99))
        self.assertEqual(fallback_window.source, "signal-ends")

    def test_filter_matrix_applies_mode_per_row(self) -> None:
        matrix = MatrixData(
            rows=2,
            columns=3,
            values=((1.0, 2.0, 3.0), (2.0, 2.0, 5.0)),
            storage_format="fixture",
        )

        filtered = filter_matrix(matrix, "ac")

        self.assertEqual(filtered.rows, 2)
        self.assertEqual(filtered.columns, 3)
        self.assertEqual(filtered.values[0], (-1.0, 0.0, 1.0))
        self.assertEqual(filtered.storage_format, "fixture+ac-coupled")

    def test_infers_legacy_baseline_window_from_promoted_adapted_ecg(self) -> None:
        matrix = read_legacy_row_major_matrix(
            Path("tests/fixtures/legacy-parity/normal-male-ecgsim301/ecgs/standard_12.adaptECG")
        )

        window = infer_baseline_window_from_zero_runs(matrix)

        self.assertEqual(matrix.rows, 12)
        self.assertEqual(matrix.columns, 505)
        self.assertEqual((window.start_index, window.end_index), (5, 499))
        self.assertEqual(window.source, "inferred-legacy-zeros")

    def test_filter_modes_match_promoted_legacy_adapted_ecg_semantics(self) -> None:
        matrix = read_legacy_row_major_matrix(
            Path("tests/fixtures/legacy-parity/normal-male-ecgsim301/ecgs/standard_12.adaptECG")
        )
        window = infer_baseline_window_from_zero_runs(matrix)

        dc_filtered = filter_matrix(matrix, "dc")
        ac_filtered = filter_matrix(matrix, "ac")
        baseline_filtered = filter_matrix(
            matrix,
            "baseline",
            baseline_start_index=window.start_index,
            baseline_end_index=window.end_index,
        )

        self.assertEqual(dc_filtered.values, matrix.values)
        for row in ac_filtered.values:
            self.assertAlmostEqual(sum(row) / len(row), 0.0, places=12)
        for original_row, filtered_row in zip(matrix.values, baseline_filtered.values):
            self.assertAlmostEqual(filtered_row[window.start_index], 0.0, places=12)
            self.assertAlmostEqual(filtered_row[window.end_index], 0.0, places=12)
            max_delta = max(abs(actual - expected) for actual, expected in zip(filtered_row, original_row))
            self.assertLessEqual(max_delta, 1.0e-5)

    def test_rejects_invalid_mode(self) -> None:
        with self.assertRaisesRegex(ValueError, "unsupported"):
            filter_signal((1.0,), "not-a-mode")  # type: ignore[arg-type]

    def test_rejects_invalid_baseline_indices(self) -> None:
        with self.assertRaisesRegex(ValueError, "baseline_end_index"):
            filter_signal((1.0, 2.0), "baseline", baseline_end_index=2)


if __name__ == "__main__":
    unittest.main()
