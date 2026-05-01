import type { CuadrillaInfo, CuadrillaState } from "@/types/state";
import type { MetricsLang } from "@/metrics/metricsCopy";
import { StatusBadge } from "./StatusBadge";

interface CuadrillaCardProps {
  cuadrilla: CuadrillaInfo;
  state: CuadrillaState | undefined;
  isSelected: boolean;
  onSelect: () => void;
  lang: MetricsLang;
}

export function CuadrillaCard({ cuadrilla, state, isSelected, onSelect, lang }: CuadrillaCardProps) {
  const isActive = !!state;
  const status = state?.status ?? "inactive";

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "100%",
        minHeight: 44,
        padding: "10px 12px",
        border: "none",
        borderLeft: isSelected ? "3px solid var(--accent-cyan)" : "3px solid transparent",
        background: isSelected ? "var(--bg-secondary)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
        cursor: "pointer",
        textAlign: "left",
        fontSize: 13,
        fontFamily: "inherit",
        transition: "background 0.18s cubic-bezier(0.33, 1, 0.68, 1)",
      }}
    >
      <StatusBadge status={status} lang={lang} />
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
