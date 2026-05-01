import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { RunSummary } from "@/types/metrics";
import type { MetricsLang } from "./metricsCopy";
import { t } from "./metricsCopy";

type DayRow = { day: string; cost: number; tokens: number };

function aggregateByDay(runs: RunSummary[]): DayRow[] {
  const map = new Map<string, { cost: number; tokens: number }>();
  for (const r of runs) {
    const raw = r.completedAt || r.startedAt;
    if (!raw) continue;
    const day = raw.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    const cur = map.get(day) || { cost: 0, tokens: 0 };
    cur.cost += r.costEurApprox;
    cur.tokens += r.totalTokens;
    map.set(day, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => ({ day, cost: Math.round(v.cost * 10000) / 10000, tokens: v.tokens }));
}

export function MetricsCharts({ runs, lang }: { runs: RunSummary[]; lang: MetricsLang }) {
  const data = aggregateByDay(runs);
  if (data.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12 }}>
        {lang === "es" ? "Sin fechas para graficar." : "No dated runs to chart."}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{t(lang, "chartsTitle")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minHeight: 220 }}>
        <div style={{ background: "var(--bg-sidebar)", borderRadius: 8, padding: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{t(lang, "costByDay")}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="cost" name={t(lang, "cost")} stroke="var(--accent-cyan)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: "var(--bg-sidebar)", borderRadius: 8, padding: 8, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{t(lang, "tokensByDay")}</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-secondary)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="tokens" name={t(lang, "tokens")} stroke="var(--accent-green)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
