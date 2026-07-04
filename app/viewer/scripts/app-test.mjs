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
  await assertHelpAbout(page);
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
  await expectText(page, "[data-leads-metadata]", "standard_12: 12 parsed lead traces / 12 leads / plotted 12 / 576 samples / 1000 Hz / BASELINE / 100%");
  await expectText(page, "[data-case-validation]", "Partial: 7 unsupported payload groups / 5 unavailable capabilities");
  await expectText(page, "[data-focus-status]", "Focus preview is enabled only for supported WPW cases");
  assert.equal(await page.locator("[data-heart-source-mesh]").isChecked(), true, "Heart source mesh should be visible at launch");
  assert.equal(await page.locator("[data-visual-mode-navigator]").inputValue(), "heart-source-mesh", "visual navigator should start on Heart source mesh");
  await expectText(page, "[data-heart-overlay-status]", "576 source mesh nodes");

  assert.ok(await canvasHasContent(page, "[data-leads-canvas]"), "leads canvas should be nonblank");
  assert.ok(await canvasHasContent(page, "[data-tmp-canvas]"), "TMP canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".heart-viewport canvas"), "heart WebGL canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".thorax-viewport canvas"), "thorax WebGL canvas should be nonblank");
  await assertCoreVisualsVisible(page);
  await assertPaneBadges(page);
  await assertElectrogramEvidenceBlocker(page);
  await assertVisualModeNavigator(page);
  await assertVisualPngExports(page);
  await assertMovieExport(page);
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
}

async function assertPaneBadges(page) {
  await expectText(page, "[data-heart-mode-badge]", "Geometry");
  await expectText(page, "[data-heart-provenance-badge]", "Parsed mesh");
  await expectText(page, "[data-thorax-mode-badge]", "Geometry");
  await expectText(page, "[data-thorax-provenance-badge]", "Parsed meshes");
  await expectText(page, "[data-tmp-mode-badge]", "initial+adapted");
  await expectText(page, "[data-tmp-provenance-badge]", "Source params");
  await expectText(page, "[data-leads-mode-badge]", "BASELINE");
  await expectText(page, "[data-leads-provenance-badge]", "Case signals");
}

async function assertElectrogramEvidenceBlocker(page) {
  const egmControl = page.locator("[data-tmp-show-egm]");
  assert.equal(await egmControl.isEnabled(), true, "EGM display should be available as a computed preview");
  const title = await egmControl.locator("xpath=..").getAttribute("title");
  assert.match(title ?? "", /computed preview/i, "EGM title should name the computed preview");
  assert.match(title ?? "", /VENTR\.VENTRICLES role/i, "EGM title should name the missing legacy role validation");
  assert.equal(await egmControl.getAttribute("data-evidence-status"), "computed-preview", "EGM evidence status should come from case metadata");
  assert.equal(await egmControl.getAttribute("data-candidate-matrix-count"), "0", "EGM evidence should report no candidate matrices");
  assert.equal(await egmControl.getAttribute("data-transfer-matrix-index"), "27", "EGM preview should use transfer matrix index 27");
}

async function assertVisualModeNavigator(page) {
  const navigator = page.locator("[data-visual-mode-navigator]");
  assert.equal(await navigator.isEnabled(), true, "visual mode navigator should be enabled at launch");

  await navigator.selectOption("heart-ari");
  await expectText(page, "[data-heart-mode-badge]", "ARI");
  await expectText(page, "[data-heart-provenance-badge]", "Derived ARI");
  assert.equal(await page.locator("[data-heart-surface]").inputValue(), "ariMs", "navigator should set Heart surface mode");

  await navigator.selectOption("heart-source-mesh");
  await expectText(page, "[data-heart-overlay-status]", "576 source mesh nodes");
  assert.equal(await page.locator("[data-heart-source-mesh]").isChecked(), true, "navigator should enable parsed source mesh overlay");
  await page.locator("[data-heart-source-mesh]").uncheck();

  await navigator.selectOption("heart-wall-depth");
  await expectText(page, "[data-heart-mode-badge]", "Source wall depth");
  await expectText(page, "[data-heart-provenance-badge]", "Computed source mesh");
  assert.equal(await page.locator("[data-heart-surface]").inputValue(), "sourceWallDepth", "navigator should set computed wall-depth mode");

  await navigator.selectOption("thorax-measured");
  await expectText(page, "[data-thorax-mode-badge]", "Measured BSPM");
  await expectText(page, "[data-thorax-provenance-badge]", "Case BSPM");
  assert.equal(await page.locator("[data-thorax-surface]").inputValue(), "measured", "navigator should set Thorax surface mode");

  await navigator.selectOption("leads-vcg");
  await expectText(page, "[data-leads-metadata]", "VCG_(Frank)");
  assert.equal(await page.locator("[data-leads-system]").inputValue(), "VCG_(Frank)", "navigator should select Frank VCG traces");

  await navigator.selectOption("leads-adapted");
  await expectText(page, "[data-leads-provenance-badge]", "Recomputed");
  assert.equal(await page.locator("[data-leads-adapted]").isChecked(), true, "navigator should enable adapted lead recompute");

  await page.locator("[data-tmp-show-initial]").uncheck();
  await expectText(page, "[data-tmp-mode-badge]", "adapted");
  await navigator.selectOption("tmp-traces");
  await expectText(page, "[data-tmp-mode-badge]", "initial+adapted");
  assert.equal(await page.locator("[data-tmp-show-initial]").isChecked(), true, "navigator should restore initial TMP traces");

  await navigator.selectOption("heart-geometry");
  await navigator.selectOption("thorax-geometry");
  await navigator.selectOption("leads-case");
  await expectText(page, "[data-heart-mode-badge]", "Geometry");
  await expectText(page, "[data-thorax-mode-badge]", "Geometry");
  await expectText(page, "[data-leads-provenance-badge]", "Case signals");
}

