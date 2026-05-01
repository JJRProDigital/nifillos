import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { RunSummary } from "@/types/metrics";
import { MetricsCharts } from "./MetricsCharts";
import { DiffView } from "./DiffView";
import { t, runRowLabel, type MetricsLang } from "./metricsCopy";
import { readMetricsUrl, writeMetricsUrl } from "./metricsUrlSync";
import { exportRunsCsv } from "./metricsExport";
import {
  MetricsApiError,
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

function formatLoadError(lang: MetricsLang, e: unknown): string {
  if (e instanceof MetricsApiError) {
    if (e.status === 0) {
      return e.message === "network" ? t(lang, "errorNetwork") : t(lang, "errorUnknown");
    }
    if (e.status === 404) return t(lang, "errorNotFound");
    if (e.status >= 400 && e.status < 500) return `${t(lang, "errorClient")} (${e.status})`;
    if (e.status >= 500) return `${t(lang, "errorServer")} (${e.status})`;
  }
  if (e instanceof Error && e.message) return e.message;
  return t(lang, "errorUnknown");
}

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
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const pendingFocusRun = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const chartRunsForCuadrilla = useMemo(
    () => (cuadrilla ? chartRuns.filter((r) => r.cuadrilla === cuadrilla) : chartRuns),
    [chartRuns, cuadrilla],
  );

  const syncUrl = useCallback(
    (c: string, r: string) => {
      writeMetricsUrl({ cuadrilla: c, run: r, lang });
    },
    [lang],
  );

  useEffect(() => {
    const u = readMetricsUrl();
    if (u.run?.length) pendingFocusRun.current = u.run;
    let cancelled = false;
    void (async () => {
      setSummaryLoading(true);
      try {
        const summary = await fetchRunsSummary();
        if (cancelled) return;
        const codes = summary.byCuadrilla.map((b) => b.code).sort();
        setCuadrillas(codes);
        setChartRuns(summary.runs);
        const c0 = u.cuadrilla && codes.includes(u.cuadrilla) ? u.cuadrilla : codes[0] || "";
        setCuadrilla(c0);
        setRunId(u.run && u.run.length ? u.run : "");
        setSummaryError(null);
      } catch (e) {
        if (!cancelled) setSummaryError(formatLoadError(lang, e));
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang]);

  useEffect(() => {
    if (!cuadrilla) {
      setRuns([]);
      setPage((p) => ({ ...p, total: 0 }));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const focus = pendingFocusRun.current;
        const data = await fetchRunsPage(
          cuadrilla,
          page.offset,
          page.limit,
          focus ? { focusRunId: focus } : undefined,
        );
        if (focus) pendingFocusRun.current = null;
        if (cancelled) return;
        if (data.error) {
          setPageError(data.error);
          setLoading(false);
          return;
        }
        setRuns(data.runs);
        setPage((p) => ({ ...p, total: data.total, offset: data.offset }));
        setPageError(null);
        setRunId((current) => {
          if (current && data.runs.some((r) => r.runId === current)) return current;
          const next = data.runs[0]?.runId ?? "";
          if (next) syncUrl(cuadrilla, next);
          return next;
        });
      } catch (e) {
        if (!cancelled) setPageError(formatLoadError(lang, e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cuadrilla, page.offset, page.limit, syncUrl, lang]);

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
    estimateSize: () => 44,
    overscan: 10,
  });

  const selectRun = (r: string) => {
    setRunId(r);
    syncUrl(cuadrilla, r);
  };

  const onPickCuadrilla = (c: string) => {
    pendingFocusRun.current = null;
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
      .catch((e) => setDiffOut(formatLoadError(lang, e)));
  };

  const runCrossDiff = () => {
    void postDiffRuns({
      cuadrilla,
      leftRunId: diffRunLeft,
      rightRunId: diffRunRight,
      relPath: diffRunRel || "state.json",
    })
      .then(setDiffOut)
      .catch((e) => setDiffOut(formatLoadError(lang, e)));
  };

  const copySelectedPath = () => {
    if (!selectedRel) return;
    void navigator.clipboard.writeText(selectedRel).then(
      () => {
        setCopyHint(t(lang, "copiedPath"));
        window.setTimeout(() => setCopyHint(null), 1800);
      },
      () => setCopyHint(t(lang, "copyFailed")),
    );
  };

  const maxOffset = Math.max(0, page.total - page.limit);

  return (
    <div className="metrics-main">
      {summaryError && (
        <div role="alert" style={{ color: "var(--accent-red)", fontSize: "0.8125rem", marginBottom: 8 }}>
          {t(lang, "chartsNoSummary")}: {summaryError}
        </div>
      )}
      {pageError && (
        <div role="alert" style={{ color: "var(--accent-red)", fontSize: "0.8125rem", marginBottom: 8 }}>
          {t(lang, "error")}: {pageError}
        </div>
      )}

      {!summaryError ? (
        <MetricsCharts runs={chartRunsForCuadrilla} lang={lang} loading={summaryLoading} />
      ) : null}

      <div className="metrics-controls">
        <div className="metrics-field">
          <span id="metrics-cuadrilla-lbl">{t(lang, "cuadrilla")}</span>
          <div className="metrics-field-row">
            <select
              id="metrics-cuadrilla"
              aria-labelledby="metrics-cuadrilla-lbl"
              className="metrics-select"
              value={cuadrilla}
              onChange={(e) => onPickCuadrilla(e.target.value)}
            >
              {cuadrillas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="metrics-field">
          <span id="metrics-pagesize-lbl">{t(lang, "pageSize")}</span>
          <div className="metrics-field-row">
            <select
              id="metrics-pagesize"
              aria-labelledby="metrics-pagesize-lbl"
              className="metrics-select"
              value={page.limit}
              onChange={(e) =>
                setPage((p) => ({ ...p, limit: Number(e.target.value), offset: 0 }))
              }
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input
          className="metrics-input"
          placeholder={t(lang, "searchPlaceholder")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label={t(lang, "searchPlaceholder")}
        />
        <button type="button" className="metrics-btn" onClick={() => exportRunsCsv(filteredRuns, "nifillos-runs-page.csv")}>
          {t(lang, "exportCsvPage")}
        </button>
        <button
          type="button"
          className="metrics-btn"
          onClick={() => fetchRunsSummary().then((s) => exportRunsCsv(s.runs, "nifillos-runs-summary.csv"))}
        >
          {t(lang, "exportCsvAll")}
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }} aria-live="polite">
          {t(lang, "total")}: {page.total}
          {loading ? ` · ${t(lang, "loading")}` : ""}
        </span>
      </div>

      <div className="metrics-table-wrap">
        <table className="metrics-table">
          <caption>
            {lang === "es" ? "Runs de la cuadrilla seleccionada" : "Runs for the selected cuadrilla"}
          </caption>
          <thead>
            <tr style={{ background: "var(--bg-sidebar)", textAlign: "left" }}>
              <th scope="col" className="metrics-th">
                {t(lang, "run")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "status")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "steps")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "duration")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "tokens")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "inOutPct")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "cost")}
              </th>
              <th scope="col" className="metrics-th">
                {t(lang, "alertsCol")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRuns.map((r) => (
              <tr
                key={r.runId}
                tabIndex={0}
                className={
                  "metrics-tr-interactive" + (r.runId === runId ? " metrics-tr-selected" : "")
                }
                aria-label={runRowLabel(lang, r.runId)}
                onClick={() => selectRun(r.runId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectRun(r.runId);
                  }
                }}
              >
                <td className="metrics-td">{r.runId}</td>
                <td className="metrics-td">{r.status}</td>
                <td className="metrics-td">{r.steps ?? "—"}</td>
                <td className="metrics-td">{r.duration ?? "—"}</td>
                <td className="metrics-td metrics-tabular">
                  {r.totalTokens.toLocaleString()}{" "}
                  <span style={{ color: "var(--text-secondary)" }}>
                    ({r.tokensRegistered ? t(lang, "tokenReg") : t(lang, "tokenEst")})
                  </span>
                </td>
                <td className="metrics-td metrics-tabular">{r.inputPct}%</td>
                <td className="metrics-td metrics-tabular">€{r.costEurApprox.toFixed(4)}</td>
                <td className="metrics-td">
                  {r.alertCost ? (
                    <abbr title={t(lang, "alertCostHint")} className="alert-badge alert-badge--cost">
                      €
                    </abbr>
                  ) : null}
                  {r.alertTokens ? (
                    <abbr title={t(lang, "alertTokensHint")} className="alert-badge alert-badge--tokens">
                      T
                    </abbr>
                  ) : null}
                  {!r.alertCost && !r.alertTokens ? "—" : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRuns.length === 0 && !loading && (
          <div style={{ padding: 12, color: "var(--text-secondary)" }}>{t(lang, "noRuns")}</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          className="metrics-btn"
          disabled={page.offset <= 0}
          onClick={() => setPage((p) => ({ ...p, offset: Math.max(0, p.offset - p.limit) }))}
        >
          {t(lang, "prev")}
        </button>
        <button
          type="button"
          className="metrics-btn"
          disabled={page.offset >= maxOffset}
          onClick={() => setPage((p) => ({ ...p, offset: Math.min(maxOffset, p.offset + p.limit) }))}
        >
          {t(lang, "next")}
        </button>
        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          {t(lang, "runsPage")}: {page.offset + 1}–{Math.min(page.offset + page.limit, page.total)} / {page.total}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 12, minHeight: 360 }}>
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.8125rem" }}>{t(lang, "artifacts")}</h3>
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
                    className={"metrics-artifact-row" + (selectedRel === rel ? " metrics-tr-selected" : "")}
                    onClick={() => void openPreview(rel)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: vRow.size,
                      transform: `translateY(${vRow.start}px)`,
                      textAlign: "left",
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      fontFamily: "inherit",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      background: selectedRel === rel ? "var(--row-selected)" : "transparent",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, minHeight: 0 }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.8125rem", flexShrink: 0 }}>{t(lang, "preview")}</h3>
          {selectedRel ? (
            <div className="preview-path-bar" style={{ flexShrink: 0 }}>
              <span style={{ color: "var(--text-secondary)" }}>{t(lang, "previewPath")}:</span>
              <code style={{ flex: 1, minWidth: 0 }}>{selectedRel}</code>
              <button type="button" className="metrics-btn" onClick={copySelectedPath}>
                {t(lang, "copyPath")}
              </button>
              {copyHint ? (
                <span style={{ color: "var(--text-secondary)" }} aria-live="polite">
                  {copyHint}
                </span>
              ) : null}
            </div>
          ) : null}
          <div
            style={{
              flex: 1,
              minHeight: 200,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-primary)",
              overflow: "hidden",
            }}
          >
            {previewKind === "none" && (
              <div style={{ padding: 12, color: "var(--text-secondary)", flex: 1 }}>{t(lang, "noArtifact")}</div>
            )}
            {previewKind === "iframe" && selectedRel && (
              <div style={{ flex: 1, minHeight: 0, position: "relative", minWidth: 0 }}>
                <iframe
                  title={lang === "es" ? `Vista previa: ${selectedRel}` : `Preview: ${selectedRel}`}
                  src={previewUrl(cuadrilla, runId, selectedRel)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: 8,
                  }}
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            )}
            {previewKind === "img" && selectedRel && (
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
                }}
              >
                <img
                  src={previewUrl(cuadrilla, runId, selectedRel)}
                  alt={selectedRel.split("/").pop() ?? "preview"}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                />
              </div>
            )}
            {previewKind === "text" && (
              <pre
                style={{
                  flex: 1,
                  minHeight: 0,
                  margin: 0,
                  padding: 12,
                  fontSize: "0.75rem",
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
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                flexShrink: 0,
                position: "relative",
                zIndex: 2,
              }}
            >
              <a
                href={previewUrl(cuadrilla, runId, selectedRel)}
                target="_blank"
                rel="noreferrer"
                className="metrics-btn"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                {t(lang, "openTab")}
              </a>
              <a
                href={downloadUrl(cuadrilla, runId, selectedRel)}
                className="metrics-btn"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
              >
                {t(lang, "download")}
              </a>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.8125rem" }}>{t(lang, "diffIntra")}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input className="metrics-input" value={diffLeft} onChange={(e) => setDiffLeft(e.target.value)} placeholder={t(lang, "left")} aria-label={t(lang, "left")} />
            <input className="metrics-input" value={diffRight} onChange={(e) => setDiffRight(e.target.value)} placeholder={t(lang, "right")} aria-label={t(lang, "right")} />
            <button type="button" className="metrics-btn" onClick={runIntraDiff}>
              {t(lang, "applyDiff")}
            </button>
          </div>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.8125rem" }}>{t(lang, "diffRuns")}</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              className="metrics-input"
              value={diffRunLeft}
              onChange={(e) => setDiffRunLeft(e.target.value)}
              placeholder={t(lang, "diffRunA")}
              aria-label={t(lang, "diffRunA")}
            />
            <input
              className="metrics-input"
              value={diffRunRight}
              onChange={(e) => setDiffRunRight(e.target.value)}
              placeholder={t(lang, "diffRunB")}
              aria-label={t(lang, "diffRunB")}
            />
            <input className="metrics-input" value={diffRunRel} onChange={(e) => setDiffRunRel(e.target.value)} placeholder={t(lang, "relPath")} aria-label={t(lang, "relPath")} />
            <button type="button" className="metrics-btn" onClick={runCrossDiff}>
              {t(lang, "applyDiff")}
            </button>
          </div>
        </div>
      </div>

      <DiffView text={diffOut} lang={lang} />

      <div style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{t(lang, "auditTitle")}</span>
          <button type="button" className="metrics-btn" onClick={refreshAudit}>
            {t(lang, "refreshAudit")}
          </button>
        </div>
        <pre style={{ fontSize: "0.625rem", maxHeight: 140, overflow: "auto", margin: 0, whiteSpace: "pre-wrap" }} aria-live="polite">
          {auditLines.join("\n")}
        </pre>
      </div>
    </div>
  );
}
