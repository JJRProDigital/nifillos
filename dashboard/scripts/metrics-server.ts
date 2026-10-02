import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tryHandleMetricsApi } from "../src/server/metricsApiHandler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardDir = path.resolve(__dirname, "..");
const distDir = path.join(dashboardDir, "dist");
const repoRoot = path.resolve(dashboardDir, "..");
const cuadrillasDir = path.join(repoRoot, "cuadrillas");
const port = Number(process.env.NIFILLOS_METRICS_PORT || 8787) || 8787;

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

async function serveStatic(urlPath: string, res: http.ServerResponse): Promise<boolean> {
  if (urlExitsDist(urlPath)) return false;

  const relative = urlPath.replace(/^\/+/, "") || "index.html";
  const filePath = path.normalize(path.join(distDir, relative));
  if (!filePath.startsWith(distDir + path.sep) && filePath !== distDir) return false;

  try {
    const st = await stat(filePath);
    const target = st.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const body = await readFile(target);
    const ext = path.extname(target).toLowerCase();
    res.statusCode = 200;
    res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
    res.end(body);
    return true;
  } catch {
    // SPA fallback: serve index.html for unknown client-side routes
    try {
      const body = await readFile(path.join(distDir, "index.html"));
      res.statusCode = 200;
      res.setHeader("Content-Type", MIME_TYPES[".html"]);
      res.end(body);
      return true;
    } catch {
      return false;
    }
  }
}

function urlExitsDist(urlPath: string): boolean {
  return urlPath.includes("..") || urlPath.includes("\0");
}

const server = http.createServer((req, res) => {
  let urlPath = "/";
  try {
    urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
  } catch {
    res.statusCode = 400;
    res.end("Bad request");
    return;
  }
  void tryHandleMetricsApi(req, res, { cuadrillasDir, repoRoot }).then(async (handled) => {
    if (handled) return;
    if (await serveStatic(urlPath, res)) return;
    res.statusCode = 404;
    res.end("Not found");
  });
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Nifillos metrics API at http://127.0.0.1:${port}/__cuadrillas_api/`);
  // eslint-disable-next-line no-console
  console.log(`Nifillos dashboard (built UI) at http://127.0.0.1:${port}/`);
});
