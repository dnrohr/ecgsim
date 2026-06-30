import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));
const args = new Map(process.argv.slice(2).map((arg, index, all) => (
  arg.startsWith("--") ? [arg, all[index + 1]] : [null, null]
)).filter(([key]) => key));
const outputPath = resolve(viewerRoot, args.get("--output") ?? "dist/release-validation/latest/viewer.png");
const port = Number(process.env.ECGSIM_CAPTURE_PORT || 4193);
const chromePath = findBrowserExecutable();

if (!chromePath) {
  throw new Error("Unable to find Chromium. Set CHROME_PATH to Chrome or Edge before running capture.");
}

await mkdir(dirname(outputPath), { recursive: true });

const server = spawn(process.execPath, ["scripts/dev-server.mjs"], {
  cwd: viewerRoot,
  env: {
    ...process.env,
    ECGSIM_VIEWER_ROOT: "dist/viewer-static",
    PORT: String(port),
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer(`http://127.0.0.1:${port}`);
  browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-viewer-shell][data-ready='true']");
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Captured packaged viewer screenshot at ${outputPath}`);
} finally {
  if (browser) {
    await browser.close();
  }
  server.kill();
}

async function waitForServer(url) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // retry until deadline
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function findBrowserExecutable() {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  return candidates.find((candidate) => existsSync(candidate));
}
