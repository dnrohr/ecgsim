import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
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

  await assertInitialState(page);
  await assertShellLayout(page);
  await assertImportNotices(page);
  await assertHeartViewControls(page);
  await assertThoraxControls(page);
  await assertLeadsFiltering(page);
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
  await expectText(page, "[data-leads-metadata]", "standard_12: 12/12 leads / plotted 6 / 1000 samples / 1000 Hz / BASELINE / 100%");

  assert.ok(await canvasHasContent(page, "[data-leads-canvas]"), "leads canvas should be nonblank");
  assert.ok(await canvasHasContent(page, "[data-tmp-canvas]"), "TMP canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".heart-viewport canvas"), "heart WebGL canvas should be nonblank");
  assert.ok(await canvasHasContent(page, ".thorax-viewport canvas"), "thorax WebGL canvas should be nonblank");
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
  await expectText(page, "[data-thorax-surface-status]", "Geometry / 100% / maps unavailable");
  await expectText(page, "[data-thorax-selection]", "electrodes parsed; positions unavailable");
  assert.equal(await page.locator("[data-thorax-electrodes]").isDisabled(), true, "electrode toggle should show unavailable state");
  assert.equal(await page.locator("[data-thorax-lock-heart]").isDisabled(), true, "lock-to-heart should show unavailable state");

  const before = await canvasSignature(page, canvas);
  await setRangeValue(page, "[data-thorax-scale]", "120");
  await expectText(page, "[data-thorax-surface-status]", "Geometry / 120% / maps unavailable");
  await page.waitForTimeout(150);
  const scaled = await canvasSignature(page, canvas);
  assert.notEqual(scaled, before, "Thorax scale control should change canvas output");

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
  assert.match(selected, /Node \d+ \/ \d+ electrodes parsed; positions unavailable \/ maps unavailable/, "thorax click should select a node");
  await expectText(page, "[data-status-message]", "Thorax node");
}

async function assertHeartViewControls(page) {
  const canvas = ".heart-viewport canvas";
  const geometrySignature = await canvasSignature(page, canvas);

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
  await expectText(page, "[data-leads-status]", "measured/initial/adapted classification unavailable");
  assert.equal(await page.locator("[data-leads-measured]").isDisabled(), true, "measured overlay should be unavailable");
  assert.equal(await page.locator("[data-leads-initial]").isDisabled(), true, "initial overlay should be unavailable");
  assert.equal(await page.locator("[data-leads-adapted]").isDisabled(), true, "adapted overlay should be unavailable");

  const baselineSignature = await canvasSignature(page, canvas);

  await page.locator("[data-leads-system]").selectOption("VCG_(Frank)");
  await expectText(page, "[data-leads-metadata]", "VCG_(Frank): 6/10 leads");
  const vcgSignature = await canvasSignature(page, canvas);
  assert.notEqual(vcgSignature, baselineSignature, "Lead-system metadata switch should redraw leads");

  await setRangeValue(page, "[data-leads-scale]", "150");
  await expectText(page, "[data-leads-metadata]", "/ 150%");
  const scaledSignature = await canvasSignature(page, canvas);
  assert.notEqual(scaledSignature, vcgSignature, "Lead scale should redraw leads");

  await page.locator("[data-leads-rms]").check();
  await expectText(page, "[data-leads-metadata]", "plotted 7");
  const rmsSignature = await canvasSignature(page, canvas);
  assert.notEqual(rmsSignature, scaledSignature, "RMS overlay should add a plotted trace");

  await page.locator("[data-leads-grid]").uncheck();
  const noGridSignature = await canvasSignature(page, canvas);
  assert.notEqual(noGridSignature, rmsSignature, "Grid toggle should redraw leads");
  await page.locator("[data-leads-grid]").check();

  await page.locator("[data-leads-filter]").selectOption("ac");
  await expectText(page, "[data-leads-metadata]", "/ AC");
  const acSignature = await canvasSignature(page, canvas);
  assert.notEqual(acSignature, noGridSignature, "AC coupling should redraw leads");

  await page.locator("[data-leads-filter]").selectOption("dc");
  await expectText(page, "[data-leads-metadata]", "/ DC");
  assert.equal(await page.locator("[data-leads-filter]").inputValue(), "dc", "DC coupling should be selected");

  await page.locator("[data-leads-filter]").selectOption("baseline");
  await expectText(page, "[data-leads-metadata]", "/ BASELINE");
  await page.locator("[data-leads-system]").selectOption("standard_12");
  await setRangeValue(page, "[data-leads-scale]", "100");
  await page.locator("[data-leads-rms]").uncheck();
}

async function assertHeartSelectionAndTmpEditing(page) {
  const selected = await selectHeartNode(page);
  assert.match(selected, /Node \d+ \/ 20 mm \/ \d+ nodes/, "heart click should select a node");

  await setRangeValue(page, "[data-heart-radius]", "30");
  await expectText(page, "[data-heart-selection]", "30 mm");

  const valueInput = page.locator("[data-tmp-value]");
  const incrementButton = page.locator("[data-tmp-increment]");
  const applyButton = page.locator("[data-tmp-apply]");
  const resetParameter = page.locator("[data-tmp-reset-parameter]");
  const resetBeat = page.locator("[data-tmp-reset-beat]");

  assert.equal(await valueInput.isEnabled(), true, "TMP value should enable after heart selection");
  assert.equal(await incrementButton.isEnabled(), true, "TMP increment should enable after heart selection");
  assert.equal(await applyButton.isEnabled(), true, "TMP apply should enable after heart selection");
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
  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore nudged value");

  const tmpBefore = await canvasSignature(page, "[data-tmp-canvas]");
  const editedValue = originalValue + 7;

  await valueInput.fill(String(editedValue));
  await applyButton.click();
  assert.equal(Number(await valueInput.inputValue()), editedValue, "Apply should keep the edited TMP value");
  const tmpEdited = await canvasSignature(page, "[data-tmp-canvas]");
  assert.notEqual(tmpEdited, tmpBefore, "TMP canvas should redraw after parameter edit");

  await resetParameter.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset parameter should restore initial value");

  await valueInput.fill(String(editedValue));
  await applyButton.click();
  await resetBeat.click();
  assert.equal(Number(await valueInput.inputValue()), originalValue, "Reset beat should restore initial value");
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