async function assertCoreVisualsVisible(page) {
  const layout = await page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const rectFor = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(viewportHeight, rect.bottom);
      return {
        top: rect.top,
        width: rect.width,
        height: rect.height,
        visibleHeight: Math.max(0, visibleBottom - visibleTop),
      };
    };
    return {
      viewportHeight,
      heart: rectFor(".heart-viewport canvas"),
      thorax: rectFor(".thorax-viewport canvas"),
      tmp: rectFor("[data-tmp-canvas]"),
      leads: rectFor("[data-leads-canvas]"),
    };
  });

  assert.ok(layout.heart.top < layout.viewportHeight * 0.45, "Heart canvas should start in the upper half of the first viewport");
  assert.ok(layout.thorax.top < layout.viewportHeight * 0.45, "Thorax canvas should start in the upper half of the first viewport");
  assert.ok(layout.heart.visibleHeight >= 180, "Heart canvas should have useful visible height at launch");
  assert.ok(layout.thorax.visibleHeight >= 160, "Thorax canvas should have useful visible height at launch");
  assert.ok(layout.tmp.visibleHeight > 0, "TMP canvas should be visible at launch");
  assert.ok(layout.leads.visibleHeight > 0, "Leads canvas should be visible at launch");
}

async function assertShellLayout(page) {
  const shell = await page.evaluate(() => ({
    menu: [...document.querySelectorAll("[data-shell-menu] button")].map((item) => ({
      text: item.textContent,
      disabled: item.disabled,
      action: item.dataset.menuAction,
    })),
    modes: [...document.querySelectorAll(".toolbar-mode-group output")].map((item) => item.textContent),
    workspaceColumns: getComputedStyle(document.querySelector(".workspace")).gridTemplateColumns,
    statusHeight: document.querySelector(".statusbar").getBoundingClientRect().height,
  }));

  assert.deepEqual(shell.menu.map((item) => item.text), ["File", "Edit", "Heart", "Thorax", "ECGs", "Options", "Help"]);
  assert.deepEqual(shell.menu.map((item) => item.action), ["file", "edit", "heart", "thorax", "ecgs", "options", "help"]);
  assert.equal(shell.menu.every((item) => item.disabled === false), true, "shell menu entries should be enabled buttons");
  assert.deepEqual(shell.modes, ["Heart", "Thorax", "TMP", "ECGs"]);
  assert.ok(shell.workspaceColumns.includes("px"), "workspace should render as a visible grid");
  assert.ok(shell.statusHeight >= 20, "status bar should remain visible");

  await page.locator("[data-menu-action='heart']").click();
  assert.equal(await page.locator("[data-visual-mode-navigator]").inputValue(), "heart-source-mesh", "Heart menu should select the visible Heart source mesh mode");
  assert.equal(await page.locator("[data-heart-source-mesh]").isChecked(), true, "Heart menu should keep the source mesh visible");
  await page.locator("[data-menu-action='thorax']").click();
  assert.equal(await page.locator("[data-visual-mode-navigator]").inputValue(), "thorax-geometry", "Thorax menu should select Thorax geometry");
  await page.locator("[data-menu-action='ecgs']").click();
  assert.equal(await page.locator("[data-visual-mode-navigator]").inputValue(), "leads-case", "ECGs menu should select Leads case ECG");
  await page.locator("[data-menu-action='help']").click();
  await expectText(page, "[data-help-dialog]", "About ECGSIM Viewer");
  await page.locator("[data-help-close]").click();
  await page.locator("[data-heart-source-mesh]").uncheck();
  await expectText(page, "[data-heart-overlay-status]", "Overlays off");
}

async function assertHelpAbout(page) {
  await page.locator("[data-help-open]").click();
  await expectText(page, "[data-help-dialog]", "About ECGSIM Viewer");
  await expectText(page, "[data-help-version]", "0.1.0 / browser-static");
  await expectText(page, "[data-help-case]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-help-validation]", "Partial");
  await expectText(page, "[data-help-cases]", "WPW_fusionbeat.ECGsimcase");
  await expectText(page, "[data-help-dialog]", "van Oosterom");
  await expectText(page, "[data-help-dialog]", "ecgsim.org");
  await expectText(page, "[data-help-dialog]", "not clinical diagnosis");
  await expectText(page, "[data-status-message]", "Help and references opened");
  await page.locator("[data-help-close]").click();
  await page.waitForFunction(() => !document.querySelector("[data-help-dialog]")?.open);
}

