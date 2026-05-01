import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import type { CuadrillaState, WsMessage } from "../types/state";
import { tryHandleMetricsApi } from "../server/metricsApiHandler";
import { buildSnapshotPayload, resolveCuadrillaCode } from "../server/cuadrillaSnapshot";

function resolveCuadrillasDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "../cuadrillas"),
    path.resolve(process.cwd(), "cuadrillas"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), "../cuadrillas");
}

function buildSnapshot(cuadrillasDir: string): WsMessage {
  const payload = buildSnapshotPayload(cuadrillasDir);
  return {
    type: "SNAPSHOT",
    cuadrillas: payload.cuadrillas,
    activeStates: payload.activeStates,
  };
}

function broadcast(wss: WebSocketServer, msg: WsMessage) {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

export function cuadrillaWatcherPlugin(): Plugin {
  return {
    name: "cuadrilla-watcher",
    configureServer(server: ViteDevServer) {
      const cuadrillasDir = resolveCuadrillasDir();
      server.config.logger.info(`[cuadrilla-watcher] cuadrillas dir: ${cuadrillasDir}`);

      const repoRoot = path.resolve(cuadrillasDir, "..");
      if (!process.env.NIFILLOS_METRICS_API) {
        server.middlewares.use((req, res, next) => {
          void tryHandleMetricsApi(req, res, {
            cuadrillasDir,
            repoRoot,
          }).then((handled) => {
            if (handled) return;
            next();
          });
        });
      } else {
        server.config.logger.info(
          "[cuadrilla-watcher] NIFILLOS_METRICS_API is set — /__cuadrillas_api is proxied; local metrics middleware skipped",
        );
      }

      const wss = new WebSocketServer({ noServer: true });
      (server.httpServer as Server).on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
        if (req.url === "/__cuadrillas_ws") {
          wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit("connection", ws, req);
          });
        }
      });

      wss.on("connection", (ws) => {
        ws.send(JSON.stringify(buildSnapshot(cuadrillasDir)));
      });

      if (!fs.existsSync(cuadrillasDir)) {
        fs.mkdirSync(cuadrillasDir, { recursive: true });
      }

      const stateGlob = path.join(cuadrillasDir, "*/state.json").replace(/\\/g, "/");
      server.watcher.add(stateGlob);

      const changeTimers = new Map<string, ReturnType<typeof setTimeout>>();

      const yamlGlob = path.join(cuadrillasDir, "*/cuadrilla.yaml").replace(/\\/g, "/");
      server.watcher.add(yamlGlob);

      const outputStateGlob = path
        .join(cuadrillasDir, "*", "output", "*", "state.json")
        .replace(/\\/g, "/");
      server.watcher.add(outputStateGlob);

      function isOutputStateJson(filePath: string): boolean {
        const n = filePath.replace(/\\/g, "/");
        return /\/output\/[^/]+\/state\.json$/.test(n);
      }

      const snapshotTimers = new Map<string, ReturnType<typeof setTimeout>>();
      const debouncedSnapshot = () => {
        const key = "snapshot";
        clearTimeout(snapshotTimers.get(key));
        snapshotTimers.set(
          key,
          setTimeout(() => {
            broadcast(wss, buildSnapshot(cuadrillasDir));
          }, 120),
        );
      };

      server.watcher.on("add", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          if (isOutputStateJson(filePath)) {
            debouncedSnapshot();
            return;
          }
          const code = broadcastCodeFromRootStatePath(filePath, cuadrillasDir);
          if (!code) return;
          clearTimeout(changeTimers.get(code));
          changeTimers.set(code, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: CuadrillaState = JSON.parse(raw);
              broadcast(wss, { type: "CUADRILLA_ACTIVE", cuadrilla: code, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("cuadrilla.yaml")) {
          broadcast(wss, buildSnapshot(cuadrillasDir));
        }
      });

      server.watcher.on("change", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          if (isOutputStateJson(filePath)) {
            debouncedSnapshot();
            return;
          }
          const code = broadcastCodeFromRootStatePath(filePath, cuadrillasDir);
          if (!code) return;
          clearTimeout(changeTimers.get(code));
          changeTimers.set(code, setTimeout(() => {
            try {
              const raw = fs.readFileSync(filePath, "utf-8");
              const state: CuadrillaState = JSON.parse(raw);
              broadcast(wss, { type: "CUADRILLA_UPDATE", cuadrilla: code, state });
            } catch { /* skip */ }
          }, 50));
        } else if (filePath.endsWith("cuadrilla.yaml")) {
          broadcast(wss, buildSnapshot(cuadrillasDir));
        }
      });

      server.watcher.on("unlink", (filePath: string) => {
        if (filePath.endsWith("state.json")) {
          if (isOutputStateJson(filePath)) {
            debouncedSnapshot();
            return;
          }
          const code = broadcastCodeFromRootStatePath(filePath, cuadrillasDir);
          if (!code) return;
          clearTimeout(changeTimers.get(code));
          changeTimers.delete(code);
          debouncedSnapshot();
        } else if (filePath.endsWith("cuadrilla.yaml")) {
          broadcast(wss, buildSnapshot(cuadrillasDir));
        }
      });
    },
  };
}

/** Folder name under cuadrillas/ for a root-level state.json path. */
function extractCuadrillaFolderFromStatePath(filePath: string, cuadrillasDir: string): string | null {
  const normalized = filePath.replace(/\\/g, "/");
  const normalizedBase = cuadrillasDir.replace(/\\/g, "/");
  const relative = normalized.replace(normalizedBase + "/", "");
  const parts = relative.split("/");
  return parts.length >= 2 ? parts[0] : null;
}

/** YAML `code` for WebSocket messages — must match keys in readActiveStates / cuadrillas Map. */
function broadcastCodeFromRootStatePath(filePath: string, cuadrillasDir: string): string | null {
  const folder = extractCuadrillaFolderFromStatePath(filePath, cuadrillasDir);
  if (!folder) return null;
  return resolveCuadrillaCode(cuadrillasDir, folder);
}
