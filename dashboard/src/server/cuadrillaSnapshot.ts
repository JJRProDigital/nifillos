/**
 * Lectura de cuadrillas y state.json (raíz + fallback output/) compartida entre
 * WebSocket del plugin Vite y GET /__cuadrillas_api/snapshot (polling HTTP).
 */
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { CuadrillaInfo, CuadrillaState } from "../types/state";

export function discoverCuadrillas(cuadrillasDir: string): CuadrillaInfo[] {
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
    d.step != null &&
    typeof d.step === "object" &&
    Array.isArray(d.agents)
  );
}

/**
 * `cuadrilla.yaml` puede fijar `code` distinto del nombre de carpeta — las claves del estado deben usar ese `code`.
 */
export function resolveCuadrillaCode(cuadrillasDir: string, folderName: string): string {
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

export function readActiveStates(cuadrillasDir: string): Record<string, CuadrillaState> {
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

export function buildSnapshotPayload(cuadrillasDir: string): {
  cuadrillas: CuadrillaInfo[];
  activeStates: Record<string, CuadrillaState>;
} {
  return {
    cuadrillas: discoverCuadrillas(cuadrillasDir),
    activeStates: readActiveStates(cuadrillasDir),
  };
}
