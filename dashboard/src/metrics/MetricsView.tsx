import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { RunSummary } from "@/types/metrics";
import { MetricsCharts } from "./MetricsCharts";
import { t, type MetricsLang } from "./metricsCopy";
import { readMetricsUrl, writeMetricsUrl } from "./metricsUrlSync";
import { exportRunsCsv } from "./metricsExport";
import {
  fetchArtifacts,
  fetchAudit,
  fetchRunsPage,
  fetchRunsSummary,
  previewUrl,
  downloadUrl,
  postDiff,
  postDiffRuns,
} from "./metricsApi";

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|ico)$/i;

export function MetricsView({ lang }: { lang: MetricsLang }) {
  const [cuadrillas, setCuadrillas] = useState<string[]>([]);
  const [chartRuns, setChartRuns] = useState<RunSummary[]>([]);
  const [cuadrilla, setCuadrilla] = useState("");
  const [runId, setRunId] = useState("");
  const [page, setPage] = useState({ offset: 0, limit: 20, total: 0 });
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [filter, setFilter] = useState("");
  const [artifacts, setArtifacts] = useState<string[]>([]);
  const [selectedRel, setSelectedRel] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<"iframe" | "img" | "text" | "none">("none");
  const [textPreview, setTextPreview] = useState("");
  const [auditLines, setAuditLines] = useState<string[]>([]);
  const [diffOut, setDiffOut] = useState("");
  const [diffLeft, setDiffLeft] = useState("");
  const [diffRight, setDiffRight] = useState("");
  const [diffRunLeft, setDiffRunLeft] = useState("");
  const [diffRunRight, setDiffRunRight] = useState("");
  const [diffRunRel, setDiffRunRel] = useState("state.json");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const syncUrl = useCallback(
    (c: string, r: string) => {
      writeMetricsUrl({ cuadrilla: c, run: r, lang });
    },
    [lang],
  );

  useEffect(() => {
    const u = readMetricsUrl();
    let cancelled = false;
    void (async () => {
      try {
        const summary = await fetchRunsSummary();
        if (cancelled) return;
        const codes = summary.byCuadrilla.map((b) => b.code).sort();
        setCuadrillas(codes);
        setChartRuns(summary.runs);
        const c0 = u.cuadrilla && codes.includes(u.cuadrilla) ? u.cuadrilla : codes[0] || "";
        setCuadrilla(c0);
        setRunId(u.run && u.run.length ? u.run : "");
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!cuadrilla) {
      setRuns([]);
      setPage((p) => ({ ...p, total: 0 }));
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const data = await fetchRunsPage(cuadrilla, page.offset, page.limit);
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          return;
        }
        setRuns(data.runs);
        setPage((p) => ({ ...p, total: data.total }));
        setError(null);
        setRunId((current) => {
          if (current && data.runs.some((r) => r.runId === current)) return current;
          const next = data.runs[0]?.runId ?? "";
          if (next) syncUrl(cuadrilla, next);
          return next;
        });
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cuadrilla, page.offset, page.limit, syncUrl]);

  useEffect(() => {
    if (!cuadrilla || !runId) {
      setArtifacts([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const a = await fetchArtifacts(cuadrilla, runId);
        if (cancelled) return;
        setArtifacts(a.files);
      } catch {
        if (!cancelled) setArtifacts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cuadrilla, runId]);

  const filteredRuns = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return runs;
    return runs.filter((r) => r.runId.toLowerCase().includes(q));
  }, [runs, filter]);

  const rowVirtual = useVirtualizer({
    count: artifacts.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 28,
    overscan: 12,
  });

  const selectRun = (r: string) => {
    setRunId(r);
    syncUrl(cuadrilla, r);
  };

  const onPickCuadrilla = (c: string) => {
    setCuadrilla(c);
    setPage((p) => ({ ...p, offset: 0 }));
    setRunId("");
    writeMetricsUrl({ cuadrilla: c, run: "", lang });
  };

  useEffect(() => {
    writeMetricsUrl({ lang });
  }, [lang]);

  const refreshAudit = () => {
    void fetchAudit(400).then((a) => setAuditLines(a.lines)).catch(() => setAuditLines([]));
  };

  useEffect(() => {
    refreshAudit();
  }, []);

  const openPreview = async (rel: string) => {
    setSelectedRel(rel);
    if (IMG_EXT.test(rel)) {
      setPreviewKind("img");
      return;
    }
    const lower = rel.toLowerCase();
    if (lower.endsWith(".pdf") || lower.endsWith(".html") || lower.endsWith(".htm") || lower.endsWith(".md") || lower.endsWith(".markdown")) {
      setPreviewKind("iframe");
      return;
    }
    const url = previewUrl(cuadrilla, runId, rel);
    if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mp3") || lower.endsWith(".wav")) {
      setPreviewKind("iframe");
      return;
    }
    setPreviewKind("text");
    try {
      const res = await fetch(url, { cache: "no-store" });
      const t = await res.text();
      setTextPreview(t);
    } catch {
      setTextPreview("—");
    }
  };

  const runIntraDiff = () => {
    void postDiff({ cuadrilla, runId, left: diffLeft, right: diffRight })
      .then(setDiffOut)
      .catch((e) => setDiffOut(String(e)));
  };

  const runCrossDiff = () => {
    void postDiffRuns({
      cuadrilla,
      leftRunId: diffRunLeft,
      rightRunId: diffRunRight,
      relPath: diffRunRel || "state.json",
    })
      .then(setDiffOut)
      .catch((e) => setDiffOut(String(e)));
  };

  const maxOffset = Math.max(0, page.total - page.limit);

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
      }}
    >
      {error && (
        <div style={{ color: "var(--accent-red)", fontSize: 13 }}>
          {t(lang, "error")}: {error}
        </div>
      )}

      <MetricsCharts runs={chartRuns} lang={lang} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {t(lang, "cuadrilla")}
          <select
            value={cuadrilla}
            onChange={(e) => onPickCuadrilla(e.target.value)}
            style={selectStyle}
          >
            {cuadrillas.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {t(lang, "pageSize")}
          <select
            value={page.limit}
            onChange={(e) =>
              setPage((p) => ({ ...p, limit: Number(e.target.value), offset: 0 }))
            }
            style={selectStyle}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <input
          placeholder={t(lang, "searchPlaceholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...inputStyle, minWidth: 200 }}
        />
        <button type="button" style={btn} onClick={() => exportRunsCsv(filteredRuns, "nifillos-runs-page.csv")}>
          {t(lang, "exportCsvPage")}
        </button>
        <button
          type="button"
          style={btn}
          onClick={() => fetchRunsSummary().then((s) => exportRunsCsv(s.runs, "nifillos-runs-summary.csv"))}
        >
          {t(lang, "exportCsvAll")}
        </button>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {t(lang, "total")}: {page.total} · {loading ? t(lang, "loading") : ""}
        </span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--bg-sidebar)", textAlign: "left" }}>
              <th style={th}>{t(lang, "run")}</th>
              <th style={th}>{t(lang, "status")}</th>
              <th style={th}>{t(lang, "steps")}</th>
              <th style={th}>{t(lang, "duration")}</th>
              <th style={th}>{t(lang, "tokens")}</th>
              <th style={th}>{t(lang, "inOutPct")}</th>
              <th style={th}>{t(lang, "cost")}</th>
              <th style={th}>⚠</th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((r) => (
              <tr
                key={r.runId}
                onClick={() => selectRun(r.runId)}
                style={{
                  cursor: "pointer",
                  background: r.runId === runId ? "rgba(0,212,255,0.08)" : undefined,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <td style={td}>{r.runId}</td>
                <td style={td}>{r.status}</td>
                <td style={td}>{r.steps ?? "—"}</td>
                <td style={td}>{r.duration ?? "—"}</td>
                <td style={td}>
                  {r.totalTokens.toLocaleString()}{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    ({r.tokensRegistered ? t(lang, "tokenReg") : t(lang, "tokenEst")})
                  </span>
                </td>
                <td style={td}>{r.inputPct}%</td>
                <td style={td}>€{r.costEurApprox.toFixed(4)}</td>
                <td style={td}>
                  {r.alertCost ? "💶" : ""}
                  {r.alertTokens ? "🔢" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRuns.length === 0 && !loading && (
          <div style={{ padding: 12, color: "var(--text-secondary)" }}>{t(lang, "noRuns")}</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          style={btn}
          disabled={page.offset <= 0}
          onClick={() => setPage((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
        >
          {t(lang, "prev")}
        </button>
        <button
          type="button"
          style={btn}
          disabled={page.offset >= maxOffset}
          onClick={() => setPage((p) => ({ ...p, offset: Math.min(maxOffset, p.offset + p.limit) }))}
        >
          {t(lang, "next")}
        </button>
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {t(lang, "runsPage")}: {page.offset + 1}–{Math.min(page.offset + page.limit, page.total)} / {page.total}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: 12, minHeight: 360 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{t(lang, "artifacts")}</div>
          <div
            ref={listRef}
            style={{
              height: 280,
              overflow: "auto",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-sidebar)",
            }}
          >
            <div style={{ height: rowVirtual.getTotalSize(), position: "relative" }}>
              {rowVirtual.getVirtualItems().map((vRow) => {
                const rel = artifacts[vRow.index];
                return (
                  <button
                    key={vRow.key}
                    type="button"
                    onClick={() => void openPreview(rel)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: vRow.size,
                      transform: `translateY(${vRow.start}px)`,
                      textAlign: "left",
                      padding: "4px 8px",
                      fontSize: 11,
                      fontFamily: "inherit",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      background: selectedRel === rel ? "rgba(0,212,255,0.12)" : "transparent",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{t(lang, "preview")}</div>
          <div style={{ flex: 1, border: "1px solid var(--border)", borderRadius: 8, minHeight: 240, background: "#0a0810" }}>
            {previewKind === "none" && (
              <div style={{ padding: 12, color: "var(--text-secondary)" }}>{t(lang, "noArtifact")}</div>
            )}
            {previewKind === "iframe" && selectedRel && (
              <iframe
                title="preview"
                src={previewUrl(cuadrilla, runId, selectedRel)}
                style={{ width: "100%", height: 320, border: "none", borderRadius: 8 }}
                sandbox="allow-same-origin allow-scripts"
              />
            )}
            {previewKind === "img" && selectedRel && (
              <img
                src={previewUrl(cuadrilla, runId, selectedRel)}
                alt=""
                style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", display: "block", margin: "0 auto" }}
              />
            )}
            {previewKind === "text" && (
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  fontSize: 11,
                  maxHeight: 320,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {textPreview}
              </pre>
            )}
          </div>
          {selectedRel && (
            <div style={{ display: "flex", gap: 8 }}>
              <a href={previewUrl(cuadrilla, runId, selectedRel)} target="_blank" rel="noreferrer" style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
                {t(lang, "openTab")}
              </a>
              <a href={downloadUrl(cuadrilla, runId, selectedRel)} style={{ ...btn, display: "inline-block", textDecoration: "none" }}>
                {t(lang, "download")}
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{t(lang, "diffIntra")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input style={inputStyle} value={diffLeft} onChange={(e) => setDiffLeft(e.target.value)} placeholder={t(lang, "left")} />
            <input style={inputStyle} value={diffRight} onChange={(e) => setDiffRight(e.target.value)} placeholder={t(lang, "right")} />
            <button type="button" style={btn} onClick={runIntraDiff}>
              {t(lang, "applyDiff")}
            </button>
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13 }}>{t(lang, "diffRuns")}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input style={inputStyle} value={diffRunLeft} onChange={(e) => setDiffRunLeft(e.target.value)} placeholder="run A" />
            <input style={inputStyle} value={diffRunRight} onChange={(e) => setDiffRunRight(e.target.value)} placeholder="run B" />
            <input style={inputStyle} value={diffRunRel} onChange={(e) => setDiffRunRel(e.target.value)} placeholder={t(lang, "relPath")} />
            <button type="button" style={btn} onClick={runCrossDiff}>
              {t(lang, "applyDiff")}
            </button>
          </div>
        </div>
      </div>

      <pre
        style={{
          margin: 0,
          padding: 12,
          fontSize: 11,
          maxHeight: 200,
          overflow: "auto",
          border: "1px solid var(--border)",
          borderRadius: 8,
          background: "var(--bg-sidebar)",
        }}
      >
        {diffOut}
      </pre>

      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{t(lang, "auditTitle")}</span>
          <button type="button" style={btn} onClick={refreshAudit}>
            {t(lang, "refreshAudit")}
          </button>
        </div>
        <pre style={{ fontSize: 10, maxHeight: 140, overflow: "auto", margin: 0, whiteSpace: "pre-wrap" }}>
          {auditLines.join("\n")}
        </pre>
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  marginLeft: 6,
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "4px 8px",
};

const inputStyle: React.CSSProperties = {
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 12,
};

const btn: React.CSSProperties = {
  background: "var(--bg-secondary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
};

const th: React.CSSProperties = { padding: "8px 10px", fontSize: 11 };
const td: React.CSSProperties = { padding: "8px 10px" };
