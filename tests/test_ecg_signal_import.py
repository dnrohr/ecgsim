import json
from pathlib import Path
import tempfile
import unittest

from ecgsim.io import (
    ECG_SIGNAL_SCHEMA,
    ECGSignalImportError,
    read_ecg_signals,
    validate_ecg_signal_payload,
)


class ECGSignalImportTests(unittest.TestCase):
    def test_reads_valid_modern_ecg_signal_json(self) -> None:
        payload = {
            "schema": ECG_SIGNAL_SCHEMA,
            "version": 1,
            "name": "Imported comparison ECG",
            "sampleRateHz": 500,
            "units": "mV",
            "leadLabels": ["I", "II"],
            "valuesByLead": [[0, 0.2, -0.1], [0.1, 0.3, 0]],
        }

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "comparison.ecgsim-ecg.json"
            path.write_text(json.dumps(payload), encoding="utf-8")
            signals = read_ecg_signals(path)

        self.assertEqual(signals.name, "Imported comparison ECG")
        self.assertEqual(signals.sample_rate_hz, 500)
        self.assertEqual(signals.units, "mV")
        self.assertEqual(signals.lead_labels, ("I", "II"))
        self.assertEqual(signals.rows, 2)
        self.assertEqual(signals.columns, 3)
        self.assertEqual(signals.values_by_lead[1][1], 0.3)

    def test_rejects_bad_schema(self) -> None:
        with self.assertRaisesRegex(ECGSignalImportError, "schema"):
            validate_ecg_signal_payload(
                {
                    "schema": "other",
                    "version": 1,
                    "name": "bad",
                    "sampleRateHz": 500,
                    "units": "mV",
                    "leadLabels": ["I"],
                    "valuesByLead": [[0]],
                }
            )

    def test_rejects_label_matrix_mismatch(self) -> None:
        with self.assertRaisesRegex(ECGSignalImportError, "leadLabels length"):
            validate_ecg_signal_payload(
                {
                    "schema": ECG_SIGNAL_SCHEMA,
                    "version": 1,
                    "name": "bad",
                    "sampleRateHz": 500,
                    "units": "mV",
                    "leadLabels": ["I"],
                    "valuesByLead": [[0, 1], [1, 0]],
                }
            )

    def test_rejects_ragged_matrix(self) -> None:
        with self.assertRaisesRegex(ECGSignalImportError, "same length"):
            validate_ecg_signal_payload(
                {
                    "schema": ECG_SIGNAL_SCHEMA,
                    "version": 1,
                    "name": "bad",
                    "sampleRateHz": 500,
                    "units": "mV",
                    "leadLabels": ["I", "II"],
                    "valuesByLead": [[0, 1], [1]],
                }
            )


if __name__ == "__main__":
    unittest.main()
