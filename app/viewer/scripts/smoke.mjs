import { readFile } from "node:fs/promises";
import { filterSignal } from "../src/filtering.js";
import { computeRegionMembership, findNearestPointIndex } from "../src/selection.js";
import {
  applyParameterValue,
  createTmpEditState,
  nodeParameterValue,
  resetBeat,
  resetParameter,
} from "../src/tmp-editing.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
const caseFixture = JSON.parse(await readFile(new URL("../public/fixtures/case-metadata.json", import.meta.url), "utf8"));
const caseManifest = JSON.parse(await readFile(new URL("../public/fixtures/cases/manifest.json", import.meta.url), "utf8"));
const fixture = JSON.parse(await readFile(new URL("../public/fixtures/heart.json", import.meta.url), "utf8"));
const thoraxFixture = JSON.parse(await readFile(new URL("../public/fixtures/thorax.json", import.meta.url), "utf8"));
const ecgFixture = JSON.parse(await readFile(new URL("../public/fixtures/ecg-signals.json", import.meta.url), "utf8"));
const tmpFixture = JSON.parse(await readFile(new URL("../public/fixtures/tmp-waveforms.json", import.meta.url), "utf8"));
const required = [
  "data-viewer-shell",
  "data-shell-menu",
  "data-shell-toolbar",
  "data-status-message",
  "data-toolbar-lead-system",
  "data-case-file",
  "data-case-unsupported",
  "data-pane=\"heart\"",
  "data-pane=\"thorax\"",
  "data-pane=\"tmp\"",
  "data-pane=\"leads\"",
  "data-heart-metadata",
  "data-heart-radius",
  "data-heart-selection",
  "data-thorax-metadata",
  "data-tmp-metadata",
  "data-tmp-parameter",
  "data-tmp-value",
  "data-tmp-apply",
  "data-tmp-reset-parameter",
  "data-tmp-reset-beat",
  "data-leads-metadata",
  "data-leads-filter",
  "data-toggle-mesh=\"thorax\"",
  "data-toggle-mesh=\"leftLung\"",
  "data-toggle-mesh=\"rightLung\"",
  "three",
  "./src/main.js",
  "./src/styles.css",
];

const missing = required.filter((token) => !html.includes(token));
if (missing.length) {
  console.error(`Missing viewer scaffold tokens: ${missing.join(", ")}`);
  process.exit(1);
}
if (!mainSource.includes("Depol. slope (stored)")) {
  console.error("Missing disabled stored-only TMP parameter label");
  process.exit(1);
}

if (
  caseFixture.fileName !== "normal_male2.ECGsimcase" ||
  caseFixture.byteSize !== 11323178 ||
  !caseFixture.unsupportedPayloads.includes("unnamed PVector payloads")
) {
  console.error("Unexpected case metadata fixture");
  process.exit(1);
}
if (
  !Array.isArray(caseManifest.cases) ||
  !caseManifest.cases.some((entry) => entry.fileName === "normal_male2.ECGsimcase") ||
  !caseManifest.cases.some((entry) => entry.fileName === "WPW_ectopicbeat.ECGsimcase")
) {
  console.error("Unexpected supported case manifest");
  process.exit(1);
}

if (fixture.pointCount !== 912 || fixture.triangleCount !== 1696) {
  console.error(`Unexpected heart fixture size: ${fixture.pointCount} / ${fixture.triangleCount}`);
  process.exit(1);
}

if (findNearestPointIndex([[0, 0, 0], [0.01, 0, 0], [0.03, 0, 0]], [0.012, 0, 0]) !== 1) {
  console.error("Nearest-node selection math failed");
  process.exit(1);
}
const region = computeRegionMembership([[0, 0, 0], [0.01, 0, 0], [0.03, 0, 0]], 0, 0.011);
if (region.length !== 2 || region[0].index !== 0 || region[1].index !== 1) {
  console.error("Region membership math failed");
  process.exit(1);
}

const expectedThorax = {
  thorax: [300, 596],
  leftLung: [124, 244],
  rightLung: [132, 260],
};
for (const [name, [points, triangles]] of Object.entries(expectedThorax)) {
  const mesh = thoraxFixture.meshes[name];
  if (!mesh || mesh.pointCount !== points || mesh.triangleCount !== triangles) {
    console.error(`Unexpected thorax fixture size for ${name}`);
    process.exit(1);
  }
}

if (
  ecgFixture.rows !== 300 ||
  ecgFixture.columns !== 1000 ||
  ecgFixture.sampleRateHz !== 1000 ||
  ecgFixture.traces.length !== 6
) {
  console.error("Unexpected ECG signal fixture metadata");
  process.exit(1);
}
if (ecgFixture.traces.some((trace) => trace.values.length !== 1000)) {
  console.error("Unexpected ECG signal trace length");
  process.exit(1);
}
const acFiltered = filterSignal([1, 2, 3], "ac");
if (acFiltered[0] !== -1 || acFiltered[1] !== 0 || acFiltered[2] !== 1) {
  console.error("AC filtering failed");
  process.exit(1);
}
const baselineFiltered = filterSignal([5, 7, 9], "baseline");
if (baselineFiltered.some((value) => value !== 0)) {
  console.error("Baseline filtering failed");
  process.exit(1);
}

if (
  tmpFixture.nodeCount !== 576 ||
  tmpFixture.sampleCount !== 576 ||
  tmpFixture.sampleRateHz !== 1000 ||
  tmpFixture.nodes.length !== 5
) {
  console.error("Unexpected TMP fixture metadata");
  process.exit(1);
}
if (tmpFixture.nodes.some((node) => node.initial.length !== 576 || node.adapted.length !== 576)) {
  console.error("Unexpected TMP waveform length");
  process.exit(1);
}
if (
  !tmpFixture.parameterVectors ||
  tmpFixture.parameterVectors.depolarizationMs.initial.length !== 576 ||
  tmpFixture.parameterVectors.repolarizationMs.adapted.length !== 576
) {
  console.error("Unexpected TMP parameter vectors");
  process.exit(1);
}
const editState = createTmpEditState(tmpFixture);
const originalDep = nodeParameterValue(editState, "depolarizationMs", 0, "adapted");
if (applyParameterValue(editState, "depolarizationMs", [0, 1], originalDep + 5) !== 2) {
  console.error("TMP parameter apply failed");
  process.exit(1);
}
if (nodeParameterValue(editState, "depolarizationMs", 1, "adapted") !== originalDep + 5) {
  console.error("TMP adapted value did not update");
  process.exit(1);
}
resetParameter(editState, "depolarizationMs", [0]);
if (nodeParameterValue(editState, "depolarizationMs", 0, "adapted") !== originalDep) {
  console.error("TMP parameter reset failed");
  process.exit(1);
}
resetBeat(editState);
if (nodeParameterValue(editState, "depolarizationMs", 1, "adapted") !== editState.parameters.depolarizationMs.initial[1]) {
  console.error("TMP beat reset failed");
  process.exit(1);
}

console.log("viewer smoke check passed");
