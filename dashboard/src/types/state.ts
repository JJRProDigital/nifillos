// state.json structure — matches Pipeline Runner output
export interface AgentDesk {
  col: number;
  row: number;
}

export type AgentStatus =
  | "idle"
  | "working"
  | "delivering"
  | "done"
  | "checkpoint";

export interface Agent {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  deliverTo: string | null;
  desk: AgentDesk;
}

export interface Handoff {
  from: string;
  to: string;
  message: string;
  completedAt: string;
}

export type CuadrillaStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "checkpoint";

export interface CuadrillaState {
  cuadrilla: string;
  status: CuadrillaStatus;
  step: {
    current: number;
    total: number;
    label: string;
  };
  agents: Agent[];
  handoff: Handoff | null;
  startedAt: string | null;
  /** ISO timestamp when the pipeline finished successfully (runner output). */
  completedAt?: string | null;
  /** ISO timestamp when the pipeline failed (runner output). */
  failedAt?: string | null;
  updatedAt: string;
}

// Metadata from cuadrilla.yaml (root key `cuadrilla:`)
export interface CuadrillaInfo {
  code: string;
  name: string;
  description: string;
  icon: string;
  agents: string[];
}

export type TabId = "office" | "metrics";

export type WsMessage =
  | { type: "SNAPSHOT"; cuadrillas: CuadrillaInfo[]; activeStates: Record<string, CuadrillaState> }
  | { type: "CUADRILLA_ACTIVE"; cuadrilla: string; state: CuadrillaState }
  | { type: "CUADRILLA_UPDATE"; cuadrilla: string; state: CuadrillaState }
  | { type: "CUADRILLA_INACTIVE"; cuadrilla: string };
