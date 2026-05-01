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
    const raw = r.completedAt || r.startedAt || r.metricsChartAt;
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

export function MetricsCharts({
  runs,
  lang,
  loading,
}: {
  runs: RunSummary[];
  lang: MetricsLang;
  loading?: boolean;
}) {
  const data = aggregateByDay(runs);
  const summaryAria =
    lang === "es"
      ? `Gráficos de tendencias: ${data.length} días con datos de runs cargados. Coste en línea continua dorada; tokens en línea azul punteada.`
      : `Trend charts: ${data.length} days with data from loaded runs. Cost as solid gold line; tokens as dashed blue line.`;

  if (loading) {
    return (
      <section
        className="metrics-charts-skeleton"
        aria-busy="true"
        aria-label={t(lang, "chartsLoading")}
      >
        <h2 style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.8125rem" }}>{t(lang, "chartsTitle")}</h2>
        <div className="metrics-chart-skeleton-row">
          <div className="chart-skeleton-panel" />
          <div className="chart-skeleton-panel" />
        </div>
      </section>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ color: "var(--text-secondary)", fontSize: "0.8125rem", marginBottom: 12 }} role="status">
        {lang === "es" ? "Sin fechas para graficar." : "No dated runs to chart."}
      </div>
    );
  }

  return (
    <section style={{ marginBottom: 16 }} aria-label={summaryAria}>
      <h2 style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.8125rem" }}>{t(lang, "chartsTitle")}</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: 12,
          minHeight: 220,
        }}
      >
        <figure className="chart-panel" style={{ margin: 0 }}>
          <figcaption className="chart-panel-title">{t(lang, "costByDay")}</figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="cost"
                name={t(lang, "cost")}
                stroke="var(--chart-cost)"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </figure>
        <figure className="chart-panel" style={{ margin: 0 }}>
          <figcaption className="chart-panel-title">{t(lang, "tokensByDay")}</figcaption>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
              <Line
                type="monotone"
                dataKey="tokens"
                name={t(lang, "tokens")}
                stroke="var(--chart-tokens)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </figure>
      </div>
    </section>
  );
}