async function assertImportNotices(page) {
  const caseInput = page.locator("[data-case-file]");
  const bundleInput = page.locator("[data-case-bundle-file]");
  const caseManifest = JSON.parse(readFileSync(resolve(viewerRoot, "public/fixtures/cases/manifest.json"), "utf8"));
  const normalBundle = caseManifest.cases.find((entry) => entry.fileName === "normal_male2.ECGsimcase");
  const wpwCases = [
    ["WPW_Bundleonly.ECGsimcase", 16809796],
    ["WPW_ectopicbeat.ECGsimcase", 17451796],
    ["WPW_fusionbeat.ECGsimcase", 16875796],
  ];
  await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"));
  await expectText(page, "[data-case-notice]", "normal_male2.ECGsimcase loaded from a supported web case bundle");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");

  for (const [fileName, byteSize] of wpwCases) {
    await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases", fileName));
    await expectText(page, "[data-case-status]", fileName);
    await expectText(page, "[data-case-notice]", `${fileName} loaded from a supported web case bundle`);
    await expectText(page, "[data-case-size]", byteSize.toLocaleString());
    await expectText(page, "[data-case-validation]", "Partial: 7 unsupported payload groups / 6 unavailable capabilities");
    await expectText(page, "[data-case-leads]", "BSM_(amsterdam_64)");
    await expectText(page, "[data-toolbar-lead-system]", "BSM_(amsterdam_64)");
    await expectText(page, "[data-status-message]", `${fileName} loaded`);
    await expectText(page, "[data-heart-metadata]", "1216 nodes / 2272 triangles");
    await expectText(page, "[data-tmp-metadata]", "5 nodes / 576 samples / 1000 Hz");
    await page.locator("[data-leads-system]").selectOption("BSM_(amsterdam_64)");
    await expectText(page, "[data-leads-metadata]", "BSM_(amsterdam_64): 65 parsed lead traces");
    assert.equal(await page.locator("[data-leads-measured]").isDisabled(), true, "WPW measured overlay should stay unavailable without promoted .refECG evidence");
  }

  await expectText(page, "[data-focus-source]", "ventricles / 697 records");
  await expectText(page, "[data-focus-status]", "WPW focus records inspectable");
  assert.equal(await page.locator("[data-focus-opposite-wall]").isDisabled(), true, "Opposite-wall focus mapping should remain unavailable");
  assert.equal(await page.locator("[data-focus-write-raw]").isDisabled(), true, "Raw focus field writes should remain unavailable");
  await selectHeartNode(page);
  assert.equal(await page.locator("[data-focus-use-selection]").isEnabled(), true, "WPW selected heart node should enable focus preview selection");
  await page.locator("[data-focus-use-selection]").click();
  await page.locator("[data-focus-preview]").click();
  await expectText(page, "[data-focus-status]", "Preview linear-index-preview");

  const unsupportedPath = resolve(tmpdir(), "unsupported.ECGsimcase");
  writeFileSync(unsupportedPath, "not an ecgsim case");
  await caseInput.setInputFiles(unsupportedPath);
  await expectText(page, "[data-case-status]", "WPW_fusionbeat.ECGsimcase");
  await expectText(page, "[data-case-notice]", "unsupported.ECGsimcase is not in the supported web bundle manifest");

  await bundleInput.setInputFiles(resolve(viewerRoot, "public/fixtures/cases", normalBundle.bundle));
  await expectText(page, "[data-case-status]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-case-notice]", `${normalBundle.bundle} loaded from a generated case bundle`);
  await expectText(page, "[data-case-leads]", "standard_12");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");
  await expectText(page, "[data-tmp-metadata]", "5 nodes / 576 samples / 1000 Hz");
  await expectText(page, "[data-leads-metadata]", "standard_12: 12 parsed lead traces");

  const invalidBundlePath = resolve(tmpdir(), "invalid-bundle.json");
  writeFileSync(invalidBundlePath, JSON.stringify({ caseMetadata: { fileName: "broken" } }));
  await bundleInput.setInputFiles(invalidBundlePath);
  await expectText(page, "[data-case-status]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-case-notice]", "invalid-bundle.json could not be opened as a generated case bundle");
  await expectText(page, "[data-case-notice]", "missing heart");

  await caseInput.setInputFiles(resolve(repoRoot, "research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase"));
  await expectText(page, "[data-case-status]", "normal_male2.ECGsimcase");
  await expectText(page, "[data-case-notice]", "normal_male2.ECGsimcase loaded from a supported web case bundle");
  await expectText(page, "[data-heart-metadata]", "912 nodes / 1696 triangles");
}

