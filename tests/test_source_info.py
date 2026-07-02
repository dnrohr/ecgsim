import tempfile
from pathlib import Path
import unittest

from ecgsim.io import (
    SOURCE_INFO_SCHEMA,
    SourceInfoError,
    export_case_source_info,
    load_case,
    read_source_info,
    source_info_from_case,
    validate_source_info,
)


CASE_PATH = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")


class SourceInfoTests(unittest.TestCase):
    def test_source_info_payload_preserves_case_source_parameters(self) -> None:
        case = load_case(CASE_PATH)
        payload = source_info_from_case(case)

        self.assertEqual(payload["schema"], SOURCE_INFO_SCHEMA)
        self.assertEqual(payload["case"]["sha256"], case.metadata.sha256)
        ventricles = next(source for source in payload["sources"] if source["kind"] == "ventricles")
        parameters = ventricles["beats"][0]["parameters"]

        self.assertEqual(len(parameters["depolarizationMs"]["adapted"]), 576)
        self.assertAlmostEqual(
            parameters["depolarizationMs"]["initial"][0],
            case.sources[1].beats[0].parameters[0].initial.values[0],
        )
        self.assertEqual(parameters["amplitude"]["units"], "mV")
        validate_source_info(payload, expected_sha256=case.metadata.sha256)

    def test_source_info_round_trip_file(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            target = Path(temp_dir) / "normal_male2.ECGsimsource.json"
            written = export_case_source_info(CASE_PATH, target)
            loaded = read_source_info(target)

        self.assertEqual(loaded["schema"], SOURCE_INFO_SCHEMA)
        self.assertEqual(loaded["case"], written["case"])
        self.assertEqual(
            loaded["sources"][1]["beats"][0]["parameters"]["repolarizationMs"]["adapted"][-1],
            written["sources"][1]["beats"][0]["parameters"]["repolarizationMs"]["adapted"][-1],
        )

    def test_source_info_rejects_wrong_case_or_vector_shape(self) -> None:
        payload = source_info_from_case(load_case(CASE_PATH))

        with self.assertRaisesRegex(SourceInfoError, "different case"):
            validate_source_info(payload, expected_sha256="not-this-case")

        bad_payload = dict(payload)
        bad_sources = [dict(source) for source in payload["sources"]]
        bad_ventricles = dict(bad_sources[1])
        bad_beat = dict(bad_ventricles["beats"][0])
        bad_parameters = dict(bad_beat["parameters"])
        bad_depolarization = dict(bad_parameters["depolarizationMs"])
        bad_depolarization["adapted"] = bad_depolarization["adapted"][:-1]
        bad_parameters["depolarizationMs"] = bad_depolarization
        bad_beat["parameters"] = bad_parameters
        bad_ventricles["beats"] = [bad_beat]
        bad_sources[1] = bad_ventricles
        bad_payload["sources"] = bad_sources

        with self.assertRaisesRegex(SourceInfoError, "lengths differ"):
            validate_source_info(bad_payload)


if __name__ == "__main__":
    unittest.main()
