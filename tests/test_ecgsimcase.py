from pathlib import Path
import tempfile
import unittest

from ecgsim.io import (
    ECGsimCaseFormatError,
    read_ecgsimcase_geometries,
    read_ecgsimcase_lead_systems,
    read_ecgsimcase_matrix,
    read_ecgsimcase_metadata,
    read_ecgsimcase_signal_metadata,
    read_ecgsimcase_sources,
    read_ecgsimcase_vector,
)
from ecgsim.io.ecgsimcase import _read_ecgsimcase_geometry_payload


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

    def test_reads_known_case_pvector_payload(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        vector = read_ecgsimcase_vector(path, 11272300)

        self.assertEqual(vector.length, 576)
        self.assertEqual(vector.storage_format, "ecgsimcase-pvector-v1")
        self.assertAlmostEqual(vector.values[0], 27.2001, places=4)
        self.assertAlmostEqual(vector.values[575], 95.2450, places=4)

    def test_reads_normal_case_geometry_payloads(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        geometries = read_ecgsimcase_geometries(path)

        self.assertEqual(
            [(item.name, item.point_count, item.triangle_count) for item in geometries],
            [
                ("thorax", 300, 596),
                ("heart", 912, 1696),
                ("empty_geometry_1", 0, 0),
                ("empty_geometry_2", 0, 0),
                ("right_lung", 132, 260),
                ("left_lung", 124, 244),
                ("auxiliary_geometry_1", 222, 440),
                ("auxiliary_geometry_2", 162, 320),
            ],
        )
        self.assertEqual(geometries[0].marker_offset, 1203728)
        self.assertEqual(geometries[0].geometry.source_index_base, 0)
        self.assertEqual(geometries[0].geometry.storage_format, "ecgsimcase-pgeometry-v1")
        self.assertEqual(geometries[0].geometry.units, "case-coordinate-units")
        self.assertAlmostEqual(geometries[0].geometry.points[0][0], -20.5, places=4)
        self.assertEqual(geometries[0].geometry.triangles[0], (132, 227, 280))

    def test_reads_wpw_case_geometry_payloads(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/WPW_Bundleonly.ECGsimcase")
        geometries = read_ecgsimcase_geometries(path)

        self.assertEqual(len(geometries), 8)
        self.assertEqual(geometries[0].name, "thorax")
        self.assertEqual((geometries[0].point_count, geometries[0].triangle_count), (500, 996))
        self.assertEqual(geometries[1].name, "heart")
        self.assertEqual((geometries[1].point_count, geometries[1].triangle_count), (1216, 2272))
        self.assertEqual(geometries[4].name, "right_lung")
        self.assertEqual((geometries[4].point_count, geometries[4].triangle_count), (400, 796))
        self.assertEqual(geometries[5].name, "left_lung")
        self.assertEqual((geometries[5].point_count, geometries[5].triangle_count), (349, 694))

    def test_rejects_unsupported_geometry_payload_offset(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")

        with self.assertRaisesRegex(ECGsimCaseFormatError, "not PGeometry"):
            _read_ecgsimcase_geometry_payload(path.read_bytes(), path, 54)

    def test_reads_normal_case_source_parameters(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        sources = read_ecgsimcase_sources(path)

        self.assertEqual([(source.id, source.kind) for source in sources], [("source1", "atria"), ("source2", "ventricles")])
        atria, ventricles = sources
        self.assertEqual(atria.source_offset, 11271432)
        self.assertEqual(ventricles.source_offset, 11272238)
        self.assertEqual(atria.beats[0].id, "beat1")
        self.assertEqual(ventricles.beats[0].id, "beat1")
        self.assertEqual(atria.activation.source_offset, 11272180)
        self.assertEqual(atria.activation.entry_count, 0)
        self.assertEqual(ventricles.activation.source_offset, 11305242)
        self.assertEqual(ventricles.activation.entry_count, 576)

        parameters = {parameter.name: parameter for parameter in ventricles.beats[0].parameters}
        self.assertEqual(
            tuple(parameters),
            (
                "depolarizationMs",
                "repolarizationMs",
                "plateauSlope",
                "restingPotential",
                "amplitude",
                "depolarizationSlope",
                "repolarizationSlope",
            ),
        )
        self.assertEqual(parameters["depolarizationMs"].initial.source_offset, 11272300)
        self.assertEqual(parameters["depolarizationMs"].adapted.source_offset, 11274630)
        self.assertEqual(parameters["depolarizationMs"].initial.length, 576)
        self.assertAlmostEqual(parameters["depolarizationMs"].initial.values[0], 27.2001, places=4)
        self.assertAlmostEqual(parameters["depolarizationMs"].initial.values[575], 95.2450, places=4)
        self.assertEqual(parameters["restingPotential"].units, "mV")
        self.assertEqual(parameters["plateauSlope"].units, "unknown legacy slope unit")

    def test_source_parameter_vectors_match_offset_reader(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        ventricles = read_ecgsimcase_sources(path)[1]
        parameters = {parameter.name: parameter for parameter in ventricles.beats[0].parameters}

        for parameter in parameters.values():
            if parameter.initial is None or parameter.adapted is None or parameter.initial.length == 0:
                continue
            with self.subTest(parameter=parameter.name):
                initial = read_ecgsimcase_vector(path, parameter.initial.source_offset)
                adapted = read_ecgsimcase_vector(path, parameter.adapted.source_offset)
                self.assertEqual(parameter.initial.values, initial.values)
                self.assertEqual(parameter.adapted.values, adapted.values)

    def test_reads_wpw_source_parameter_shapes(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase")
        sources = read_ecgsimcase_sources(path)
        ventricles = sources[1]
        parameters = {parameter.name: parameter for parameter in ventricles.beats[0].parameters}

        self.assertEqual((sources[0].kind, ventricles.kind), ("atria", "ventricles"))
        self.assertGreater(ventricles.activation.entry_count, 0)
        self.assertGreater(parameters["depolarizationMs"].initial.length, 0)
        self.assertEqual(
            parameters["depolarizationMs"].initial.length,
            parameters["depolarizationMs"].adapted.length,
        )
        self.assertEqual(
            parameters["repolarizationSlope"].initial.length,
            parameters["repolarizationSlope"].adapted.length,
        )

    def test_reads_normal_case_lead_systems(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        systems = read_ecgsimcase_lead_systems(path)

        self.assertEqual([system.name for system in systems], list(self.CASES[path.name]["lead_systems"]))
        self.assertEqual([len(system.electrodes) for system in systems], [9, 7, 65, 9])
        self.assertEqual([len(system.lead_labels) for system in systems], [12, 10, 64, 12])
        self.assertEqual([len(system.shown_lead_labels) for system in systems], [12, 6, 64, 9])
        self.assertEqual(systems[0].lead_labels[:4], ("lead1", "II", "III", "V1"))
        self.assertEqual(systems[0].reference_labels, ("Zeromean", "extremities", "vr", "vl"))
        self.assertEqual(systems[1].shown_lead_labels[:3], ("horizontal", "frontal", "left sagital"))
        self.assertEqual(systems[0].matrix_offsets, (11312384,))
        self.assertAlmostEqual(systems[0].electrodes[0].position[0], 109.0, places=4)
        self.assertIn("fiducial/time-base fields", systems[0].unsupported_fields)

    def test_reads_wpw_lead_system_inventory(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/WPW_fusionbeat.ECGsimcase")
        systems = read_ecgsimcase_lead_systems(path)

        self.assertEqual([system.name for system in systems], list(self.CASES[path.name]["lead_systems"]))
        self.assertEqual([len(system.electrodes) for system in systems], [9, 7, 65, 9])
        self.assertEqual(systems[2].name, "BSM_(amsterdam_64)")
        self.assertEqual(len(systems[2].shown_lead_labels), 65)

    def test_reads_signal_metadata(self) -> None:
        path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        signal = read_ecgsimcase_signal_metadata(path)

        self.assertEqual(signal.matrix_offset, 54)
        self.assertEqual((signal.rows, signal.columns), (300, 1000))
        self.assertEqual(signal.sample_rate_hz, 1000)
        self.assertEqual(signal.signal_kind, "thorax-node surface potentials")
        self.assertIsNone(signal.fiducials)
        self.assertIn("fiducial", signal.unsupported_fields[1])
