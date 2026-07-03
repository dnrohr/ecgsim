import { readFile } from "node:fs/promises";
import { contourLevels, contourNodeIndexes, divergingRgb, sequentialRgb } from "../src/color-maps.js";
import { baselineWindowForSignal, buildRmsTrace, filterSignal } from "../src/filtering.js";
import {
  applyFocusSelection,
  createFocusEditState,
  fastestRouteActivationTimes,
  previewFocusActivation,
  updateFocusParameters,
} from "../src/focus-editing.js";
import { ariValues, heartSurfaceValues, tmpAtTimeValues } from "../src/heart-surfaces.js";
import {
  canRecomputeLeadTraces,
  recomputeLeadTraces,
  recomputeThoraxSurfaceSample,
  contributionValuesForThoraxNode,
  sensitivityValuesForSourceNode,
} from "../src/recompute.js";
import {
  computeRegionMembership,
  computeWeightedRegionMembership,
  findNearestPointIndex,
  mergeWeightedRegions,
} from "../src/selection.js";
import {
  applyParameterValue,
  applyTmpEditSnapshot,
  applyWeightedParameterTransaction,
  applyWeightedParameterValue,
  createTmpEditState,
  nodeParameterValue,
  redoLastTransaction,
  resetBeat,
  resetParameter,
  resetWeightedParameterTransaction,
  serializeTmpEditState,
  undoLastTransaction,
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
  "data-time-step-back",
  "data-time-play",
  "data-time-step-forward",
  "data-time-cursor",
  "data-time-status",
  "data-case-file",
  "data-case-bundle-file",
  "data-case-unsupported",
  "data-case-validation",
  "data-pane=\"heart\"",
  "data-pane=\"thorax\"",
  "data-pane=\"tmp\"",
  "data-pane=\"leads\"",
  "data-heart-metadata",
  "data-heart-selection-mode",
  "data-heart-radius",
  "data-heart-transition",
  "data-heart-selection",
  "data-heart-ap",
  "data-heart-rotate",
  "data-heart-contours",
  "data-heart-surface",
  "value=\"ariMs\"",
  "value=\"tmpAtTime\"",
  "value=\"thoraxContribution\"",
  "data-heart-values",
  "data-heart-wall",
  "data-heart-transmural",
  "data-heart-surface-status",
  "data-thorax-metadata",
  "data-thorax-ap",
  "data-thorax-rotate",
  "data-thorax-contours",
  "data-thorax-surface",
  "data-thorax-scale",
  "data-thorax-electrodes",
  "data-thorax-lock-heart",
  "data-thorax-surface-status",
  "data-thorax-selection",
  "data-tmp-metadata",
  "data-tmp-show-initial",
  "data-tmp-show-adapted",
  "data-tmp-grid",
  "data-tmp-parameter",
  "data-tmp-value",
  "data-tmp-decrement",
  "data-tmp-increment",
  "data-tmp-apply",
  "data-tmp-reset-parameter",
  "data-tmp-reset-beat",
  "data-tmp-undo",
  "data-tmp-redo",
  "data-tmp-save-edits",
  "data-tmp-load-edits",
  "data-tmp-combine-handlers",
  "data-tmp-keep-apd",
  "data-tmp-show-egm",
  "data-tmp-parameter-status",
  "data-focus-source",
  "data-focus-use-selection",
  "data-focus-node",
  "data-focus-time",
  "data-focus-velocity",
  "data-focus-preview",
  "data-focus-opposite-wall",
  "data-focus-write-raw",
  "data-focus-status",
  "data-leads-metadata",
  "data-leads-system",
  "data-leads-filter",
  "data-leads-measured",
  "data-leads-initial",
  "data-leads-adapted",
  "data-leads-rms",
  "data-leads-grid",
  "data-leads-scale",
  "data-leads-status",
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
const levels = contourLevels(0, 10, 4);
const contourIndexes = contourNodeIndexes([0, 2.05, 4.01, 6.1, 8.0, 10], levels, 0.12);
if (
  levels.length !== 4 ||
  contourIndexes.join(",") !== "1,2,3,4" ||
  sequentialRgb(0, 0, 1).length !== 3 ||
  divergingRgb(-1, 1)[0] >= divergingRgb(1, 1)[0]
) {
  console.error("Colormap or contour helper behavior changed unexpectedly");
  process.exit(1);
}
if (!mainSource.includes("Depol. slope (stored)")) {
  console.error("Missing disabled stored-only TMP parameter label");
  process.exit(1);
}

if (
  caseFixture.fileName !== "normal_male2.ECGsimcase" ||
  caseFixture.byteSize !== 11323178 ||
  !caseFixture.unsupportedPayloads.includes("unnamed PVector payloads") ||
  caseFixture.wallMapping?.status !== "unavailable" ||
  caseFixture.wallMapping?.supportsEndocardialEpicardialSwitch !== false ||
  caseFixture.wallMapping?.supportsTransmuralSelection !== false ||
  caseFixture.activationConstructions?.[1]?.entryCount !== 576 ||
  caseFixture.activationConstructions?.[1]?.sampleEntries?.[0]?.integerField !== -1 ||
  caseFixture.leadSystemDetails[0].electrodes.length !== 9 ||
  caseFixture.leadSystemDetails[2].electrodes.length !== 65 ||
  caseFixture.validation?.status !== "partial" ||
  caseFixture.validation?.unsupportedPayloadCount !== 7 ||
  !caseFixture.validation?.unavailableCapabilities?.includes("measured/initial ECG classification and lead reference-weight equations") ||
  !caseFixture.validation?.unavailableCapabilities?.includes("legacy focus raw-field mutation and opposite-wall mapping")
) {
  console.error("Unexpected case metadata fixture");
  process.exit(1);
}
if (!Number.isInteger(caseFixture.leadSystemDetails[0].electrodes[0].thoraxNodeIndex)) {
  console.error("Lead-system electrode fixture is missing nearest thorax node index");
  process.exit(1);
}
if (
  !Array.isArray(caseManifest.cases) ||
  !caseManifest.cases.some((entry) => entry.fileName === "normal_male2.ECGsimcase") ||
  !caseManifest.cases.some((entry) => entry.fileName === "WPW_Bundleonly.ECGsimcase") ||
  !caseManifest.cases.some((entry) => entry.fileName === "WPW_ectopicbeat.ECGsimcase") ||
  !caseManifest.cases.some((entry) => entry.fileName === "WPW_fusionbeat.ECGsimcase")
) {
  console.error("Unexpected supported case manifest");
  process.exit(1);
}
const wpwBundleEntry = caseManifest.cases.find((entry) => entry.fileName === "WPW_Bundleonly.ECGsimcase");
const wpwBundle = JSON.parse(
  await readFile(new URL(`../public/fixtures/cases/${wpwBundleEntry.bundle}`, import.meta.url), "utf8"),
);
const normalFocusState = createFocusEditState(caseFixture, tmpFixture.nodeCount);
if (normalFocusState.isSupported) {
  console.error("Normal case should not enable WPW focus preview tools");
  process.exit(1);
}
const wpwFocusState = createFocusEditState(wpwBundle.caseMetadata, wpwBundle.tmpWaveforms.nodeCount);
if (
  !wpwFocusState.isSupported ||
  wpwFocusState.source.entryCount !== 697 ||
  !applyFocusSelection(wpwFocusState, 12) ||
  !updateFocusParameters(wpwFocusState, { focusNode: "13", focusTimeMs: "8", velocityMmPerMs: "2" })
) {
  console.error("WPW focus edit state did not initialize or accept safe preview edits");
  process.exit(1);
}
const wpwPreview = previewFocusActivation(wpwFocusState);
if (
  wpwPreview.node !== 12 ||
  wpwPreview.reachableCount !== wpwBundle.tmpWaveforms.nodeCount ||
  wpwPreview.minMs !== 8 ||
  wpwPreview.maxMs <= wpwPreview.minMs
) {
  console.error("WPW focus preview did not recompute expected route summary");
  process.exit(1);
}
const routeTimes = fastestRouteActivationTimes(
  4,
  [
    { nodeA: 0, nodeB: 1, length: 2, velocity: 1 },
    { nodeA: 1, nodeB: 2, length: 2, velocity: 1 },
    { nodeA: 2, nodeB: 3, length: 2, velocity: 1 },
  ],
  [{ node: 2, time: 5 }],
);
if (routeTimes.join(",") !== "9,7,5,7") {
  console.error("Focus fastest-route recomputation failed");
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
const weightedRegion = computeWeightedRegionMembership([[0, 0, 0], [0.01, 0, 0], [0.015, 0, 0]], 0, 0.01, 0.01);
if (weightedRegion.length !== 3 || weightedRegion[1].weight !== 1 || Math.abs(weightedRegion[2].weight - 0.5) > 1e-9) {
  console.error("Weighted transition membership math failed");
  process.exit(1);
}
const expandedRegion = mergeWeightedRegions(
  [{ index: 5, weight: 0.5, distanceMeters: 0.02 }],
  [{ index: 6, weight: 1, distanceMeters: 0 }],
  "expand",
);
if (expandedRegion.length !== 2) {
  console.error("Selection expansion merge failed");
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
  ecgFixture.traces.length !== 6 ||
  ecgFixture.surfaceMap.nodeCount !== 300 ||
  ecgFixture.surfaceMap.sampleCount !== 576 ||
  ecgFixture.fiducials?.status !== "derived-from-legacy-export" ||
  ecgFixture.fiducials?.baselineStartIndex !== 5 ||
  ecgFixture.fiducials?.baselineEndIndex !== 499
) {
  console.error("Unexpected ECG signal fixture metadata");
  process.exit(1);
}
if (ecgFixture.traces.some((trace) => trace.values.length !== 1000)) {
  console.error("Unexpected ECG signal trace length");
  process.exit(1);
}
if (
  ecgFixture.surfaceMap.valuesByNode.length !== 300 ||
  ecgFixture.surfaceMap.valuesByNode[0].length !== 576 ||
  ecgFixture.transferMatrices?.ventriclesToThorax?.rows !== 300 ||
  ecgFixture.transferMatrices.ventriclesToThorax.columns !== 576 ||
  ecgFixture.transferMatrices.ventriclesToThorax.values.length !== 300
) {
  console.error("Unexpected ECG surface map or transfer dimensions");
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
if (baselineWindowForSignal(3).source !== "signal-ends" || baselineWindowForSignal(3, 0, 2).source !== "fiducials") {
  console.error("Baseline window source tracking failed");
  process.exit(1);
}
const rmsTrace = buildRmsTrace([{ values: [3, 4] }, { values: [0, 3] }]);
if (rmsTrace.values[0] !== Math.sqrt(4.5) || rmsTrace.values[1] !== Math.sqrt(12.5)) {
  console.error("RMS trace math failed");
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
const ari = ariValues(editState.parameters, "adapted");
const tmpAtZero = tmpAtTimeValues(editState, "adapted", 0);
const surfaceAri = heartSurfaceValues(editState, "ariMs", "adapted", 0);
const surfaceTmp = heartSurfaceValues(editState, "tmpAtTime", "adapted", 12);
if (
  ari.length !== editState.nodeCount ||
  ari[0] !== editState.parameters.repolarizationMs.adapted[0] - editState.parameters.depolarizationMs.adapted[0] ||
  tmpAtZero.length !== editState.nodeCount ||
  surfaceAri[0] !== ari[0] ||
  surfaceTmp.length !== editState.nodeCount ||
  !Number.isFinite(surfaceTmp[0])
) {
  console.error("Heart ARI or TMP-at-time surface transforms failed");
  process.exit(1);
}
if (!canRecomputeLeadTraces(ecgFixture, editState)) {
  console.error("Lead ECG recompute prerequisites were not detected");
  process.exit(1);
}
const recomputedLeadTraces = recomputeLeadTraces(ecgFixture, editState, caseFixture.leadSystemDetails[0]);
if (
  recomputedLeadTraces.length !== caseFixture.leadSystemDetails[0].electrodes.length ||
  recomputedLeadTraces[0].values.length !== editState.sampleCount ||
  !Number.isFinite(recomputedLeadTraces[0].values[0])
) {
  console.error("Lead ECG recompute produced unexpected trace dimensions");
  process.exit(1);
}
const initialBspm = recomputeThoraxSurfaceSample(ecgFixture, editState, 0, "initial");
const adaptedBspm = recomputeThoraxSurfaceSample(ecgFixture, editState, 0, "adapted");
const sensitivityValues = sensitivityValuesForSourceNode(ecgFixture, 0);
const contributionValues = contributionValuesForThoraxNode(ecgFixture, 0);
if (
  initialBspm.length !== ecgFixture.transferMatrices.ventriclesToThorax.rows ||
  adaptedBspm.length !== ecgFixture.transferMatrices.ventriclesToThorax.rows ||
  sensitivityValues.length !== ecgFixture.transferMatrices.ventriclesToThorax.rows ||
  contributionValues.length !== ecgFixture.transferMatrices.ventriclesToThorax.columns ||
  !Number.isFinite(initialBspm[0]) ||
  !Number.isFinite(adaptedBspm[0]) ||
  sensitivityValues[0] !== ecgFixture.transferMatrices.ventriclesToThorax.values[0][0] ||
  contributionValues[0] !== ecgFixture.transferMatrices.ventriclesToThorax.values[0][0]
) {
  console.error("Thorax BSPM, sensitivity, or contribution recompute produced unexpected dimensions");
  process.exit(1);
}
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
if (applyWeightedParameterValue(editState, "depolarizationMs", [{ index: 0, weight: 0.5 }], originalDep + 10) !== 1) {
  console.error("TMP weighted parameter apply failed");
  process.exit(1);
}
if (nodeParameterValue(editState, "depolarizationMs", 0, "adapted") !== originalDep + 5) {
  console.error("TMP weighted value did not blend");
  process.exit(1);
}
resetBeat(editState);
if (nodeParameterValue(editState, "depolarizationMs", 1, "adapted") !== editState.parameters.depolarizationMs.initial[1]) {
  console.error("TMP beat reset failed");
  process.exit(1);
}
const transactionalState = createTmpEditState(tmpFixture);
const transactionalOriginal = nodeParameterValue(transactionalState, "depolarizationMs", 0, "adapted");
const transaction = applyWeightedParameterTransaction(
  transactionalState,
  "depolarizationMs",
  [{ index: 0, weight: 1 }],
  transactionalOriginal + 12,
  { mode: "singleNode", centerNodeIndex: 0 },
);
if (!transaction || transactionalState.undoStack.length !== 1 || transactionalState.redoStack.length !== 0) {
  console.error("TMP transaction was not recorded");
  process.exit(1);
}
undoLastTransaction(transactionalState);
if (nodeParameterValue(transactionalState, "depolarizationMs", 0, "adapted") !== transactionalOriginal) {
  console.error("TMP undo failed");
  process.exit(1);
}
redoLastTransaction(transactionalState);
if (nodeParameterValue(transactionalState, "depolarizationMs", 0, "adapted") !== transactionalOriginal + 12) {
  console.error("TMP redo failed");
  process.exit(1);
}
resetWeightedParameterTransaction(transactionalState, "depolarizationMs", [{ index: 0, weight: 1 }]);
if (transactionalState.undoStack.length !== 2 || transactionalState.redoStack.length !== 0) {
  console.error("TMP reset transaction stack failed");
  process.exit(1);
}
const persistedState = createTmpEditState(tmpFixture);
applyWeightedParameterTransaction(
  persistedState,
  "depolarizationMs",
  [{ index: 0, weight: 1 }],
  transactionalOriginal + 21,
  { mode: "singleNode", centerNodeIndex: 0 },
);
const snapshot = serializeTmpEditState(persistedState, caseFixture);
const restoredState = createTmpEditState(tmpFixture);
applyTmpEditSnapshot(restoredState, JSON.parse(JSON.stringify(snapshot)), caseFixture);
if (
  snapshot.schema !== "org.ecgsim.source-edits" ||
  snapshot.version !== 1 ||
  nodeParameterValue(restoredState, "depolarizationMs", 0, "adapted") !== transactionalOriginal + 21 ||
  restoredState.undoStack.length !== 1
) {
  console.error("TMP edit snapshot round trip failed");
  process.exit(1);
}
try {
  applyTmpEditSnapshot(createTmpEditState(tmpFixture), snapshot, { ...caseFixture, sha256: "different" });
  console.error("TMP edit snapshot accepted a different case");
  process.exit(1);
} catch (error) {
  if (!String(error.message).includes("different case")) {
    console.error("TMP edit snapshot mismatch failed unexpectedly");
    process.exit(1);
  }
}

console.log("viewer smoke check passed");
