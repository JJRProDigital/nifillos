import { lazy, Suspense, useEffect, useState } from "react";
import { useCuadrillaSocket } from "@/hooks/useCuadrillaSocket";
import { CuadrillaSelector } from "@/components/CuadrillaSelector";
import { OfficeEmptyState } from "@/components/OfficeEmptyState";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";
import type { MetricsLang } from "@/metrics/metricsCopy";
import { t } from "@/metrics/metricsCopy";
import { readMetricsUrl, writeMetricsUrl } from "@/metrics/metricsUrlSync";
import type { TabId } from "@/types/state";

const MetricsView = lazy(() =>
  import("@/metrics/MetricsView").then((m) => ({ default: m.MetricsView })),
);

/** Ruta empaquetada vía `public/brand/logo.png` (Vite) */
const BRAND_LOGO_SRC = `${import.meta.env.BASE_URL}brand/logo.png`;

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

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {t(lang, "skipToContent")}
      </a>
      <header className="app-header">
        <a
          className="brand-lockup"
          href="https://obsessivesolutions.es/"
          target="_blank"
          rel="noopener noreferrer"
          title="Obsessive Solutions"
        >
          <img className="brand-logo" src={BRAND_LOGO_SRC} alt="Obsessive Solutions" width={72} height={34} decoding="async" />
          <div className="brand-text">
            <span className="brand-name">Nifillos</span>
            <span className="brand-tagline">Dashboard</span>
          </div>
        </a>
        <nav className="app-nav" role="tablist" aria-label={lang === "es" ? "Secciones del dashboard" : "Dashboard sections"}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "office"}
            aria-controls="main-content"
            id="tab-office"
            className={"app-nav-btn" + (tab === "office" ? " app-nav-btn-active" : "")}
            onClick={() => setTab("office")}
          >
            {t(lang, "office")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "metrics"}
            aria-controls="main-content"
            id="tab-metrics"
            className={"app-nav-btn" + (tab === "metrics" ? " app-nav-btn-active" : "")}
            onClick={() => setTab("metrics")}
          >
            {t(lang, "metrics")}
          </button>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="header-icon-btn"
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
            className="header-icon-btn"
            onClick={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
            title="Theme"
          >
            {theme === "dark" ? t(lang, "themeLight") : t(lang, "themeDark")}
          </button>
        </div>
      </header>

      <main id="main-content" className="app-main" tabIndex={-1} aria-labelledby={tab === "office" ? "tab-office" : "tab-metrics"}>
        <h1 className="sr-only">Nifillos Dashboard</h1>
        {tab === "office" ? (
          <div style={{ display: "flex", flex: 1, overflow: "hidden", minWidth: 0, minHeight: 0 }}>
            <CuadrillaSelector lang={lang} />
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                overflow: "auto",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              <OfficeEmptyState lang={lang} />
              <OfficeScene />
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="metrics-suspense-fallback" role="status" aria-live="polite">
                {t(lang, "loading")}
              </div>
            }
          >
            <MetricsView lang={lang} />
          </Suspense>
        )}
      </main>

      <StatusBar tab={tab} />
    </div>
  );
}
