import { useEffect, useState } from "react";
import { useCuadrillaSocket } from "@/hooks/useCuadrillaSocket";
import { CuadrillaSelector } from "@/components/CuadrillaSelector";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";
import { MetricsView } from "@/metrics/MetricsView";
import type { MetricsLang } from "@/metrics/metricsCopy";
import { t } from "@/metrics/metricsCopy";
import { readMetricsUrl, writeMetricsUrl } from "@/metrics/metricsUrlSync";
import type { TabId } from "@/types/state";

type Tab = TabId;

export function App() {
  useCuadrillaSocket();
  const [tab, setTab] = useState<Tab>("office");
  const [lang, setLang] = useState<MetricsLang>(() => readMetricsUrl().lang);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("nifillos-dashboard-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      const s = localStorage.getItem("nifillos-dashboard-theme");
      if (s === "light" || s === "dark") setTheme(s);
    } catch {
      /* ignore */
    }
  }, []);

  return (    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 44,
          minHeight: 44,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
          gap: 16,
        }}
      >
        <span style={{ flexShrink: 0 }}>Nifillos Dashboard</span>
        <nav style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            onClick={() => setTab("office")}
            style={tabBtn(tab === "office")}
          >
            {t(lang, "office")}
          </button>
          <button
            type="button"
            onClick={() => setTab("metrics")}
            style={tabBtn(tab === "metrics")}
          >
            {t(lang, "metrics")}
          </button>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            style={smallBtn}
            onClick={() => {
              const next = lang === "es" ? "en" : "es";
              setLang(next);
              writeMetricsUrl({ lang: next });
            }}
            title="Language"
          >
            {lang === "es" ? t(lang, "langEn") : t(lang, "langEs")}
          </button>
          <button
            type="button"
            style={smallBtn}
            onClick={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
            title="Theme"
          >
            {theme === "dark" ? t(lang, "themeLight") : t(lang, "themeDark")}
          </button>
        </div>
      </header>

      {tab === "office" ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden", minWidth: 0 }}>
          <CuadrillaSelector />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflow: "auto",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
            }}
          >
            <OfficeScene />
          </div>
        </div>
      ) : (
        <MetricsView lang={lang} />
      )}

      <StatusBar tab={tab} />
    </div>
  );
}

function tabBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? "rgba(0,212,255,0.15)" : "transparent",
    color: "var(--text-primary)",
    border: "1px solid " + (active ? "var(--accent-cyan)" : "transparent"),
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };
}

const smallBtn: React.CSSProperties = {
  background: "var(--bg-secondary)",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 11,
  cursor: "pointer",
};
