import type { Plugin, ViteDevServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { CuadrillaInfo, CuadrillaState, WsMessage } from "../types/state";
import { tryHandleMetricsApi } from "../server/metricsApiHandler";

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

function discoverCuadrillas(cuadrillasDir: string): CuadrillaInfo[] {
  if (!fs.existsSync(cuadrillasDir)) return [];

  const entries = fs.readdirSync(cuadrillasDir, { withFileTypes: true });
  const list: CuadrillaInfo[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const yamlPath = path.join(cuadrillasDir, entry.name, "cuadrilla.yaml");
    if (fs.existsSync(yamlPath)) {
      try {
        const raw = fs.readFileSync(yamlPath, "utf-8");
        const parsed = parseYaml(raw) as Record<string, unknown> | null;
        const c = parsed?.cuadrilla as Record<string, unknown> | undefined;
        if (c && typeof c === "object") {
          list.push({
            code: typeof c.code === "string" ? c.code : entry.name,
            name: typeof c.name === "string" ? c.name : entry.name,
            description: typeof c.description === "string" ? c.description : "",
            icon: typeof c.icon === "string" ? c.icon : "\u{1F4CB}",
            agents: Array.isArray(c.agents) ? (c.agents as unknown[]).filter((a): a is string => typeof a === "string") : [],
          });
          continue;
        }
        if (parsed && typeof parsed === "object" && typeof parsed.code === "string") {
          list.push({
            code: parsed.code,
            name: typeof parsed.name === "string" ? parsed.name : entry.name,
            description: typeof parsed.description === "string" ? parsed.description : "",
            icon: typeof parsed.icon === "string" ? parsed.icon : "\u{1F4CB}",
            agents: Array.isArray(parsed.agents)
              ? (parsed.agents as unknown[]).filter((a): a is string => typeof a === "string")
              : [],
          });
          continue;
        }
      } catch {
        // Fall through
      }
    }

    list.push({
      code: entry.name,
      name: entry.name,
      description: "",
      icon: "\u{1F4CB}",
      agents: [],
    });
  }

  return list;
}

function isValidState(data: unknown): data is CuadrillaState {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.status === "string" &&
    d.step != null && typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

/**
 * `cuadrilla.yaml` can set `code` different from the folder name — the UI keys by `code`
 * (see discoverCuadrillas). Active state keys must match.
 */
function resolveCuadrillaCode(cuadrillasDir: string, folderName: string): string {
  const yamlPath = path.join(cuadrillasDir, folderName, "cuadrilla.yaml");
  if (!fs.existsSync(yamlPath)) return folderName;
  try {
    const raw = fs.readFileSync(yamlPath, "utf-8");
    const parsed = parseYaml(raw) as Record<string, unknown> | null;
    const c = parsed?.cuadrilla as Record<string, unknown> | undefined;
    if (c && typeof c.code === "string") return c.code;
    if (parsed && typeof parsed === "object" && typeof (parsed as { code?: unknown }).code === "string") {
      return (parsed as { code: string }).code;
    }
  } catch {
    // ignore
  }
  return folderName;
}

/**
 * After a successful run, the Pipeline Runner copies `state.json` to
 * `output/{run_id}/state.json` and removes the working `cuadrillas/{name}/state.json`.
 * Without this fallback, the Office tab always shows "Sin ejecución" for completed runs.
 */
function readLatestOutputState(cuadrillaDir: string): CuadrillaState | null {
  const outDir = path.join(cuadrillaDir, "output");
  if (!fs.existsSync(outDir)) return null;
  let dirents: fs.Dirent[];
  try {
    dirents = fs.readdirSync(outDir, { withFileTypes: true });
  } catch {
    return null;
  }
  const runIds = dirents.filter((e) => e.isDirectory()).map((e) => e.name);
  runIds.sort((a, b) => b.localeCompare(a));
  for (const runId of runIds) {
    const p = path.join(outDir, runId, "state.json");
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, "utf-8");
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
    } catch {
      // skip
    }
  }
  return null;
}

function readActiveStates(cuadrillasDir: string): Record<string, CuadrillaState> {
  const states: Record<string, CuadrillaState> = {};
  if (!fs.existsSync(cuadrillasDir)) return states;

  const entries = fs.readdirSync(cuadrillasDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const cuadrillaPath = path.join(cuadrillasDir, entry.name);
    const code = resolveCuadrillaCode(cuadrillasDir, entry.name);
    const rootStatePath = path.join(cuadrillaPath, "state.json");

    let parsed: CuadrillaState | null = null;
    if (fs.existsSync(rootStatePath)) {
      try {
        const raw = fs.readFileSync(rootStatePath, "utf-8");
        const j: unknown = JSON.parse(raw);
        if (isValidState(j)) parsed = j;
      } catch {
        // Skip invalid JSON
      }
    }

    if (!parsed) {
      parsed = readLatestOutputState(cuadrillaPath);
    }

    if (parsed) {
      states[code] = parsed;
    }
  }

  return states;
}

function buildSnapshot(cuadrillasDir: string): WsMessage {
  return {
    type: "SNAPSHOT",
    cuadrillas: discoverCuadrillas(cuadrillasDir),
    activeStates: readActiveStates(cuadrillasDir),
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
