import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = resolve(viewerRoot, "../..");
const port = Number(process.env.ECGSIM_APP_TEST_PORT || 4183);
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath = findBrowserExecutable();

if (!chromePath) {
  throw new Error(
    "Unable to find a Chromium browser. Set CHROME_PATH to Chrome or Edge before running app tests.",
  );
}

const server = spawn(process.execPath, ["scripts/dev-server.mjs"], {
  cwd: viewerRoot,
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer(baseUrl);
  browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const consoleMessages = [];
  page.on("console", (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
  page.on("pageerror", (error) => consoleMessages.push(`pageerror: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-viewer-shell][data-ready='true']");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-viewer-shell][data-ready='true']");

  await assertInitialState(page);
  await assertShellLayout(page);
  await assertImportNotices(page);
  await assertHeartViewControls(page);
  await assertThoraxControls(page);
  await assertLeadsFiltering(page);
  await assertLinkedTimeCursor(page);
  await assertHeartSelectionAndTmpEditing(page);
  await assertResponsiveLayout(page);
  assertNoUnexpectedConsoleErrors(consoleMessages);

  console.log("viewer app workflow check passed");
} finally {
  if (browser) {
    await browser.close();
  }
  server.kill();
}

async function assertInitialState(page) {
  await expectText(page, "[data-case-status]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-case-leads]", "standard_12");
  await expectText(page, "[data-toolbar-lead-system]", "standard_12");
  await expectText(page, "[data-status-message]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");
  await expectText(page, "[data-tmp-metadata]", "5 nodes / 576 samples / 1000 Hz / initial+adapted");
  await expectText(page, "[data-leads-metadata]", "standard_12: 9 electrode traces / 12 leads / plotted 9 / 576 samples / 1000 Hz / BASELINE / 100%");

  assert.ok(await canvasHasContent(page, "[data-leads-canvas]"), "leads canvas should be nonblank");
  assert.ok(await canvasHasContent(page, "[data-tmp-canvas]"), "TMP canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".heart-viewport canvas"), "heart WebGL canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".thorax-viewport canvas"), "thorax WebGL canvas should be nonblank");
  await assertVisualPngExports(page);
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
}

async function assertShellLayout(page) {
  const shell = await page.evaluate(() => ({
    menu: [...document.querySelectorAll("[data-shell-menu] span")].map((item) => item.textContent),
    modes: [...document.querySelectorAll(".toolbar-mode-group output")].map((item) => item.textContent),
    workspaceColumns: getComputedStyle(document.querySelector(".workspace")).gridTemplateColumns,
    statusHeight: document.querySelector(".statusbar").getBoundingClientRect().height,
  }));

  assert.deepEqual(shell.menu, ["File", "Edit", "Heart", "Thorax", "ECGs", "Options", "Help"]);
  assert.deepEqual(shell.modes, ["Heart", "Thorax", "TMP", "ECGs"]);
  assert.ok(shell.workspaceColumns.includes("px"), "workspace should render as a visible grid");
  assert.ok(shell.statusHeight >= 20, "status bar should remain visible");
}

async function assertImportNotices(page) {
  const caseInput = page.locator("[data-case-file]");
  await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"));
  await expectText(page, "[data-case-notice]", "normal_male2.ECGsimcase loaded from a supported web case bundle");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");

  await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases/WPW_ectopicbeat.ECGsimcase"));
  await expectText(page, "[data-case-status]", "WPW_ectopicbeat.ECGsimcase");
  await expectText(page, "[data-case-notice]", "WPW_ectopicbeat.ECGsimcase loaded from a supported web case bundle");
  await expectText(page, "[data-case-leads]", "BSM_(amsterdam_64)");
  await expectText(page, "[data-toolbar-lead-system]", "BSM_(amsterdam_64)");
  await expectText(page, "[data-status-message]", "WPW_ectopicbeat.ECGsimcase loaded");
  await expectText(page, "[data-heart-metadata]", "1216 nodes / 2272 triangles");
  await expectText(page, "[data-tmp-metadata]", "5 nodes / 576 samples / 1000 Hz");

  const unsupportedPath = resolve(tmpdir(), "unsupported.ECGsimcase");
  writeFileSync(unsupportedPath, "not an ecgsim case");
  await caseInput.setInputFiles(unsupportedPath);
  await expectText(page, "[data-case-status]", "WPW_ectopicbeat.ECGsimcase");
  await expectText(page, "[data-case-notice]", "unsupported.ECGsimcase is not in the supported web bundle manifest");

  await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"));
  await expectText(page, "[data-case-status]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");
}

async function assertThoraxControls(page) {
  const canvas = ".thorax-viewport canvas";
  await expectText(page, "[data-thorax-surface-status]", "Geometry / 100% / measured map available");
  await expectText(page, "[data-thorax-selection]", "9 electrodes");
  assert.equal(await page.locator("[data-thorax-electrodes]").isEnabled(), true, "electrode toggle should be available");
  assert.equal(await page.locator("[data-thorax-lock-heart]").isDisabled(), true, "lock-to-heart should show unavailable state");
  assert.equal(await page.locator("[data-thorax-surface] option[value='measured']").isDisabled(), false, "measured BSPM should be available");

  const before = await canvasSignature(page, canvas);
  await page.locator("[data-thorax-electrodes]").check();
  await page.waitForTimeout(150);
  const electrodesShown = await canvasSignature(page, canvas);
  assert.notEqual(electrodesShown, before, "Thorax electrode toggle should draw selected lead-system markers");

  await page.locator("[data-thorax-surface]").selectOption("measured");
  await expectText(page, "[data-thorax-surface-status]", "Measured BSPM / 100% / 0 ms");
  await expectText(page, "[data-status-message]", "Measured thorax BSPM map shown");
  await page.waitForTimeout(150);
  const mapped = await canvasSignature(page, canvas);
  assert.notEqual(mapped, electrodesShown, "Measured BSPM should recolor the thorax canvas");

  await setRangeValue(page, "[data-thorax-scale]", "120");
  await expectText(page, "[data-thorax-surface-status]", "Measured BSPM / 120% / 0 ms");
  await page.waitForTimeout(150);
  const scaled = await canvasSignature(page, canvas);
  assert.notEqual(scaled, mapped, "Thorax scale control should change canvas output");

  await page.locator("[data-thorax-ap]").click();
  await expectText(page, "[data-status-message]", "Thorax view reset to AP orientation");
  assert.equal(await page.locator("[data-thorax-rotate]").isChecked(), false, "Thorax AP reset should stop auto-rotation");

  await page.locator("[data-thorax-rotate]").check();
  assert.equal(await page.locator("[data-thorax-rotate]").isChecked(), true, "Thorax rotate toggle should re-enable");

  const leftLung = page.locator("[data-toggle-mesh='leftLung']");
  await leftLung.uncheck();
  assert.equal(await leftLung.isChecked(), false, "left lung toggle should uncheck");
  await page.waitForTimeout(150);
  const hidden = await canvasSignature(page, canvas);
  assert.notEqual(hidden, scaled, "thorax canvas should change when a lung is hidden");

  await leftLung.check();
  assert.equal(await leftLung.isChecked(), true, "left lung toggle should re-check");

  const selected = await selectThoraxNode(page);
  assert.match(selected, /Node \d+ \/ \d+ electrodes \/ maps unavailable/, "thorax click should select a node");
  await expectText(page, "[data-status-message]", "Thorax node");
}

async function assertHeartViewControls(page) {
  const canvas = ".heart-viewport canvas";
  const geometrySignature = await canvasSignature(page, canvas);

  assert.equal(await page.locator("[data-heart-wall]").isDisabled(), true, "Endo/Epi control should be unavailable without wall mapping");
  assert.equal(await page.locator("[data-heart-transmural]").isDisabled(), true, "Transmural control should be unavailable without wall mapping");
  const wallTitle = await page.locator("[data-heart-wall]").getAttribute("title");
  const transmuralTitle = await page.locator("[data-heart-transmural]").getAttribute("title");
  assert.match(wallTitle ?? "", /PGraphGeometry payload semantics/, "Endo/Epi disabled state should explain the missing mapping");
  assert.match(transmuralTitle ?? "", /PGraphGeometry payload semantics/, "Transmural disabled state should explain the missing mapping");

  await page.locator("[data-heart-surface]").selectOption("depolarizationMs");
  await expectText(page, "[data-heart-surface-status]", "Depolarization / adapted");
  await page.waitForTimeout(150);
  const depolarizationSignature = await canvasSignature(page, canvas);
  assert.notEqual(depolarizationSignature, geometrySignature, "Heart surface function should recolor mesh");

  await page.locator("[data-heart-values]").selectOption("initial");
  await expectText(page, "[data-heart-surface-status]", "Depolarization / initial");

  await page.locator("[data-heart-ap]").click();
  await expectText(page, "[data-status-message]", "Heart view reset to AP orientation");
  assert.equal(await page.locator("[data-heart-rotate]").isChecked(), false, "AP reset should stop auto-rotation");

  await page.locator("[data-heart-rotate]").check();
  assert.equal(await page.locator("[data-heart-rotate]").isChecked(), true, "Rotate toggle should re-enable");

  await page.locator("[data-heart-surface]").selectOption("geometry");
  await expectText(page, "[data-heart-surface-status]", "Geometry");
}

async function assertLeadsFiltering(page) {
  const canvas = "[data-leads-canvas]";
  await expectText(page, "[data-leads-status]", "Baseline fallback uses signal endpoints");
  await expectText(page, "[data-leads-status]", "measured/initial/adapted classification unavailable");
  assert.equal(await page.locator("[data-leads-measured]").isDisabled(), true, "measured overlay should be unavailable");
  assert.equal(await page.locator("[data-leads-initial]").isDisabled(), true, "initial overlay should be unavailable");
  assert.equal(await page.locator("[data-leads-adapted]").isDisabled(), true, "adapted overlay should be unavailable");

  const baselineSignature = await canvasSignature(page, canvas);

  await page.locator("[data-leads-system]").selectOption("VCG_(Frank)");
  await expectText(page, "[data-leads-metadata]", "VCG_(Frank): 7 electrode traces / 10 leads");
  const vcgSignature = await canvasSignature(page, canvas);
  assert.notEqual(vcgSignature, baselineSignature, "Lead-system metadata switch should redraw leads");

  await expectText(page, "[data-thorax-selection]", "7 electrodes");

  await setRangeValue(page, "[data-leads-scale]", "150");
  await expectText(page, "[data-leads-metadata]", "/ 150%");
  const scaledSignature = await canvasSignature(page, canvas);
  assert.notEqual(scaledSignature, vcgSignature, "Lead scale should redraw leads");

  await page.locator("[data-leads-rms]").check();
  await expectText(page, "[data-leads-metadata]", "plotted 8");
  const rmsSignature = await canvasSignature(page, canvas);
  assert.notEqual(rmsSignature, scaledSignature, "RMS overlay should add a plotted trace");

  await page.locator("[data-leads-grid]").uncheck();
  const noGridSignature = await canvasSignature(page, canvas);
  assert.notEqual(noGridSignature, rmsSignature, "Grid toggle should redraw leads");
  await page.locator("[data-leads-grid]").check();

  await page.locator("[data-leads-filter]").selectOption("ac");
  await expectText(page, "[data-leads-metadata]", "/ AC");
  await expectText(page, "[data-leads-status]", "AC coupling, time mean removed");
  const acSignature = await canvasSignature(page, canvas);
  assert.notEqual(acSignature, noGridSignature, "AC coupling should redraw leads");

  await page.locator("[data-leads-filter]").selectOption("dc");
  await expectText(page, "[data-leads-metadata]", "/ DC");
  await expectText(page, "[data-leads-status]", "DC coupling, unfiltered");
  assert.equal(await page.locator("[data-leads-filter]").inputValue(), "dc", "DC coupling should be selected");

  await page.locator("[data-leads-filter]").selectOption("baseline");
  await expectText(page, "[data-leads-metadata]", "/ BASELINE");
  await expectText(page, "[data-leads-status]", "Baseline fallback uses signal endpoints");
  await page.locator("[data-leads-system]").selectOption("standard_12");
  await setRangeValue(page, "[data-leads-scale]", "100");
  await page.locator("[data-leads-rms]").uncheck();
}

async function assertLinkedTimeCursor(page) {
  const leadsCanvas = "[data-leads-canvas]";
  const tmpCanvas = "[data-tmp-canvas]";
  const thoraxCanvas = ".thorax-viewport canvas";
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
  const leadsCursorBefore = await yellowCursorX(page, leadsCanvas);
  const tmpCursorBefore = await yellowCursorX(page, tmpCanvas);
  const thoraxBefore = await canvasSignature(page, thoraxCanvas);

  await page.locator("[data-time-step-forward]").click();
  await expectText(page, "[data-time-status]", "2 ms / 575 ms");

  await setRangeValue(page, "[data-time-cursor]", "120");
  await expectText(page, "[data-time-status]", "120 ms / 575 ms");
  assert.ok(await yellowCursorX(page, leadsCanvas) > leadsCursorBefore + 20, "Time range should move Leads cursor line");
  assert.ok(await yellowCursorX(page, tmpCanvas) > tmpCursorBefore + 20, "Time range should move TMP cursor line");
  assert.notEqual(await canvasSignature(page, thoraxCanvas), thoraxBefore, "Time range should update measured Thorax BSPM colors");

  await page.locator(tmpCanvas).focus();
  await page.keyboard.press("ArrowRight");
  await expectText(page, "[data-time-status]", "122 ms / 575 ms");

  await page.locator("[data-time-play]").click();
  await expectText(page, "[data-time-play]", "Pause");
  await page.waitForFunction(() => document.querySelector("[data-time-cursor]")?.value !== "122");
  await page.locator("[data-time-play]").click();
  await expectText(page, "[data-time-play]", "Play");

  await setRangeValue(page, "[data-time-cursor]", "0");
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
}

async function assertHeartSelectionAndTmpEditing(page) {
  const selected = await selectHeartNode(page);
  assert.match(selected, /Node \d+ \/ 20 mm \/ 0 mm transition \/ \d+ nodes \/ 0 weighted/, "heart click should select a node");

  await setRangeValue(page, "[data-heart-radius]", "30");
  await expectText(page, "[data-heart-selection]", "30 mm");
  const radiusSelection = await page.locator("[data-heart-selection]").textContent();

  await setRangeValue(page, "[data-heart-transition]", "10");
  await expectText(page, "[data-heart-selection]", "10 mm transition");
  await expectText(page, "[data-heart-selection]", "weighted");
  const transitionSelection = await page.locator("[data-heart-selection]").textContent();
  assert.notEqual(transitionSelection, radiusSelection, "Transition zone should alter selected-region summary");

  await page.locator("[data-heart-selection-mode]").selectOption("expand");
  assert.equal(await page.locator("[data-heart-selection-mode]").inputValue(), "expand", "Expand selection mode should be selected");

  const valueInput = page.locator("[data-tmp-value]");
  const incrementButton = page.locator("[data-tmp-increment]");
  const applyButton = page.locator("[data-tmp-apply]");
  const resetParameter = page.locator("[data-tmp-reset-parameter]");
  const resetBeat = page.locator("[data-tmp-reset-beat]");
  const undoButton = page.locator("[data-tmp-undo]");
  const redoButton = page.locator("[data-tmp-redo]");
  const saveEdits = page.locator("[data-tmp-save-edits]");
  const loadEdits = page.locator("[data-tmp-load-edits]");
  const exportEdits = page.locator("[data-tmp-export-edits]");
  const importEdits = page.locator("[data-tmp-import-edits]");

  assert.equal(await valueInput.isEnabled(), true, "TMP value should enable after heart selection");
  assert.equal(await incrementButton.isEnabled(), true, "TMP increment should enable after heart selection");
  assert.equal(await applyButton.isEnabled(), true, "TMP apply should enable after heart selection");
  assert.equal(await undoButton.isDisabled(), true, "Undo should start disabled");
  assert.equal(await redoButton.isDisabled(), true, "Redo should start disabled");
  assert.equal(await saveEdits.isDisabled(), true, "Save edits should start disabled");
  assert.equal(await loadEdits.isDisabled(), true, "Load edits should start disabled without a saved snapshot");
  assert.equal(await exportEdits.isDisabled(), true, "Export edits should start disabled");
  assert.equal(await importEdits.isEnabled(), true, "Import edits should be available for the loaded case");
  assert.equal(await page.locator("[data-tmp-combine-handlers]").isDisabled(), true, "combined TMP handlers should be unavailable");
  assert.equal(await page.locator("[data-tmp-keep-apd]").isDisabled(), true, "constant APD mode should be unavailable");
  assert.equal(await page.locator("[data-tmp-show-egm]").isDisabled(), true, "electrogram toggle should be unavailable");
  await expectText(page, "[data-tmp-parameter-status]", "Initial");

  const tmpControlsBefore = await canvasSignature(page, "[data-tmp-canvas]");
  await page.locator("[data-tmp-show-initial]").uncheck();
  await expectText(page, "[data-tmp-metadata]", "/ adapted");
  const adaptedOnly = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(adaptedOnly, tmpControlsBefore, "TMP initial visibility toggle should redraw");
  await page.locator("[data-tmp-show-initial]").check();

  await page.locator("[data-tmp-grid]").uncheck();
  const noGrid = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(noGrid, adaptedOnly, "TMP grid toggle should redraw");
  await page.locator("[data-tmp-grid]").check();

  const originalValue = Number(await valueInput.inputValue());
  await incrementButton.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue + 1, "TMP increment should nudge by parameter step");
  assert.equal(await undoButton.isEnabled(), true, "Undo should enable after TMP edit");
  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore nudged value");

  const tmpBefore = await canvasSignature(page, "[data-tmp-canvas]");
  const editedValue = originalValue + 7;

  await valueInput.fill(String(editedValue));
  await applyButton.click();
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Apply should keep the edited TMP value");
  const tmpEdited = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(tmpEdited, tmpBefore, "TMP canvas should redraw after parameter edit");

  await undoButton.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Undo should restore prior TMP value");
  assert.equal(await redoButton.isEnabled(), true, "Redo should enable after undo");

  await redoButton.click();
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Redo should restore edited TMP value");
  assert.equal(await redoButton.isDisabled(), true, "Redo should disable after replay");

  assert.equal(await saveEdits.isEnabled(), true, "Save edits should enable after a transaction");
  assert.equal(await exportEdits.isEnabled(), true, "Export edits should enable after a transaction");
  await saveEdits.click();
  await expectText(page, "[data-status-message]", "TMP edits saved");
  assert.equal(await loadEdits.isEnabled(), true, "Load edits should enable after saving");

  const downloadPromise = page.waitForEvent("download");
  await exportEdits.click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /\.source-edits\.json$/, "Exported sidecar should use JSON sidecar suffix");
  const sidecarPath = await download.path();
  const sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
  assert.equal(sidecar.schema, "org.ecgsim.source-edits", "Exported sidecar should use source-edit schema");
  assert.equal(sidecar.adaptedValues.depolarizationMs.length > 0, true, "Exported sidecar should include adapted values");
  await expectText(page, "[data-status-message]", "TMP edit sidecar exported");

  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore initial value");

  await loadEdits.click();
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Load edits should restore persisted adapted value");
  await expectText(page, "[data-status-message]", "TMP edits loaded");

  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore initial value after load");

  await importEdits.setInputFiles(sidecarPath);
  await expectText(page, "[data-status-message]", "TMP edit sidecar imported");
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Import edits should restore exported adapted value");

  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore initial value after import");

  await valueInput.fill(String(editedValue));
  await applyButton.click();
  await resetBeat.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset beat should restore initial value");
}

async function assertVisualPngExports(page) {
  for (const target of ["heart", "thorax", "tmp", "leads"]) {
    const downloadPromise = page.waitForEvent("download");
    await page.locator(`[data-export-image='${target}']`).click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), new RegExp(`-${target}\\.png$`), `${target} export should name a PNG`);
    const imagePath = await download.path();
    const image = readFileSync(imagePath);
    assertPngImage(image, `${target} PNG`);
    await expectText(page, "[data-status-message]", "PNG exported");
  }
}

function assertPngImage(buffer, label) {
  assert.equal(buffer.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${label} should have PNG signature`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  assert.ok(width >= 300, `${label} width should be useful`);
  assert.ok(height >= 200, `${label} height should be useful`);
  assert.ok(buffer.length > 1000, `${label} should contain image data`);
}

async function assertResponsiveLayout(page) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(250);
  const layout = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    heartWidth: document.querySelector(".heart-viewport canvas").getBoundingClientRect().width,
    leadsWidth: document.querySelector("[data-leads-canvas]").getBoundingClientRect().width,
    tmpWidth: document.querySelector("[data-tmp-canvas]").getBoundingClientRect().width,
  }));

  assert.equal(layout.bodyScrollWidth, layout.clientWidth, "mobile layout should not overflow horizontally");
  assert.ok(layout.heartWidth > 300, "heart canvas should remain visible on mobile");
  assert.ok(layout.leadsWidth > 300, "leads canvas should remain visible on mobile");
  assert.ok(layout.tmpWidth > 300, "TMP canvas should remain visible on mobile");
}

async function selectHeartNode(page) {
  const canvas = page.locator(".heart-viewport canvas");
  const box = await canvas.boundingBox();
  assert.ok(box, "heart canvas should have a bounding box");
  const points = [
    [0.5, 0.5],
    [0.42, 0.48],
    [0.58, 0.48],
    [0.5, 0.38],
    [0.5, 0.62],
    [0.35, 0.35],
    [0.5, 0.35],
    [0.65, 0.35],
    [0.35, 0.5],
    [0.65, 0.5],
    [0.35, 0.65],
    [0.5, 0.65],
    [0.65, 0.65],
  ];
  for (const [xRatio, yRatio] of points) {
    await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio);
    const selection = await page.locator("[data-heart-selection]").textContent();
    if (selection && !selection.includes("Node --")) {
      return selection;
    }
  }
  return await page.locator("[data-heart-selection]").textContent();
}

