import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const fixture = JSON.parse(await readFile(new URL("../public/fixtures/heart.json", import.meta.url), "utf8"));
const required = [
  "data-viewer-shell",
  "data-pane=\"heart\"",
  "data-pane=\"thorax\"",
  "data-pane=\"tmp\"",
  "data-pane=\"leads\"",
  "data-heart-metadata",
  "three",
  "./src/main.js",
  "./src/styles.css",
];

const missing = required.filter((token) => !html.includes(token));
if (missing.length) {
  console.error(`Missing viewer scaffold tokens: ${missing.join(", ")}`);
  process.exit(1);
}

if (fixture.pointCount !== 257 || fixture.triangleCount !== 510) {
  console.error(`Unexpected heart fixture size: ${fixture.pointCount} / ${fixture.triangleCount}`);
  process.exit(1);
}

console.log("viewer smoke check passed");
