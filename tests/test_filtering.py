import unittest

from ecgsim.core import baseline_window_for_signal, filter_matrix, filter_signal
from ecgsim.io import MatrixData


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

    def test_rejects_invalid_mode(self) -> None:
        with self.assertRaisesRegex(ValueError, "unsupported"):
            filter_signal((1.0,), "not-a-mode")  # type: ignore[arg-type]

    def test_rejects_invalid_baseline_indices(self) -> None:
        with self.assertRaisesRegex(ValueError, "baseline_end_index"):
            filter_signal((1.0, 2.0), "baseline", baseline_end_index=2)


if __name__ == "__main__":
    unittest.main()
