import { readFile } from "node:fs/promises";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const required = [
  "data-viewer-shell",
  "data-pane=\"heart\"",
  "data-pane=\"thorax\"",
  "data-pane=\"tmp\"",
  "data-pane=\"leads\"",
  "./src/main.js",
  "./src/styles.css",
];

const missing = required.filter((token) => !html.includes(token));
if (missing.length) {
  console.error(`Missing viewer scaffold tokens: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("viewer smoke check passed");
