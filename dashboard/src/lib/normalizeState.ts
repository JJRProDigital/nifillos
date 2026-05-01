import type { CuadrillaState, Agent, CuadrillaInfo, AgentStatus } from "@/types/state";

const ALLOWED_STATUS: readonly AgentStatus[] = [
  "idle",
  "working",
  "delivering",
  "done",
  "checkpoint",
];

/** Normaliza valores de estado que vienen del runner con mayúsculas o variantes. */
export function normalizeAgentStatus(raw: unknown): AgentStatus {
  const s = typeof raw === "string" ? raw.toLowerCase().trim() : "";
  return ALLOWED_STATUS.includes(s as AgentStatus) ? (s as AgentStatus) : "idle";
}

function humanizeAgentId(id: string): string {
  return id
    .replace(/\.agent$/i, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function coerceDesk(raw: unknown): { col: number; row: number } {
  if (!raw || typeof raw !== "object") return { col: 1, row: 1 };
  const d = raw as Record<string, unknown>;
  const col = typeof d.col === "number" && Number.isFinite(d.col) ? d.col : 1;
  const row = typeof d.row === "number" && Number.isFinite(d.row) ? d.row : 1;
  return { col, row };
}

/**
 * Lista de agentes para la Oficina: repara estados incompletos y, si `agents` viene vacío
 * pero la cuadrilla define IDs en YAML, crea placeholders para que los sprites no desaparezcan.
 */
export function agentsForOfficeDisplay(
  state: CuadrillaState,
  info: CuadrillaInfo | undefined
): Agent[] {
  const yamlIds =
    info?.agents?.filter((x): x is string => typeof x === "string" && x.length > 0) ?? [];
  const raw = Array.isArray(state.agents) ? state.agents : [];

  const normalizedFromState: Agent[] = raw.map((a) => {
    const id = typeof a.id === "string" && a.id ? a.id : "agent";
    const name =
      typeof a.name === "string" && a.name.trim()
        ? a.name
        : humanizeAgentId(id);
    return {
      id,
      name,
      icon: typeof a.icon === "string" && a.icon ? a.icon : "\u{1F916}",
      status: normalizeAgentStatus(a.status),
      deliverTo: typeof a.deliverTo === "string" || a.deliverTo === null ? a.deliverTo : null,
      desk: coerceDesk(a.desk),
    };
  });

  if (normalizedFromState.length > 0) {
    const ids = new Set(normalizedFromState.map((x) => x.id));
    const extras: Agent[] = [];
    for (const yid of yamlIds) {
      if (!ids.has(yid)) {
        extras.push({
          id: yid,
          name: humanizeAgentId(yid),
          icon: "\u{1F916}",
          status: "idle",
          deliverTo: null,
          desk: { col: 1, row: 1 },
        });
      }
    }
    return [...normalizedFromState, ...extras];
  }

  if (yamlIds.length === 0) return [];

  return yamlIds.map((id) => ({
    id,
    name: humanizeAgentId(id),
    icon: "\u{1F916}",
    status: "idle",
    deliverTo: null,
    desk: { col: 1, row: 1 },
  }));
}

/**
 * Returns agents sorted by desk position (row first, then col).
 */
export function sortAgentsByDesk(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => {
    if (a.desk.row !== b.desk.row) return a.desk.row - b.desk.row;
    return a.desk.col - b.desk.col;
  });
}

/**
 * Find agent by id.
 */
export function findAgent(state: CuadrillaState, agentId: string): Agent | undefined {
  return state.agents.find((a) => a.id === agentId);
}

/**
 * Returns the currently working agent, if any.
 */
export function getWorkingAgent(state: CuadrillaState): Agent | undefined {
  return state.agents.find((a) => a.status === "working");
}