async function assertThoraxControls(page) {
  const canvas = ".thorax-viewport canvas";
  await expectText(page, "[data-thorax-surface-status]", "Geometry / 100% / measured map available");
  await expectText(page, "[data-thorax-selection]", "9 electrodes");
  assert.equal(await page.locator("[data-thorax-electrodes]").isEnabled(), true, "electrode toggle should be available");
  assert.equal(await page.locator("[data-thorax-electrode-target]").isEnabled(), true, "electrode target selector should be available");
  assert.equal(await page.locator("[data-thorax-target-electrode]").isEnabled(), true, "electrode target button should be available");
  assert.equal(await page.locator("[data-thorax-surface] option[value='measured']").isDisabled(), false, "measured BSPM should be available");
  assert.equal(await page.locator("[data-thorax-surface] option[value='initial']").isDisabled(), false, "initial BSPM should be recomputable");
  assert.equal(await page.locator("[data-thorax-surface] option[value='adapted']").isDisabled(), false, "adapted BSPM should be recomputable");
  assert.equal(await page.locator("[data-thorax-surface] option[value='sensitivity']").isDisabled(), false, "sensitivity map should be available from transfer matrix");
  assert.equal(await page.locator("[data-thorax-lock-heart]").isEnabled(), true, "lock-to-heart should be available");

  const before = await canvasSignature(page, canvas);
  await page.locator("[data-thorax-heart-context]").check();
  assert.equal(await page.locator("[data-thorax-heart-context]").isChecked(), true, "Thorax heart context layer should toggle on");
  await page.waitForTimeout(150);
  const heartContextShown = await canvasSignature(page, canvas);
  assert.notEqual(heartContextShown, before, "Thorax heart context overlay should draw the parsed Heart mesh");
  await page.locator("[data-thorax-heart-context]").uncheck();
  assert.equal(await page.locator("[data-thorax-heart-context]").isChecked(), false, "Thorax heart context layer should toggle off");
  await page.waitForTimeout(150);

  await page.locator("[data-thorax-electrodes]").check();
  await page.waitForTimeout(150);
  const electrodesShown = await canvasSignature(page, canvas);
  assert.notEqual(electrodesShown, heartContextShown, "Thorax electrode toggle should draw selected lead-system markers");
  await page.locator("[data-thorax-electrode-target]").selectOption("1");
  await page.locator("[data-thorax-target-electrode]").click();
  await expectText(page, "[data-status-message]", "Thorax electrode E2 selected at node 26");
  await expectText(page, "[data-thorax-selection]", "Node 26 / 9 electrodes");

  await page.locator("[data-thorax-surface]").selectOption("measured");
  await expectText(page, "[data-thorax-surface-status]", "Measured BSPM / 100% / 0 ms");
  await expectText(page, "[data-thorax-mode-badge]", "Measured BSPM");
  await expectText(page, "[data-thorax-provenance-badge]", "Case BSPM");
  await expectText(page, "[data-status-message]", "Measured thorax BSPM map shown");
  await page.waitForTimeout(150);
  const mapped = await canvasSignature(page, canvas);
  assert.notEqual(mapped, electrodesShown, "Measured BSPM should recolor the thorax canvas");
  await page.locator("[data-thorax-contours]").check();
  await page.waitForTimeout(150);
  assert.equal(await page.locator("[data-thorax-contours]").isChecked(), true, "Thorax contours should toggle on");
  assert.ok(await canvasHasContent(page, canvas), "Thorax contour map should remain nonblank");
  const contourMap = await canvasSignature(page, canvas);
  assert.equal(await page.locator("[data-thorax-line-only]").isEnabled(), true, "Thorax line-only mode should enable for scalar maps");
  await page.locator("[data-thorax-line-only]").check();
  await expectText(page, "[data-thorax-surface-status]", "lines only");
  assert.equal(await page.locator("[data-thorax-contours]").isChecked(), true, "Thorax line-only mode should keep contours visible");
  await page.waitForTimeout(150);
  const lineOnlyMap = await canvasSignature(page, canvas);
  assert.notEqual(lineOnlyMap, contourMap, "Thorax line-only mode should change scalar map rendering");
  await page.locator("[data-thorax-line-only]").uncheck();
  await page.locator("[data-thorax-contours]").uncheck();

  await page.locator("[data-thorax-surface]").selectOption("initial");
  await expectText(page, "[data-thorax-surface-status]", "Initial BSPM / 100% / simulated 0 ms");
  await expectText(page, "[data-thorax-provenance-badge]", "Recomputed");
  await expectText(page, "[data-status-message]", "Initial thorax BSPM recomputed");
  await page.waitForTimeout(150);
  const initial = await canvasSignature(page, canvas);
  assert.notEqual(initial, mapped, "Initial BSPM should render transfer-computed colors");

  await page.locator("[data-thorax-surface]").selectOption("adapted");
  await expectText(page, "[data-thorax-surface-status]", "Adapted BSPM / 100% / simulated 0 ms");
  await expectText(page, "[data-status-message]", "Adapted thorax BSPM recomputed");
  await page.waitForTimeout(150);
  const adapted = await canvasSignature(page, canvas);
  assert.ok(await canvasHasContent(page, canvas), "Adapted BSPM should render transfer-computed colors");

  await page.locator("[data-thorax-surface]").selectOption("sensitivity");
  await expectText(page, "[data-thorax-surface-status]", "Sensitivity / 100% / source node 1");
  await expectText(page, "[data-thorax-provenance-badge]", "Transfer col");
  await expectText(page, "[data-status-message]", "Thorax sensitivity map");
  await page.waitForTimeout(150);
  const sensitivity = await canvasSignature(page, canvas);
  assert.notEqual(sensitivity, adapted, "Sensitivity map should render transfer-column colors");

  await setRangeValue(page, "[data-thorax-scale]", "120");
  await expectText(page, "[data-thorax-surface-status]", "Sensitivity / 120% / source node 1");
  await page.waitForTimeout(150);
  const scaled = await canvasSignature(page, canvas);
  assert.notEqual(scaled, sensitivity, "Thorax scale control should change canvas output");

  await page.locator("[data-thorax-lock-heart]").click();
  await expectText(page, "[data-status-message]", "Thorax orientation locked to Heart");
  await expectText(page, "[data-thorax-lock-heart]", "Locked");
  assert.equal(await page.locator("[data-thorax-rotate]").isChecked(), false, "Thorax lock should stop independent Thorax auto-rotation");
  const lockedSignature = await canvasSignature(page, canvas);
  await page.waitForTimeout(220);
  const followedHeartSignature = await canvasSignature(page, canvas);
  assert.notEqual(followedHeartSignature, lockedSignature, "Locked Thorax should follow Heart auto-rotation");

  await page.locator("[data-thorax-ap]").click();
  await expectText(page, "[data-status-message]", "Thorax view locked to Heart AP orientation");
  assert.equal(await page.locator("[data-thorax-rotate]").isChecked(), false, "Thorax AP reset should keep auto-rotation off while locked");

  await page.locator("[data-thorax-lock-heart]").click();
  await expectText(page, "[data-status-message]", "Thorax orientation unlocked from Heart");
  await page.locator("[data-thorax-rotate]").check();
  assert.equal(await page.locator("[data-thorax-rotate]").isChecked(), true, "Thorax rotate toggle should re-enable after unlock");

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
  await page.locator("[data-thorax-surface]").selectOption("measured");
  await setRangeValue(page, "[data-thorax-scale]", "100");
}

