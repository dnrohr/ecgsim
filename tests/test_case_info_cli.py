from pathlib import Path
import subprocess
import sys
import unittest

from ecgsim.cli.case_info import format_case_metadata
from ecgsim.io import read_ecgsimcase_metadata


CASE = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")


class CaseInfoCliTests(unittest.TestCase):
    def test_formats_stable_case_metadata_fields(self) -> None:
        output = format_case_metadata(read_ecgsimcase_metadata(CASE))

        self.assertIn("case: normal_male2.ECGsimcase", output)
        self.assertIn("bytes: 11323178", output)
        self.assertIn("detected_format: ECGsimcase custom little-endian binary stream", output)
        self.assertIn("root_signature: PECGsimData", output)
        self.assertIn("PMatrix: count=31 first_offset=54", output)
        self.assertIn("PLeadSystem: count=4 first_offset=11312216", output)
        self.assertIn("  - standard_12", output)

    def test_module_command_runs_against_normal_case(self) -> None:
        result = subprocess.run(
            [sys.executable, "-m", "ecgsim.cli.case_info", str(CASE)],
            check=True,
            capture_output=True,
            text=True,
        )

        self.assertIn("case: normal_male2.ECGsimcase", result.stdout)
        self.assertIn("sections:", result.stdout)
        self.assertIn("unsupported_payloads:", result.stdout)
