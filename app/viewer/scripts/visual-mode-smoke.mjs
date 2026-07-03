import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.ECGSIM_VISUAL_SMOKE_PORT || 4185);
const baseUrl = `http://127.0.0.1:${port}`;
const chromePath = findBrowserExecutable();

if (!chromePath) {
  throw new Error("Unable to find a Chromium browser. Set CHROME_PATH to Chrome or Edge before running visual mode smoke tests.");
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

  await assertHeartModes(page);
  await assertThoraxModes(page);
  assertNoUnexpectedConsoleErrors(consoleMessages);

  console.log("viewer visual mode smoke check passed");
} finally {
  if (browser) {
    await browser.close();
  }
  server.kill();
}

async function assertHeartModes(page) {
  const canvas = ".heart-viewport canvas";
  const modes = [
    { value: "geometry", status: "Geometry", badge: "Geometry" },
    { value: "depolarizationMs", status: "Depolarization / adapted", badge: "Depolarization" },
    { value: "repolarizationMs", status: "Repolarization / adapted", badge: "Repolarization" },
    { value: "ariMs", status: "ARI / adapted / ms", badge: "ARI" },
    { value: "amplitude", status: "Amplitude / adapted", badge: "Amplitude" },
    { value: "restingPotential", status: "Resting potential / adapted", badge: "Resting potential" },
    { value: "tmpAtTime", status: "TMP at time / adapted / 0 ms", badge: "TMP at time" },
  ];

  await page.locator("[data-heart-values]").selectOption("adapted");
  for (const mode of modes) {
    await page.locator("[data-heart-surface]").selectOption(mode.value);
    await expectText(page, "[data-heart-surface-status]", mode.status);
    await expectText(page, "[data-heart-mode-badge]", mode.badge);
    await page.waitForTimeout(120);
    assert.ok(await canvasHasContent(page, canvas), `Heart ${mode.badge} mode should render a nonblank canvas`);
  }

  await page.locator("[data-thorax-electrode-target]").selectOption("2");
  await page.locator("[data-thorax-target-electrode]").click();
  await page.locator("[data-heart-surface]").selectOption("thoraxContribution");
  await expectText(page, "[data-heart-surface-status]", "Thorax contribution / thorax node 65");
  await expectText(page, "[data-heart-provenance-badge]", "Transfer row");
  await page.waitForTimeout(120);
  assert.ok(await canvasHasContent(page, canvas), "Heart thorax contribution mode should render a nonblank canvas");
}

async function assertThoraxModes(page) {
  const canvas = ".thorax-viewport canvas";
  const modes = [
    { value: "geometry", status: "Geometry / 100%", badge: "Geometry" },
    { value: "measured", status: "Measured BSPM / 100% / 0 ms", badge: "Measured BSPM" },
    { value: "initial", status: "Initial BSPM / 100% / simulated 0 ms", badge: "Initial BSPM" },
    { value: "adapted", status: "Adapted BSPM / 100% / simulated 0 ms", badge: "Adapted BSPM" },
    { value: "sensitivity", status: "Sensitivity / 100% / source node 1", badge: "Sensitivity" },
  ];

  for (const mode of modes) {
    await page.locator("[data-thorax-surface]").selectOption(mode.value);
    await expectText(page, "[data-thorax-surface-status]", mode.status);
    await expectText(page, "[data-thorax-mode-badge]", mode.badge);
    await page.waitForTimeout(120);
    assert.ok(await canvasHasContent(page, canvas), `Thorax ${mode.badge} mode should render a nonblank canvas`);
  }
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
    let signature = 0;
    for (let index = 0; index < data.length; index += 97) {
      signature = (signature + data[index] * 3 + index) % 1000000007;
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
