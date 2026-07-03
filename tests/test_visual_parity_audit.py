from pathlib import Path
import unittest

from tools.audit_visual_parity import audit_matrix


class VisualParityAuditTests(unittest.TestCase):
    def test_visualization_matrix_has_only_accepted_statuses(self) -> None:
        report = audit_matrix(Path("docs/feature-parity/visualization-matrix.md"))

        self.assertEqual(report["status"], "passed")
        self.assertEqual(report["invalidRows"], [])
        self.assertEqual(report["rowCount"], 39)

    def test_visualization_matrix_records_current_evidence_blockers(self) -> None:
        report = audit_matrix(Path("docs/feature-parity/visualization-matrix.md"))

        blockers = {(row["area"], row["mode"]) for row in report["blockedOnEvidence"]}
        self.assertEqual(
            blockers,
            {
                ("Heart", "Endocardial/epicardial and transmural mapping"),
                ("TMP", "Electrogram"),
                ("Leads", "Measured/initial/adapted overlays"),
            },
        )


if __name__ == "__main__":
    unittest.main()