async function assertHeartViewControls(page) {
  const canvas = ".heart-viewport canvas";
  const geometrySignature = await canvasSignature(page, canvas);

  assert.equal(await page.locator("[data-heart-wall]").isDisabled(), true, "Endo/Epi control should be unavailable without wall mapping");
  assert.equal(await page.locator("[data-heart-transmural]").isDisabled(), true, "Transmural control should be unavailable without wall mapping");
  const wallTitle = await page.locator("[data-heart-wall]").getAttribute("title");
  const transmuralTitle = await page.locator("[data-heart-transmural]").getAttribute("title");
  assert.match(wallTitle ?? "", /source mesh is parsed/i, "Endo/Epi disabled state should explain available mesh evidence");
  assert.match(wallTitle ?? "", /pairings/i, "Endo/Epi disabled state should name the missing pairing evidence");
  assert.match(transmuralTitle ?? "", /source mesh is parsed/i, "Transmural disabled state should explain available mesh evidence");
  assert.match(transmuralTitle ?? "", /transmural grouping semantics are not decoded/i, "Transmural disabled state should name missing grouping evidence");

  assert.equal(await page.locator("[data-heart-cross-section-plane]").isDisabled(), true, "Cross-section plane slider should start disabled");
  await page.locator("[data-heart-cross-section]").check();
  await expectText(page, "[data-heart-cross-section-status]", "Cut 0 mm");
  assert.equal(await page.locator("[data-heart-cross-section-plane]").isEnabled(), true, "Cross-section plane slider should enable with cut mode");
  await page.waitForTimeout(150);
  const cutSignature = await canvasSignature(page, canvas);
  assert.notEqual(cutSignature, geometrySignature, "Heart cross-section cut should change the geometry canvas");
  await setRangeValue(page, "[data-heart-cross-section-plane]", "20");
  await expectText(page, "[data-heart-cross-section-status]", "Cut 20 mm");
  await page.waitForTimeout(150);
  const movedCutSignature = await canvasSignature(page, canvas);
  assert.notEqual(movedCutSignature, cutSignature, "Moving the Heart cross-section plane should redraw the cut");
  await page.locator("[data-heart-cross-section]").uncheck();
  await expectText(page, "[data-heart-cross-section-status]", "Full heart");

  assert.equal(await page.locator("[data-heart-source-mesh]").isDisabled(), false, "parsed source mesh overlay should be available");
  const sourceMeshTitle = await page.locator("[data-heart-source-mesh]").getAttribute("title");
  assert.match(sourceMeshTitle ?? "", /576 source nodes/i, "source mesh overlay title should report parsed source-node count");
  if (await page.locator("[data-heart-source-mesh]").isChecked()) {
    await page.locator("[data-heart-source-mesh]").uncheck();
  }
  await expectText(page, "[data-heart-overlay-status]", "Overlays off");
  await page.locator("[data-heart-source-mesh]").check();
  await expectText(page, "[data-heart-overlay-status]", "576 source mesh nodes");
  await page.waitForTimeout(150);
  const sourceMeshSignature = await canvasSignature(page, canvas);
  assert.notEqual(sourceMeshSignature, geometrySignature, "Heart source mesh overlay should draw parsed PGraphGeometry");
  await page.locator("[data-heart-source-mesh]").uncheck();
  await expectText(page, "[data-heart-overlay-status]", "Overlays off");

  await page.locator("[data-heart-surface]").selectOption("sourceWallDepth");
  await expectText(page, "[data-heart-surface-status]", "Source wall depth / computed / 576 nodes");
  await expectText(page, "[data-heart-provenance-badge]", "Computed source mesh");
  await page.waitForTimeout(150);
  const wallDepthSignature = await canvasSignature(page, canvas);
  assert.notEqual(wallDepthSignature, geometrySignature, "Computed source wall-depth mode should redraw the Heart surface");
  await page.locator("[data-heart-surface]").selectOption("geometry");

  await page.locator("[data-heart-electrodes]").check();
  await expectText(page, "[data-heart-overlay-status]", "9 electrodes");
  await page.waitForTimeout(150);
  const standardElectrodesSignature = await canvasSignature(page, canvas);
  assert.notEqual(standardElectrodesSignature, geometrySignature, "Heart electrode overlay should draw selected lead-system electrodes");
  await page.locator("[data-leads-system]").selectOption("VCG_(Frank)");
  await expectText(page, "[data-heart-overlay-status]", "7 electrodes");
  await page.waitForTimeout(150);
  const vcgElectrodesSignature = await canvasSignature(page, canvas);
  assert.notEqual(vcgElectrodesSignature, standardElectrodesSignature, "Heart electrode overlay should update with lead-system changes");
  await page.locator("[data-heart-electrodes]").uncheck();
  await page.locator("[data-leads-system]").selectOption("standard_12");

  await page.locator("[data-heart-vector]").check();
  await expectText(page, "[data-heart-overlay-status]", "TMP vector 0 ms");
  await page.waitForTimeout(150);
  const vectorSignature = await canvasSignature(page, canvas);
  assert.notEqual(vectorSignature, geometrySignature, "Heart vector overlay should draw a computed TMP vector path");
  await setRangeValue(page, "[data-time-cursor]", "80");
  await expectText(page, "[data-heart-overlay-status]", "TMP vector 80 ms");
  await page.waitForTimeout(150);
  const vectorAtTimeSignature = await canvasSignature(page, canvas);
  assert.notEqual(vectorAtTimeSignature, vectorSignature, "Heart vector arrow should follow the shared time cursor");
  await page.locator("[data-heart-vector]").uncheck();
  await setRangeValue(page, "[data-time-cursor]", "0");

  const scalarModes = [
    { value: "depolarizationMs", label: "Depolarization", adaptedStatus: "Depolarization / adapted", initialStatus: "Depolarization / initial", provenance: "adapted params" },
    { value: "repolarizationMs", label: "Repolarization", adaptedStatus: "Repolarization / adapted", initialStatus: "Repolarization / initial", provenance: "adapted params" },
    { value: "ariMs", label: "ARI", adaptedStatus: "ARI / adapted / ms", initialStatus: "ARI / initial / ms", provenance: "Derived ARI" },
    { value: "amplitude", label: "Amplitude", adaptedStatus: "Amplitude / adapted", initialStatus: "Amplitude / initial", provenance: "adapted params" },
    { value: "restingPotential", label: "Resting potential", adaptedStatus: "Resting potential / adapted", initialStatus: "Resting potential / initial", provenance: "adapted params" },
  ];

  for (const mode of scalarModes) {
    await page.locator("[data-heart-values]").selectOption("adapted");
    await page.locator("[data-heart-surface]").selectOption(mode.value);
    await expectText(page, "[data-heart-surface-status]", mode.adaptedStatus);
    await expectText(page, "[data-heart-mode-badge]", mode.label);
    await expectText(page, "[data-heart-provenance-badge]", mode.provenance);
    await page.waitForTimeout(150);
    const adaptedSignature = await canvasSignature(page, canvas);
    assert.notEqual(adaptedSignature, geometrySignature, `${mode.label} should recolor the Heart mesh`);

    await page.locator("[data-heart-values]").selectOption("initial");
    await expectText(page, "[data-heart-surface-status]", mode.initialStatus);
    await page.waitForTimeout(150);
    const initialSignature = await canvasSignature(page, canvas);
    assert.notEqual(initialSignature, adaptedSignature, `${mode.label} initial/adapted switch should redraw the Heart mesh`);
  }

  await page.locator("[data-heart-values]").selectOption("adapted");
  await page.locator("[data-thorax-electrode-target]").selectOption("2");
  await page.locator("[data-thorax-target-electrode]").click();
  await expectText(page, "[data-status-message]", "Thorax electrode E3 selected at node 65");
  await page.locator("[data-heart-surface]").selectOption("thoraxContribution");
  await expectText(page, "[data-heart-surface-status]", "Thorax contribution / thorax node 65");
  await expectText(page, "[data-heart-provenance-badge]", "Transfer row");
  await page.waitForTimeout(150);
  const contributionSignature = await canvasSignature(page, canvas);
  assert.notEqual(contributionSignature, geometrySignature, "Thorax contribution should recolor the heart surface");

  await page.locator("[data-heart-contours]").check();
  await page.waitForTimeout(150);
  assert.equal(await page.locator("[data-heart-contours]").isChecked(), true, "Heart contours should toggle on");
  assert.ok(await canvasHasContent(page, canvas), "Heart contour surface should remain nonblank");
  await page.locator("[data-heart-contours]").uncheck();

  await page.locator("[data-heart-surface]").selectOption("tmpAtTime");
  await expectText(page, "[data-heart-surface-status]", "TMP at time / adapted / 0 ms");
  await expectText(page, "[data-heart-provenance-badge]", "adapted TMP");
  const tmpAtZeroSignature = await canvasSignature(page, canvas);
  await setRangeValue(page, "[data-time-cursor]", "80");
  await expectText(page, "[data-heart-surface-status]", "TMP at time / adapted / 80 ms");
  const tmpAtTimeSignature = await canvasSignature(page, canvas);
  assert.notEqual(tmpAtTimeSignature, tmpAtZeroSignature, "TMP-at-time heart surface should follow shared time");
  await setRangeValue(page, "[data-time-cursor]", "0");

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
  await expectText(page, "[data-leads-status]", "Baseline P/T fiducials 5-499");
  await expectText(page, "[data-leads-status]", "measured/initial classification unavailable");
  await expectText(page, "[data-leads-mode-badge]", "BASELINE");
  await expectText(page, "[data-leads-provenance-badge]", "Case signals");
  assert.equal(await page.locator("[data-leads-measured]").isDisabled(), false, "measured overlay should be available from promoted legacy export");
  assert.equal(await page.locator("[data-leads-initial]").isDisabled(), false, "initial overlay should be recomputable");
  assert.equal(await page.locator("[data-leads-adapted]").isDisabled(), false, "adapted overlay should be recomputable");

  const baselineSignature = await canvasSignature(page, canvas);
  await page.locator("[data-leads-measured]").check();
  await expectText(page, "[data-leads-status]", "measured ECG from promoted legacy .refECG export");
  await expectText(page, "[data-leads-provenance-badge]", "Legacy export");
  await expectText(page, "[data-leads-metadata]", "500 samples");
  const measuredSignature = await canvasSignature(page, canvas);
  assert.notEqual(measuredSignature, baselineSignature, "Measured legacy ECG export should redraw traces");
  await page.locator("[data-leads-measured]").uncheck();

  await page.locator("[data-leads-initial]").check();
  await expectText(page, "[data-leads-status]", "initial ECG recomputed from TMP transfer");
  await expectText(page, "[data-leads-provenance-badge]", "Recomputed");
  const initialSignature = await canvasSignature(page, canvas);
  assert.notEqual(initialSignature, baselineSignature, "Initial lead ECG recompute should redraw traces");

  await page.locator("[data-leads-adapted]").check();
  await expectText(page, "[data-leads-status]", "initial+adapted ECG recomputed from TMP transfer");
  await expectText(page, "[data-leads-provenance-badge]", "Recomputed");
  const adaptedSignature = await canvasSignature(page, canvas);
  assert.notEqual(adaptedSignature, initialSignature, "Initial+adapted lead ECG overlay should redraw traces");
  await page.locator("[data-leads-initial]").uncheck();
  await expectText(page, "[data-leads-status]", "adapted ECG recomputed from TMP transfer");
  await page.locator("[data-leads-adapted]").uncheck();

  await page.locator("[data-leads-system]").selectOption("VCG_(Frank)");
  await expectText(page, "[data-leads-metadata]", "VCG_(Frank): 7 parsed lead traces / 10 leads");
  const vcgSignature = await canvasSignature(page, canvas);
  assert.notEqual(vcgSignature, baselineSignature, "Lead-system metadata switch should redraw leads");

  await expectText(page, "[data-thorax-selection]", "7 electrodes");

  await page.locator("[data-leads-vcg-loop]").check();
  await expectText(page, "[data-leads-metadata]", "VCG loop preview");
  await expectText(page, "[data-leads-status]", "exact Frank transform unresolved");
  await expectText(page, "[data-leads-mode-badge]", "BASELINE+VCG");
  const vcgLoopSignature = await canvasSignature(page, canvas);
  assert.notEqual(vcgLoopSignature, vcgSignature, "VCG loop mode should redraw Frank traces as projection loops");
  await page.locator("[data-leads-vcg-loop]").uncheck();

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

  const leadsBeforeInterval = await canvasSignature(page, canvas);
  const tmpBeforeInterval = await canvasSignature(page, "[data-tmp-canvas]");
  await setInputValue(page, "[data-leads-interval-start]", "90");
  await setInputValue(page, "[data-leads-interval-end]", "180");
  await page.locator("[data-leads-interval]").check();
  await page.waitForTimeout(150);
  assert.notEqual(await canvasSignature(page, canvas), leadsBeforeInterval, "Leads interval highlight should redraw the Leads canvas");
  assert.notEqual(await canvasSignature(page, "[data-tmp-canvas]"), tmpBeforeInterval, "Leads interval highlight should redraw the TMP canvas");
  const leadsBeforeZoom = await canvasSignature(page, canvas);
  const tmpBeforeZoom = await canvasSignature(page, "[data-tmp-canvas]");
  await page.locator("[data-leads-zoom-beat]").click();
  await expectText(page, "[data-leads-zoom-status]", "Zoom 90-180 (interval)");
  await expectText(page, "[data-leads-metadata]", "zoom 90-180");
  await expectText(page, "[data-tmp-metadata]", "zoom 90-180");
  assert.equal(await page.locator("[data-leads-zoom-all]").isEnabled(), true, "All-beats reset should be available after zoom");
  assert.notEqual(await canvasSignature(page, canvas), leadsBeforeZoom, "Beat zoom should redraw the Leads canvas");
  assert.notEqual(await canvasSignature(page, "[data-tmp-canvas]"), tmpBeforeZoom, "Beat zoom should redraw the TMP canvas");
  await page.locator("[data-leads-zoom-all]").click();
  await expectText(page, "[data-leads-zoom-status]", "All beats");
  await page.locator("[data-leads-interval]").uncheck();

  await page.locator("[data-leads-zoom-beat]").click();
  await expectText(page, "[data-leads-zoom-status]", "Zoom 5-499 (fiducials)");
  await expectText(page, "[data-leads-metadata]", "zoom 5-499");
  await page.locator("[data-leads-zoom-all]").click();
  await expectText(page, "[data-leads-zoom-status]", "All beats");

  await page.locator("[data-leads-filter]").selectOption("ac");
  await expectText(page, "[data-leads-metadata]", "/ AC");
  await expectText(page, "[data-leads-mode-badge]", "AC");
  await expectText(page, "[data-leads-status]", "AC coupling, time mean removed");
  const acSignature = await canvasSignature(page, canvas);
  assert.notEqual(acSignature, noGridSignature, "AC coupling should redraw leads");

  await page.locator("[data-leads-filter]").selectOption("dc");
  await expectText(page, "[data-leads-metadata]", "/ DC");
  await expectText(page, "[data-leads-mode-badge]", "DC");
  await expectText(page, "[data-leads-status]", "DC coupling, unfiltered");
  assert.equal(await page.locator("[data-leads-filter]").inputValue(), "dc", "DC coupling should be selected");

  await page.locator("[data-leads-filter]").selectOption("baseline");
  await expectText(page, "[data-leads-metadata]", "/ BASELINE");
  await expectText(page, "[data-leads-status]", "Baseline P/T fiducials 5-499");
  await page.locator("[data-leads-system]").selectOption("standard_12");
  await setRangeValue(page, "[data-leads-scale]", "100");
  await page.locator("[data-leads-rms]").uncheck();
  await page.locator("[data-leads-adapted]").uncheck();

  const importPath = resolve(tmpdir(), "comparison.ecgsim-ecg.json");
  writeFileSync(importPath, JSON.stringify({
    schema: "org.ecgsim.ecg-signals",
    version: 1,
    name: "Imported comparison ECG",
    sampleRateHz: 500,
    units: "mV",
    leadLabels: ["I", "II", "V1"],
    valuesByLead: [
      [0, 0.2, 0.5, 0.1, -0.1, 0],
      [0.1, 0.3, 0.6, 0.2, 0, -0.1],
      [-0.1, 0, 0.2, 0.1, -0.2, -0.1],
    ],
  }));
  const caseSignature = await canvasSignature(page, canvas);
  await page.locator("[data-leads-import]").setInputFiles(importPath);
  await expectText(page, "[data-status-message]", "comparison.ecgsim-ecg.json imported as external ECG signals");
  await expectText(page, "[data-leads-metadata]", "Imported comparison ECG: 3 imported traces");
  await expectText(page, "[data-leads-metadata]", "6 samples / 500 Hz");
  await expectText(page, "[data-leads-status]", "external imported signal; separate from case and recomputed outputs");
  await expectText(page, "[data-leads-provenance-badge]", "Imported");
  assert.equal(await page.locator("[data-leads-source]").inputValue(), "imported", "ECG import should switch Leads source");
  assert.equal(await page.locator("[data-leads-system]").isDisabled(), true, "Imported signals should not use case lead-system selection");
  const importedSignature = await canvasSignature(page, canvas);
  assert.notEqual(importedSignature, caseSignature, "Imported ECG should redraw the Leads canvas");

  await page.locator("[data-leads-source]").selectOption("case");
  await expectText(page, "[data-leads-metadata]", "standard_12: 12 parsed lead traces");
  assert.equal(await page.locator("[data-leads-system]").isEnabled(), true, "Case signals should re-enable lead-system selection");
}

