from pathlib import Path
import tempfile
import unittest

from ecgsim.io import ECGsimCaseFormatError, read_ecgsimcase_matrix, read_ecgsimcase_metadata


class ECGsimCaseMetadataTests(unittest.TestCase):
    CASES = {
        "normal_male2.ECGsimcase": {
            "bytes": 11323178,
            "sha256": "4da15b759b8bc4880843bc647a257f66e36b64042583d0ad1c3e11bdc6169c4a",
            "p_lead": 98,
            "p_show_lead": 91,
            "volume": (1203688,),
            "sources": (11271432, 11272238),
            "lead_offsets": (11312216, 11313772, 11314874, 11321770),
            "lead_systems": (
                "standard_12",
                "VCG_(Frank)",
                "BSM_(nijmegen_64)",
                "minimap_montage",
            ),
        },
        "WPW_Bundleonly.ECGsimcase": {
            "bytes": 16809796,
            "sha256": "2ec84bb53ea60e564ce6ff495e88ac6343047cea8a76db9dd69973b18e38f5c4",
            "p_lead": 99,
            "p_show_lead": 92,
            "volume": (1640088,),
            "sources": (16749740, 16750546),
            "lead_offsets": (16798752, 16800308, 16801410, 16808388),
            "lead_systems": (
                "standard_12",
                "VCG_(Frank)",
                "BSM_(amsterdam_64)",
                "minimap_montage",
            ),
        },
        "WPW_ectopicbeat.ECGsimcase": {
            "bytes": 17451796,
            "sha256": "869412d681c9860837117ce7a98a62cf381ce92b64ae5b68aecfc3b735f22749",
            "p_lead": 99,
            "p_show_lead": 92,
            "volume": (2282088,),
            "sources": (17391740, 17392546),
            "lead_offsets": (17440752, 17442308, 17443410, 17450388),
            "lead_systems": (
                "standard_12",
                "VCG_(Frank)",
                "BSM_(amsterdam_64)",
                "minimap_montage",
            ),
        },
        "WPW_fusionbeat.ECGsimcase": {
            "bytes": 16875796,
            "sha256": "09dc777f2b8eca47e893c5a6ae2e1ae9daf34f64436eebf03ceb7ec0eda1f970",
            "p_lead": 99,
            "p_show_lead": 92,
            "volume": (1706088,),
            "sources": (16815740, 16816546),
            "lead_offsets": (16864752, 16866308, 16867410, 16874388),
            "lead_systems": (
                "standard_12",
                "VCG_(Frank)",
                "BSM_(amsterdam_64)",
                "minimap_montage",
            ),
        },
    }

    def test_reads_all_downloaded_case_metadata(self) -> None:
        root = Path("research/source/www.ecgsim.org/downloads/cases")

        for name, expected in self.CASES.items():
            with self.subTest(name=name):
                metadata = read_ecgsimcase_metadata(root / name)

                self.assertEqual(metadata.byte_size, expected["bytes"])
                self.assertEqual(metadata.sha256, expected["sha256"])
                self.assertEqual(metadata.root_signature, "PECGsimData")
                self.assertEqual(metadata.marker_counts["PMatrix"], 31)
                self.assertEqual(metadata.marker_counts["PGeometry"], 8)
                self.assertEqual(metadata.marker_counts["PSource"], 2)
                self.assertEqual(metadata.marker_counts["PLeadSystem"], 4)
                self.assertEqual(metadata.marker_counts["PLead"], expected["p_lead"])
                self.assertEqual(metadata.marker_counts["PShowLead"], expected["p_show_lead"])
                self.assertEqual(metadata.marker_offsets["PVolumeConductor"], expected["volume"])
                self.assertEqual(metadata.marker_offsets["PSource"], expected["sources"])
                self.assertEqual(metadata.marker_offsets["PLeadSystem"], expected["lead_offsets"])
                self.assertEqual(metadata.lead_systems, expected["lead_systems"])
                self.assertIn("PMatrix numeric payloads", metadata.unsupported_payloads)

    def test_rejects_non_case_file(self) -> None:
        with tempfile.NamedTemporaryFile(delete=False) as handle:
            path = Path(handle.name)
            handle.write(b"not an ecgsim case")
        self.addCleanup(path.unlink, missing_ok=True)

        with self.assertRaises(ECGsimCaseFormatError):
            read_ecgsimcase_metadata(path)

    def test_reads_known_case_pmatrix_payload(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        matrix = read_ecgsimcase_matrix(path, 54)

        self.assertEqual(matrix.rows, 300)
        self.assertEqual(matrix.columns, 1000)
        self.assertEqual(matrix.storage_format, "ecgsimcase-pmatrix-v1")
        self.assertAlmostEqual(matrix.values[0][0], 0.0104013, places=6)
        self.assertAlmostEqual(matrix.values[0][999], -0.0166813, places=6)
