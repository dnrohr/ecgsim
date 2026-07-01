import hashlib
import json
from pathlib import Path
import unittest

from ecgsim.io import load_case, read_ecgsimcase_geometries, read_ecgsimcase_matrix, read_ecgsimcase_sources
from tools.promote_legacy_parity_fixtures import verify_fixture_manifest


class ParityRegressionTests(unittest.TestCase):
    CASE_ROOT = Path("research/source/www.ecgsim.org/downloads/cases")
    LEGACY_PARITY_FIXTURE_ROOT = Path("tests/fixtures/legacy-parity")

    def test_promoted_legacy_parity_fixture_manifests_match_files(self) -> None:
        if not self.LEGACY_PARITY_FIXTURE_ROOT.exists():
            self.skipTest("no promoted legacy parity fixtures have been committed yet")

        fixture_dirs = sorted(
            path
            for path in self.LEGACY_PARITY_FIXTURE_ROOT.rglob("*")
            if (path / "manifest.json").is_file()
        )
        if not fixture_dirs:
            self.skipTest("no promoted legacy parity fixture manifests have been committed yet")

        for fixture_dir in fixture_dirs:
            with self.subTest(fixture=fixture_dir.as_posix()):
                verification = verify_fixture_manifest(fixture_dir)

                self.assertEqual(verification["status"], "passed")
                self.assertEqual(verification["failedCount"], 0)

    def test_legacy_screenshot_manifest_matches_tracked_file(self) -> None:
        manifest_path = Path("research/legacy-exports/screenshots-manifest.json")
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

        self.assertEqual(manifest["fileCount"], 1)
        self.assertEqual(manifest["totalBytes"], 292650)
        entry = manifest["files"][0]
        self.assertEqual(entry["path"], "normal-male-main-window.png")

        screenshot_path = Path("research/legacy-exports/screenshots") / entry["path"]
        payload = screenshot_path.read_bytes()
        self.assertEqual(len(payload), entry["bytes"])
        self.assertEqual(hashlib.sha256(payload).hexdigest(), entry["sha256"])

    def test_viewer_geometry_fixtures_match_source_counts_and_rounding(self) -> None:
        case_path = Path("research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase")
        case_geometries = {item.name: item for item in read_ecgsimcase_geometries(case_path)}
        fixture_expectations = [
            ("app/viewer/public/fixtures/heart.json", "heart", None),
            ("app/viewer/public/fixtures/thorax.json", "thorax", "thorax"),
            ("app/viewer/public/fixtures/thorax.json", "left_lung", "leftLung"),
            ("app/viewer/public/fixtures/thorax.json", "right_lung", "rightLung"),
        ]

        for fixture_path, geometry_name, mesh_name in fixture_expectations:
            with self.subTest(source=geometry_name):
                source = case_geometries[geometry_name]
                fixture = json.loads(Path(fixture_path).read_text(encoding="utf-8"))
                mesh = fixture["meshes"][mesh_name] if mesh_name else fixture

                self.assertEqual(mesh["source"], case_path.as_posix())
                self.assertEqual(mesh["sourceGeometryName"], source.name)
                self.assertEqual(mesh["sourceGeometryOffset"], source.marker_offset)
                self.assertEqual(mesh["pointCount"], source.point_count)
                self.assertEqual(mesh["triangleCount"], source.triangle_count)
                self.assertEqual(tuple(mesh["triangles"][0]), source.geometry.triangles[0])
                for actual, expected in zip(mesh["points"][0], source.geometry.points[0]):
                    self.assertAlmostEqual(actual, expected / 1000, delta=5e-5)

    def test_signal_fixture_matches_known_case_payload_shape_and_samples(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/ecg-signals.json").read_text(encoding="utf-8"))

        self.assertEqual(fixture["rows"], 300)
        self.assertEqual(fixture["columns"], 1000)
        self.assertEqual(fixture["sampleRateHz"], 1000)
        self.assertEqual(fixture["units"], "mV")
        self.assertEqual(fixture["fiducials"]["status"], "unavailable")
        self.assertIsNone(fixture["fiducials"]["baselineStartIndex"])
        self.assertIsNone(fixture["fiducials"]["baselineEndIndex"])
        self.assertIn("P-wave start", fixture["fiducials"]["interpretation"])
        self.assertEqual(len(fixture["traces"]), 6)
        self.assertEqual(len(fixture["traces"][0]["values"]), 1000)
        self.assertEqual(fixture["surfaceMap"]["kind"], "measured")
        self.assertEqual(fixture["surfaceMap"]["nodeCount"], 300)
        self.assertEqual(fixture["surfaceMap"]["sampleCount"], 576)
        self.assertEqual(len(fixture["surfaceMap"]["valuesByNode"]), 300)
        self.assertEqual(len(fixture["surfaceMap"]["valuesByNode"][0]), 576)
        transfer = fixture["transferMatrices"]["ventriclesToThorax"]
        self.assertEqual(transfer["role"], "candidate-ventricles-to-thorax")
        self.assertEqual(transfer["rows"], 300)
        self.assertEqual(transfer["columns"], 576)
        self.assertEqual(len(transfer["values"]), 300)
        self.assertEqual(len(transfer["values"][0]), 576)

        matrix = read_ecgsimcase_matrix(Path(fixture["source"]), fixture["sourceMatrixOffset"])
        transfer_matrix = read_ecgsimcase_matrix(Path(fixture["source"]), transfer["sourceMatrixOffset"])
        self.assertEqual(matrix.rows, fixture["rows"])
        self.assertEqual(matrix.columns, fixture["columns"])
        self.assertEqual(transfer_matrix.rows, transfer["rows"])
        self.assertEqual(transfer_matrix.columns, transfer["columns"])
        self.assertAlmostEqual(fixture["traces"][0]["values"][0], matrix.values[0][0], delta=1e-6)
        self.assertAlmostEqual(fixture["traces"][0]["values"][999], matrix.values[0][999], delta=1e-6)
        self.assertAlmostEqual(fixture["surfaceMap"]["valuesByNode"][0][0], matrix.values[0][0], delta=1e-6)
        self.assertAlmostEqual(fixture["surfaceMap"]["valuesByNode"][299][575], matrix.values[299][575], delta=1e-6)
        self.assertAlmostEqual(transfer["values"][0][0], transfer_matrix.values[0][0], delta=1e-6)
        self.assertAlmostEqual(transfer["values"][299][575], transfer_matrix.values[299][575], delta=1e-6)

    def test_case_metadata_fixture_marks_wall_mapping_unavailable(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/case-metadata.json").read_text(encoding="utf-8"))
        wall_mapping = fixture["wallMapping"]

        self.assertEqual(wall_mapping["status"], "unavailable")
        self.assertFalse(wall_mapping["supportsEndocardialEpicardialSwitch"])
        self.assertFalse(wall_mapping["supportsTransmuralSelection"])
        self.assertEqual(wall_mapping["pairCount"], 0)
        self.assertIn("PGraphGeometry", wall_mapping["requiredPayloads"])
        self.assertIn("PGraphGeometry payload semantics", wall_mapping["reason"])

    def test_case_metadata_fixture_includes_activation_construction_summaries(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/case-metadata.json").read_text(encoding="utf-8"))
        activations = fixture["activationConstructions"]

        self.assertEqual([item["sourceKind"] for item in activations], ["atria", "ventricles"])
        self.assertEqual(activations[0]["entryCount"], 0)
        self.assertEqual(activations[1]["entryCount"], 576)
        self.assertEqual(activations[1]["storageFormat"], "ecgsimcase-pactivationconstruction-v1-records-iff")
        self.assertEqual(activations[1]["sampleEntries"][0]["integerField"], -1)
        self.assertAlmostEqual(activations[1]["sampleEntries"][0]["floatField1"], 13.60003, places=5)
        self.assertAlmostEqual(activations[1]["sampleEntries"][0]["floatField2"], 0.8, places=6)

    def test_case_metadata_fixture_includes_lead_system_electrodes(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/case-metadata.json").read_text(encoding="utf-8"))
        case = load_case(Path(fixture["source"]))
        lead_systems = {system.name: system for system in case.lead_systems}

        for detail in fixture["leadSystemDetails"]:
            with self.subTest(lead_system=detail["name"]):
                parsed = lead_systems[detail["name"]]
                self.assertEqual(len(detail["electrodes"]), len(parsed.electrodes))
                self.assertEqual(len(detail["electrodes"]), detail["electrodeCount"])
                self.assertEqual(detail["electrodes"][0]["label"], parsed.electrodes[0].label)
                self.assertAlmostEqual(
                    detail["electrodes"][0]["position"][0],
                    parsed.electrodes[0].position[0] / 1000,
                    delta=1e-6,
                )
                self.assertGreaterEqual(detail["electrodes"][0]["thoraxNodeIndex"], 0)
                self.assertLess(detail["electrodes"][0]["thoraxNodeIndex"], 300)

    def test_tmp_fixture_matches_known_parameter_vectors(self) -> None:
        fixture = json.loads(Path("app/viewer/public/fixtures/tmp-waveforms.json").read_text(encoding="utf-8"))

        self.assertEqual(fixture["nodeCount"], 576)
        self.assertEqual(fixture["sampleCount"], 576)
        self.assertEqual(fixture["sampleRateHz"], 1000)
        self.assertEqual(len(fixture["nodes"]), 5)
        self.assertEqual(len(fixture["parameterVectors"]["depolarizationMs"]["initial"]), 576)

        path = Path(fixture["source"])
        ventricles = next(source for source in read_ecgsimcase_sources(path) if source.kind == "ventricles")
        depolarization = next(
            parameter
            for parameter in ventricles.beats[0].parameters
            if parameter.name == "depolarizationMs"
        )
        self.assertEqual(depolarization.initial.length, fixture["nodeCount"])
        self.assertAlmostEqual(
            fixture["parameterVectors"]["depolarizationMs"]["initial"][0],
            depolarization.initial.values[0],
            delta=1e-6,
        )
        self.assertAlmostEqual(
            fixture["nodes"][0]["parameters"]["depolarizationMs"]["initial"],
            depolarization.initial.values[0],
            delta=1e-6,
        )
        self.assertAlmostEqual(
            fixture["nodes"][-1]["parameters"]["depolarizationMs"]["initial"],
            depolarization.initial.values[575],
            delta=1e-6,
        )

    def test_compact_case_summaries_match_parser_outputs(self) -> None:
        fixture = json.loads(Path("tests/fixtures/case-summaries.json").read_text(encoding="utf-8"))

        for expected in fixture["cases"]:
            with self.subTest(case=expected["fileName"]):
                case = load_case(self.CASE_ROOT / expected["fileName"])
                geometries = {geometry.name: geometry for geometry in case.geometries}
                ventricles = next(source for source in case.sources if source.kind == "ventricles")
                parameters = {
                    parameter.name: parameter
                    for parameter in ventricles.beats[0].parameters
                }

                self.assertEqual(case.metadata.byte_size, expected["byteSize"])
                self.assertEqual(case.metadata.sha256, expected["sha256"])
                self.assertEqual(
                    [case.signal_metadata.rows, case.signal_metadata.columns],
                    expected["signalShape"],
                )
                for name, counts in expected["geometryCounts"].items():
                    self.assertEqual([geometries[name].point_count, geometries[name].triangle_count], counts)

                source = expected["ventricularSource"]
                self.assertEqual(parameters["depolarizationMs"].initial.length, source["nodeCount"])
                self.assertEqual(ventricles.activation.entry_count, source["activationEntryCount"])
                self.assertAlmostEqual(
                    parameters["depolarizationMs"].initial.values[0],
                    source["depolarizationMs"][0],
                    delta=1e-6,
                )
                self.assertAlmostEqual(
                    parameters["depolarizationMs"].initial.values[-1],
                    source["depolarizationMs"][1],
                    delta=1e-6,
                )
                self.assertAlmostEqual(
                    parameters["repolarizationSlope"].adapted.values[0],
                    source["repolarizationSlopeAdapted"][0],
                    delta=1e-6,
                )
                self.assertAlmostEqual(
                    parameters["repolarizationSlope"].adapted.values[-1],
                    source["repolarizationSlopeAdapted"][1],
                    delta=1e-6,
                )
                self.assertEqual(
                    [
                        [
                            system.name,
                            len(system.electrodes),
                            len(system.lead_labels),
                            len(system.shown_lead_labels),
                        ]
                        for system in case.lead_systems
                    ],
                    expected["leadSystems"],
                )
                unsupported = set(case.lead_systems[0].unsupported_fields)
                unsupported.update(case.signal_metadata.unsupported_fields)
                self.assertEqual(unsupported, set(expected["unsupportedFields"]))
