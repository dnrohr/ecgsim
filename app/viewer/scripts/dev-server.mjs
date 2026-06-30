import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const viewerRoot = fileURLToPath(new URL("..", import.meta.url));
const root = process.env.ECGSIM_VIEWER_ROOT
  ? resolve(viewerRoot, process.env.ECGSIM_VIEWER_ROOT)
  : viewerRoot;
const port = Number(process.env.PORT || 4173);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

const server = createServer(async (request, response) => {
  const requestedPath = request.url === "/" ? "/index.html" : request.url || "/index.html";
  const safePath = normalize(decodeURIComponent(requestedPath)).replace(/^(\.\.[/\\])+/, "");
  try {
    const file = await readFile(join(root, safePath));
    response.writeHead(200, { "Content-Type": types[extname(safePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`ECGSIM viewer listening on http://localhost:${port}`);
});
