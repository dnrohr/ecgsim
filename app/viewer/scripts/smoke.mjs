import { readFile } from "node:fs/promises";
import { computeRegionMembership, findNearestPointIndex } from "../src/selection.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const caseFixture = JSON.parse(await readFile(new URL("../public/fixtures/case-metadata.json", import.meta.url), "utf8"));
const fixture = JSON.parse(await readFile(new URL("../public/fixtures/heart.json", import.meta.url), "utf8"));
const thoraxFixture = JSON.parse(await readFile(new URL("../public/fixtures/thorax.json", import.meta.url), "utf8"));
const ecgFixture = JSON.parse(await readFile(new URL("../public/fixtures/ecg-signals.json", import.meta.url), "utf8"));
const tmpFixture = JSON.parse(await readFile(new URL("../public/fixtures/tmp-waveforms.json", import.meta.url), "utf8"));
const required = [
  "data-viewer-shell",
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
  "data-leads-metadata",
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

if (
  caseFixture.fileName !== "normal_male2.ECGsimcase" ||
  caseFixture.byteSize !== 11323178 ||
  !caseFixture.unsupportedPayloads.includes("unnamed PVector payloads")
) {
  console.error("Unexpected case metadata fixture");
  process.exit(1);
}

if (fixture.pointCount !== 257 || fixture.triangleCount !== 510) {
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
  leftLung: [116, 228],
  rightLung: [116, 228],
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

console.log("viewer smoke check passed");
