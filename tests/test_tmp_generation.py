import json
from pathlib import Path
import unittest

from ecgsim.core import (
    TMPParameters,
    generate_tmp_waveform,
    generate_tmp_waveform_from_vectors,
    tmp_parameters_from_vectors,
)


class TMPGenerationTests(unittest.TestCase):
    def test_generates_rest_upstroke_and_recovery(self) -> None:
        values = generate_tmp_waveform(
            TMPParameters(
                depolarization_ms=2.0,
                repolarization_ms=6.0,
                resting_potential=-80.0,
                amplitude=100.0,
                plateau_slope=0.0,
                depolarization_slope=0.001,
                repolarization_slope=0.001,
            ),
            sample_count=10,
        )

        self.assertEqual(len(values), 10)
        self.assertLess(values[0], -68.0)
        self.assertGreater(values[4], -5.0)
        self.assertLess(values[-1], -75.0)

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


if __name__ == "__main__":
    unittest.main()