async function assertLinkedTimeCursor(page) {
  const leadsCanvas = "[data-leads-canvas]";
  const tmpCanvas = "[data-tmp-canvas]";
  const heartCanvas = ".heart-viewport canvas";
  const thoraxCanvas = ".thorax-viewport canvas";
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
  await page.locator("[data-heart-surface]").selectOption("tmpAtTime");
  await page.locator("[data-thorax-surface]").selectOption("measured");
  const leadsCursorBefore = await yellowCursorX(page, leadsCanvas);
  const tmpCursorBefore = await yellowCursorX(page, tmpCanvas);
  const heartBefore = await canvasSignature(page, heartCanvas);
  const thoraxBefore = await canvasSignature(page, thoraxCanvas);

  await page.locator("[data-time-step-forward]").click();
  await expectText(page, "[data-time-status]", "2 ms / 575 ms");
  await expectText(page, "[data-heart-surface-status]", "TMP at time / adapted / 2 ms");

  await setRangeValue(page, "[data-time-cursor]", "120");
  await expectText(page, "[data-time-status]", "120 ms / 575 ms");
  await expectText(page, "[data-heart-surface-status]", "TMP at time / adapted / 120 ms");
  assert.ok(await yellowCursorX(page, leadsCanvas) > leadsCursorBefore + 20, "Time range should move Leads cursor line");
  assert.ok(await yellowCursorX(page, tmpCanvas) > tmpCursorBefore + 20, "Time range should move TMP cursor line");
  assert.notEqual(await canvasSignature(page, heartCanvas), heartBefore, "Time range should update Heart TMP-at-time colors");
  assert.notEqual(await canvasSignature(page, thoraxCanvas), thoraxBefore, "Time range should update measured Thorax BSPM colors");

  await page.locator(tmpCanvas).focus();
  await page.keyboard.press("ArrowRight");
  await expectText(page, "[data-time-status]", "122 ms / 575 ms");

  const heartBeforePlayback = await canvasSignature(page, heartCanvas);
  const thoraxBeforePlayback = await canvasSignature(page, thoraxCanvas);
  await page.locator("[data-time-play]").click();
  await expectText(page, "[data-time-play]", "Pause");
  await page.waitForFunction(() => document.querySelector("[data-time-cursor]")?.value !== "122");
  await page.waitForTimeout(150);
  assert.notEqual(await canvasSignature(page, heartCanvas), heartBeforePlayback, "Playback should update Heart TMP-at-time colors");
  assert.notEqual(await canvasSignature(page, thoraxCanvas), thoraxBeforePlayback, "Playback should update Thorax BSPM colors");
  await page.locator("[data-time-play]").click();
  await expectText(page, "[data-time-play]", "Play");

  await setRangeValue(page, "[data-time-cursor]", "0");
  await expectText(page, "[data-time-status]", "0 ms / 575 ms");
}

