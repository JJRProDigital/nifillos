import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tryHandleMetricsApi } from "../src/server/metricsApiHandler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dashboardDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(dashboardDir, "..");
const cuadrillasDir = path.join(repoRoot, "cuadrillas");
const port = Number(process.env.NIFILLOS_METRICS_PORT || 8787) || 8787;

const server = http.createServer((req, res) => {
  void tryHandleMetricsApi(req, res, { cuadrillasDir, repoRoot }).then((handled) => {
    if (handled) return;
    res.statusCode = 404;
    res.end("Not found");
  });
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Nifillos metrics API at http://127.0.0.1:${port}/__cuadrillas_api/`);
});
