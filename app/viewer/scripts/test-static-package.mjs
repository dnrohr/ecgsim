import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));

await run(process.execPath, ["scripts/build-static.mjs"]);
await run(process.execPath, ["scripts/app-test.mjs"], {
  ECGSIM_VIEWER_ROOT: "dist/viewer-static",
});

function run(command, args, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: viewerRoot,
      env: { ...process.env, ...extraEnv },
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
    child.on("error", reject);
  });
}
