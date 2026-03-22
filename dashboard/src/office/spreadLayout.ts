import type { Agent, AgentDesk } from "@/types/state";

/**
 * Separación en celdas (1-based) entre puestos consecutivos en la misma fila/columna.
 * Valores mayores = agentes más separados en el suelo isométrico.
 */
function spreadStepForCount(n: number): number {
  if (n <= 1) return 1;
  if (n <= 4) return 3;
  if (n <= 9) return 2;
  if (n <= 16) return 2;
  return 1;
}

/** Columnas de la rejilla: ceil(√n) (filas se deducen al rellenar por filas). */
function gridColsForCount(n: number): number {
  return Math.ceil(Math.sqrt(n));
}

/**
 * Posiciones de escritorio repartidas por el suelo (esquinas y filas primero).
 * Sirve para cualquier n ≥ 1; con muchos agentes el paso baja para no inflar demasiado el escenario.
 */
export function spreadDeskSlots(n: number): AgentDesk[] {
  if (n <= 0) return [];
  const cols = gridColsForCount(n);
  const step = spreadStepForCount(n);
  const slots: AgentDesk[] = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    slots.push({ col: c * step + 1, row: r * step + 1 });
  }
  return slots;
}

export function maxDeskExtents(slots: readonly AgentDesk[]): { maxCol: number; maxRow: number } {
  let maxCol = 1;
  let maxRow = 1;
  for (const s of slots) {
    maxCol = Math.max(maxCol, s.col);
    maxRow = Math.max(maxRow, s.row);
  }
  return { maxCol, maxRow };
}

/** Asigna `desk` repartido; conserva el orden del array de entrada. */
export function assignSpreadDesks(agents: Agent[]): Agent[] {
  const slots = spreadDeskSlots(agents.length);
  return agents.map((a, i) => ({ ...a, desk: slots[i]! }));
}

export function layoutExtentsForAgentCount(n: number): { maxCol: number; maxRow: number } {
  if (n <= 0) return { maxCol: 1, maxRow: 1 };
  return maxDeskExtents(spreadDeskSlots(n));
}
