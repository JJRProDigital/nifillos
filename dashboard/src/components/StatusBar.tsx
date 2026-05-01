import { useEffect, useState } from "react";
import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import { formatElapsed } from "@/lib/formatTime";

import type { CuadrillaState, TabId } from "@/types/state";

function elapsedMsForState(state: CuadrillaState): number {
  if (!state.startedAt) return 0;
  const start = new Date(state.startedAt).getTime();
  const endIso = state.completedAt ?? state.failedAt;
  if (endIso) {
    return Math.max(0, new Date(endIso).getTime() - start);
  }
  if (state.status === "completed" || state.status === "failed") {
    const end = new Date(state.updatedAt).getTime();
    return Math.max(0, end - start);
  }
  return Math.max(0, Date.now() - start);
}

function isRunTerminal(state: CuadrillaState): boolean {
  return (
    state.status === "completed" ||
    state.status === "failed" ||
    !!(state.completedAt || state.failedAt)
  );
}

export function StatusBar({ tab }: { tab: TabId }) {
  const selectedCuadrilla = useCuadrillaStore((s) => s.selectedCuadrilla);
  const state = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.activeStates.get(s.selectedCuadrilla) : undefined
  );
  const isConnected = useCuadrillaStore((s) => s.isConnected);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (tab !== "office" || !state?.startedAt) {
      setElapsed(0);
      return;
    }

    setElapsed(elapsedMsForState(state));
    if (isRunTerminal(state)) return;

    const interval = setInterval(() => {
      setElapsed((prev) => (state ? elapsedMsForState(state) : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [tab, state, state?.startedAt, state?.status, state?.updatedAt, state?.completedAt, state?.failedAt]);

  if (tab === "metrics") {
    return (
      <footer className="app-footer" role="contentinfo">
        <span style={{ color: "var(--text-secondary)", fontSize: "0.8125rem" }}>
          Métricas · API /__cuadrillas_api
        </span>
        <ConnectionStatus connected={isConnected} />
      </footer>
    );
  }

  if (!selectedCuadrilla || !state) {
    return (
      <footer className="app-footer" role="contentinfo">
        <span style={{ color: "var(--text-secondary)" }}>Selecciona una cuadrilla activa</span>
        <ConnectionStatus connected={isConnected} />
      </footer>
    );
  }

  return (
    <footer className="app-footer" role="contentinfo">
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <span>
          Step {state.step.current}/{state.step.total}
          {state.step.label ? ` — ${state.step.label}` : ""}
        </span>
        {state.startedAt && (
          <span style={{ color: "var(--text-secondary)" }} className="metrics-tabular">
            {formatElapsed(elapsed)}
          </span>
        )}
        {state.handoff && (
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
            title={`${state.handoff.from} → ${state.handoff.to}: ${state.handoff.message}`}
          >
            {state.handoff.from} → {state.handoff.to}: {state.handoff.message}
          </span>
        )}
      </div>
      <ConnectionStatus connected={isConnected} />
    </footer>
  );
}

function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }} title={connected ? "WebSocket conectado" : "WebSocket desconectado"}>
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: connected ? "var(--accent-green)" : "var(--accent-red)",
          flexShrink: 0,
        }}
      />
      <span className="sr-only">{connected ? "Conexión en tiempo real activa" : "Sin conexión en tiempo real"}</span>
    </span>
  );
}
