from pathlib import Path
import tempfile
import unittest

from tools.validate_legacy_capture import validate_capture


class LegacyCaptureValidationTests(unittest.TestCase):
    def test_reports_ready_tasks_when_required_artifacts_exist(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            capture = Path(tmp)
            write_capture(capture, include_tmp=True, include_ref=True, include_adapted=True)

            validation = validate_capture(capture)

        self.assertTrue(validation["manifest"]["readyForNumericalParity"])
        self.assertTrue(validation["taskReadiness"]["0049"]["ready"])
        self.assertTrue(validation["taskReadiness"]["0051"]["ready"])
        self.assertTrue(validation["taskReadiness"]["0052"]["ready"])
        self.assertTrue(validation["taskReadiness"]["0053"]["ready"])

    def test_reports_missing_artifacts_for_incomplete_capture(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            capture = Path(tmp)
            write_capture(capture, include_tmp=False, include_ref=True, include_adapted=False)

            validation = validate_capture(capture)

        self.assertFalse(validation["manifest"]["readyForNumericalParity"])
        self.assertFalse(validation["taskReadiness"]["0049"]["ready"])
        self.assertEqual(validation["taskReadiness"]["0049"]["missingArtifacts"], ["tmpSource"])
        self.assertFalse(validation["taskReadiness"]["0051"]["ready"])
        self.assertEqual(
            validation["taskReadiness"]["0051"]["missingArtifacts"],
            ["tmpSource", "adaptedEcg"],
        )
        self.assertFalse(validation["taskReadiness"]["0052"]["ready"])
        self.assertEqual(validation["taskReadiness"]["0052"]["missingArtifacts"], ["adaptedEcg"])


def write_capture(capture: Path, *, include_tmp: bool, include_ref: bool, include_adapted: bool) -> None:
    ecgs = capture / "ecgs"
    beat = capture / "ventricular_beats" / "beat1"
    ecgs.mkdir(parents=True)
    beat.mkdir(parents=True)
    if include_ref:
        (ecgs / "lead.refECG").write_text("2 2\n1 2\n3 4\n", encoding="ascii")
    if include_adapted:
        (ecgs / "lead.adaptECG").write_text("2 2\n1 2\n3 4\n", encoding="ascii")
    if include_tmp:
        (beat / "user.source").write_text("2 2\n-80 -79\n20 21\n", encoding="ascii")
