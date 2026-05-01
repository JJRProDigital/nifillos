import type { CuadrillaStatus } from "@/types/state";
import type { MetricsLang } from "@/metrics/metricsCopy";
import { t } from "@/metrics/metricsCopy";

const STATUS_COLORS: Record<CuadrillaStatus | "inactive", string> = {
  idle: "#888",
  running: "var(--accent-cyan)",
  completed: "var(--accent-green)",
  failed: "var(--accent-red)",
  checkpoint: "var(--accent-amber)",
  inactive: "#444",
};

function statusAria(lang: MetricsLang, status: CuadrillaStatus | "inactive"): string {
  switch (status) {
    case "idle":
      return t(lang, "statusIdle");
    case "running":
      return t(lang, "statusRunning");
    case "completed":
      return t(lang, "statusCompleted");
    case "failed":
      return t(lang, "statusFailed");
    case "checkpoint":
      return t(lang, "statusCheckpoint");
    default:
      return t(lang, "statusInactive");
  }
}

interface StatusBadgeProps {
  status: CuadrillaStatus | "inactive";
  lang: MetricsLang;
}

export function StatusBadge({ status, lang }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const isPulsing = status === "running" || status === "checkpoint";

  return (
    <span
      role="img"
      aria-label={statusAria(lang, status)}
      className={isPulsing ? "status-badge-dot--pulse" : undefined}
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: isPulsing ? `0 0 8px ${color}` : "none",
        flexShrink: 0,
      }}
    />
  );
}