async function selectThoraxNode(page) {
  const canvas = page.locator(".thorax-viewport canvas");
  const box = await canvas.boundingBox();
  assert.ok(box, "thorax canvas should have a bounding box");
  const points = [
    [0.5, 0.5],
    [0.45, 0.45],
    [0.55, 0.45],
    [0.45, 0.58],
    [0.55, 0.58],
    [0.5, 0.35],
    [0.5, 0.65],
  ];
  for (const [xRatio, yRatio] of points) {
    await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio);
    const selection = await page.locator("[data-thorax-selection]").textContent();
    if (selection && !selection.includes("Node --")) {
      return selection;
    }
  }
  return await page.locator("[data-thorax-selection]").textContent();
}

async function setRangeValue(page, selector, value) {
  await page.locator(selector).evaluate((element, nextValue) => {
    element.value = nextValue;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

async function expectText(page, selector, expected) {
  await page.waitForFunction(
    ({ selector: targetSelector, expected: expectedText }) => {
      const element = document.querySelector(targetSelector);
      return element?.textContent?.includes(expectedText) || element?.value?.includes(expectedText);
    },
    { selector, expected },
  );
}

async function canvasHasContent(page, selector) {
  return (await canvasSignature(page, selector)) > 0;
}

async function canvasSignature(page, selector) {
  return await page.locator(selector).evaluate((canvas) => {
    const width = canvas.width;
    const height = canvas.height;
    const scratch = document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const context = scratch.getContext("2d");
    context.drawImage(canvas, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    const xStep = Math.max(1, Math.floor(width / 32));
    const yStep = Math.max(1, Math.floor(height / 32));
    let signature = 0;
    for (let y = 0; y < height; y += yStep) {
      for (let x = 0; x < width; x += xStep) {
        const index = (y * width + x) * 4;
        signature = (
          signature +
          data[index] * 3 +
          data[index + 1] * 5 +
          data[index + 2] * 7 +
          data[index + 3] * 11 +
          index
        ) % 1000000007;
      }
    }
    return signature;
  });
}

async function yellowCursorX(page, selector) {
  return await page.locator(selector).evaluate((canvas) => {
    const width = canvas.width;
    const height = canvas.height;
    const scratch = document.createElement("canvas");
    scratch.width = width;
    scratch.height = height;
    const context = scratch.getContext("2d");
    context.drawImage(canvas, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    let weightedX = 0;
    let count = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        if (data[index] > 210 && data[index + 1] > 150 && data[index + 2] < 40) {
          weightedX += x;
          count += 1;
        }
      }
    }
    return count ? weightedX / count : -1;
  });
}

function assertNoUnexpectedConsoleErrors(messages) {
  const unexpected = messages.filter(
    (message) =>
      message.startsWith("pageerror:") ||
      message.startsWith("error:"),
  );
  assert.deepEqual(unexpected, [], `unexpected browser console errors: ${unexpected.join("; ")}`);
}

async function waitForServer(url) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server has accepted connections.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function findBrowserExecutable() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}
