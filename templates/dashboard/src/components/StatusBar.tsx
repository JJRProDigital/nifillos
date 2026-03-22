import { useEffect, useState } from "react";
import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import { formatElapsed } from "@/lib/formatTime";

export function StatusBar() {
  const selectedCuadrilla = useCuadrillaStore((s) => s.selectedCuadrilla);
  const state = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.activeStates.get(s.selectedCuadrilla) : undefined
  );
  const isConnected = useCuadrillaStore((s) => s.isConnected);

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!state?.startedAt) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(state.startedAt).getTime();
    const tick = () => setElapsed(Date.now() - startTime);
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state?.startedAt]);

  if (!selectedCuadrilla || !state) {
    return (
      <footer style={footerStyle}>
        <span style={{ color: "var(--text-secondary)" }}>
          Selecciona una cuadrilla activa
        </span>
        <ConnectionDot connected={isConnected} />
      </footer>
    );
  }

  return (
    <footer style={footerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
        <span>
          Step {state.step.current}/{state.step.total}
          {state.step.label ? ` — ${state.step.label}` : ""}
        </span>
        {state.startedAt && (
          <span style={{ color: "var(--text-secondary)" }}>
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
      <ConnectionDot connected={isConnected} />
    </footer>
  );
}

function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span
      title={connected ? "Connected" : "Disconnected"}
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: connected ? "var(--accent-green)" : "var(--accent-red)",
        flexShrink: 0,
      }}
    />
  );
}

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "8px 16px",
  borderTop: "1px solid var(--border)",
  background: "var(--bg-sidebar)",
  fontSize: 13,
  height: 40,
  minHeight: 40,
};
