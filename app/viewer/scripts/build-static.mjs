import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));
const targetRoot = resolve(viewerRoot, "dist/viewer-static");

await rm(targetRoot, { recursive: true, force: true });
await mkdir(targetRoot, { recursive: true });

await cp(join(viewerRoot, "index.html"), join(targetRoot, "index.html"));
await cp(join(viewerRoot, "src"), join(targetRoot, "src"), { recursive: true });
await cp(join(viewerRoot, "public"), join(targetRoot, "public"), { recursive: true });

const threeSource = join(viewerRoot, "node_modules/three/build");
const threeTarget = join(targetRoot, "node_modules/three/build");
await mkdir(dirname(threeTarget), { recursive: true });
await cp(threeSource, threeTarget, { recursive: true });

const manifest = {
  schema: "org.ecgsim.static-viewer-package",
  version: 1,
  entrypoint: "index.html",
  includes: [
    "index.html",
    "src/",
    "public/",
    "node_modules/three/build/",
  ],
  limitations: [
    "Static preview package with bundled fixtures.",
    "No native desktop shell, installer, signing, or notarization.",
    "Browser file-open support remains limited to cases in the supported-case manifest.",
  ],
};

await writeFile(join(targetRoot, "package-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`Built ECGSIM static viewer package at ${targetRoot}`);