async function assertHeartSelectionAndTmpEditing(page) {
  await page.locator("[data-heart-ap]").click();
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

  const selectedCanvas = await canvasSignature(page, ".heart-viewport canvas");
  await page.locator("[data-heart-node-overlay]").check();
  await page.waitForTimeout(150);
  const nodesShown = await canvasSignature(page, ".heart-viewport canvas");
  assert.notEqual(nodesShown, selectedCanvas, "Heart node overlay should visibly add parsed node dots");
  await page.locator("[data-heart-selection-rings]").check();
  await page.waitForTimeout(150);
  const ringsShown = await canvasSignature(page, ".heart-viewport canvas");
  assert.notEqual(ringsShown, nodesShown, "Heart selection rings should visibly show radius and transition overlays");
  await page.locator("[data-heart-node-overlay]").uncheck();
  await page.locator("[data-heart-selection-rings]").uncheck();

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
  assert.equal(await page.locator("[data-tmp-show-egm]").isEnabled(), true, "electrogram toggle should be available as computed preview");
  const tmpBeforeEgm = await canvasSignature(page, "[data-tmp-canvas]");
  await page.locator("[data-tmp-show-egm]").check();
  await expectText(page, "[data-tmp-metadata]", "initial+adapted+egm");
  await page.waitForTimeout(150);
  const tmpWithEgm = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(tmpWithEgm, tmpBeforeEgm, "EGM preview should redraw TMP traces");
  await page.locator("[data-tmp-show-egm]").uncheck();
  await expectText(page, "[data-tmp-parameter-status]", "Initial");

  const tmpControlsBefore = await canvasSignature(page, "[data-tmp-canvas]");
  await page.locator("[data-tmp-handlers]").check();
  await page.waitForTimeout(150);
  const tmpHandlersShown = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(tmpHandlersShown, tmpControlsBefore, "TMP handler overlay should draw selected-node parameter handles");
  await page.locator("[data-tmp-handlers]").uncheck();

  await page.locator("[data-tmp-show-initial]").uncheck();
  await expectText(page, "[data-tmp-metadata]", "/ adapted");
  await expectText(page, "[data-tmp-mode-badge]", "adapted");
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
  await setRangeValue(page, "[data-time-cursor]", "120");
  await page.locator("[data-thorax-surface]").selectOption("adapted");
  await page.locator("[data-leads-adapted]").check();
  await page.waitForTimeout(150);
  const adaptedThoraxBefore = await canvasSignature(page, ".thorax-viewport canvas");
  const adaptedLeadsBefore = await canvasSignature(page, "[data-leads-canvas]");
  const editedValue = originalValue + 7;

  await valueInput.fill(String(editedValue));
  await applyButton.click();
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Apply should keep the edited TMP value");
  const tmpEdited = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(tmpEdited, tmpBefore, "TMP canvas should redraw after parameter edit");
  await page.waitForTimeout(150);
  assert.notEqual(
    await canvasSignature(page, ".thorax-viewport canvas"),
    adaptedThoraxBefore,
    "Adapted Thorax BSPM should recompute after TMP edit",
  );
  assert.notEqual(
    await canvasSignature(page, "[data-leads-canvas]"),
    adaptedLeadsBefore,
    "Adapted lead ECG should recompute after TMP edit",
  );

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

async function assertMovieExport(page) {
  const downloadPromise = page.waitForEvent("download");
  await page.locator("[data-export-movie='leads']").click();
  const download = await downloadPromise;
  assert.match(download.suggestedFilename(), /-leads\.webm$/, "Movie export should name a WebM file");
  const moviePath = await download.path();
  const movie = readFileSync(moviePath);
  assert.equal(movie.subarray(0, 4).toString("hex"), "1a45dfa3", "WebM should have EBML signature");
  assert.ok(movie.length > 1000, "WebM should contain movie data");
  await expectText(page, "[data-status-message]", "Leads WebM movie exported");
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

async function setInputValue(page, selector, value) {
  await page.locator(selector).evaluate((element, nextValue) => {
    element.value = nextValue;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
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
    const xStep = Math.max(1, Math.floor(width / 64));
    const yStep = Math.max(1, Math.floor(height / 64));
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
