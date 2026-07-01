import json
from pathlib import Path
import unittest

from ecgsim.core import (
    TMPParameters,
    generate_tmp_matrix_from_vectors,
    generate_tmp_waveform,
    generate_tmp_waveform_from_vectors,
    read_legacy_tmp_source_matrix,
    tmp_parameters_from_vectors,
)
from ecgsim.io import read_vector


class TMPGenerationTests(unittest.TestCase):
    def test_generates_rest_upstroke_and_recovery(self) -> None:
        values = generate_tmp_waveform(
            TMPParameters(
                depolarization_ms=2.0,
                repolarization_ms=260.0,
                resting_potential=-85.0,
                amplitude=15.0,
                plateau_slope=0.0207,
                depolarization_slope=2.0,
                repolarization_slope=0.0416,
            ),
            sample_count=330,
        )

        self.assertEqual(len(values), 330)
        self.assertLess(values[0], -83.0)
        self.assertGreater(max(values), 14.0)
        self.assertLess(values[-1], -70.0)

    def test_uses_sample_rate_for_time_axis(self) -> None:
        parameters = TMPParameters(
            depolarization_ms=2.0,
            repolarization_ms=6.0,
            resting_potential=-80.0,
            amplitude=100.0,
            plateau_slope=0.0,
            depolarization_slope=0.001,
            repolarization_slope=0.001,
        )

        at_1000_hz = generate_tmp_waveform(parameters, sample_count=5, sample_rate_hz=1000.0)
        at_500_hz = generate_tmp_waveform(parameters, sample_count=5, sample_rate_hz=500.0)

        self.assertEqual(at_1000_hz[4], at_500_hz[2])

    def test_rejects_nonfinite_parameters(self) -> None:
        with self.assertRaisesRegex(ValueError, "amplitude"):
            generate_tmp_waveform(
                TMPParameters(
                    depolarization_ms=2.0,
                    repolarization_ms=6.0,
                    resting_potential=-80.0,
                    amplitude=float("nan"),
                    plateau_slope=0.2,
                    depolarization_slope=0.001,
                    repolarization_slope=0.1,
                ),
                sample_count=10,
            )

    def test_builds_parameters_from_vectors(self) -> None:
        vectors = {
            "depolarizationMs": {"adapted": [11.0]},
            "repolarizationMs": {"adapted": [22.0]},
            "restingPotential": {"adapted": [-83.0]},
            "amplitude": {"adapted": [101.0]},
            "plateauSlope": {"adapted": [0.01]},
            "depolarizationSlope": {"adapted": [0.002]},
            "repolarizationSlope": {"adapted": [0.03]},
        }

        parameters = tmp_parameters_from_vectors(vectors, 0, "adapted")

        self.assertEqual(parameters.depolarization_ms, 11.0)
        self.assertEqual(parameters.repolarization_slope, 0.03)

    def test_generation_matches_current_tmp_fixture(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/tmp-waveforms.json").read_text(encoding="utf-8"))
        first_node = fixture["nodes"][0]

        generated = generate_tmp_waveform_from_vectors(
            fixture["parameterVectors"],
            first_node["sourceNode"],
            "initial",
            fixture["sampleCount"],
            fixture["sampleRateHz"],
        )

        self.assertEqual(generated, first_node["initial"])

    def test_generation_matches_promoted_legacy_tmp_source_within_calibrated_tolerance(self) -> None:
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
        legacy = read_legacy_tmp_source_matrix(beat / "user.source")
        generated = generate_tmp_matrix_from_vectors(
            parameter_vectors,
            "adapted",
            sample_count=len(legacy[0]),
            precision=None,
        )

        max_error = 0.0
        squared_error = 0.0
        sample_count = 0
        for generated_row, legacy_row in zip(generated, legacy):
            for actual, expected in zip(generated_row, legacy_row):
                error = actual - expected
                max_error = max(max_error, abs(error))
                squared_error += error * error
                sample_count += 1

        rms_error = (squared_error / sample_count) ** 0.5
        self.assertLessEqual(max_error, 1.8)
        self.assertLessEqual(rms_error, 0.52)


if __name__ == "__main__":
    unittest.main()
