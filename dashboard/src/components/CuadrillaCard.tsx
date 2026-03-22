import type { CuadrillaInfo, CuadrillaState } from "@/types/state";
import { StatusBadge } from "./StatusBadge";

interface CuadrillaCardProps {
  cuadrilla: CuadrillaInfo;
  state: CuadrillaState | undefined;
  isSelected: boolean;
  onSelect: () => void;
}

export function CuadrillaCard({ cuadrilla, state, isSelected, onSelect }: CuadrillaCardProps) {
  const isActive = !!state;
  const status = state?.status ?? "inactive";

  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "10px 12px",
        border: "none",
        borderLeft: isSelected ? "3px solid var(--accent-cyan)" : "3px solid transparent",
        background: isSelected ? "var(--bg-secondary)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontFamily: "inherit",
        transition: "all 0.15s ease",
      }}
    >
      <StatusBadge status={status} />
      <span style={{ marginRight: 4 }}>{cuadrilla.icon}</span>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {cuadrilla.name}
      </span>
      {state?.step && (
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
          {state.step.current}/{state.step.total}
        </span>
      )}
    </button>
  );
}
