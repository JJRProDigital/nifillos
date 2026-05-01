import type { MetricsLang } from "./metricsCopy";

const Q = {
  cuadrilla: "mc",
  run: "mr",
  lang: "lang",
} as const;

export function readMetricsUrl(): {
  cuadrilla: string;
  run: string;
  lang: MetricsLang;
} {
  const u = new URL(window.location.href);
  const l = u.searchParams.get(Q.lang);
  return {
    cuadrilla: u.searchParams.get(Q.cuadrilla) || "",
    run: u.searchParams.get(Q.run) || "",
    lang: l === "en" ? "en" : "es",
  };
}

export function writeMetricsUrl(patch: Partial<{ cuadrilla: string; run: string; lang: MetricsLang }>): void {
  const u = new URL(window.location.href);
  if (patch.cuadrilla !== undefined) {
    if (patch.cuadrilla) u.searchParams.set(Q.cuadrilla, patch.cuadrilla);
    else u.searchParams.delete(Q.cuadrilla);
  }
  if (patch.run !== undefined) {
    if (patch.run) u.searchParams.set(Q.run, patch.run);
    else u.searchParams.delete(Q.run);
  }
  if (patch.lang !== undefined) u.searchParams.set(Q.lang, patch.lang);
  window.history.replaceState({}, "", u);
}
