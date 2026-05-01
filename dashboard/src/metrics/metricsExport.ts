import type { RunSummary } from "@/types/metrics";

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportRunsCsv(runs: RunSummary[], filename: string): void {
  const headers = [
    "cuadrilla",
    "runId",
    "status",
    "steps",
    "duration",
    "startedAt",
    "completedAt",
    "tokensRegistered",
    "inputTokens",
    "outputTokens",
    "totalTokens",
    "inputPct",
    "costEurApprox",
    "alertCost",
    "alertTokens",
  ];
  const lines = [headers.join(",")];
  for (const r of runs) {
    lines.push(
      [
        csvEscape(r.cuadrilla),
        csvEscape(r.runId),
        csvEscape(r.status),
        csvEscape(r.steps ?? ""),
        csvEscape(r.duration ?? ""),
        csvEscape(r.startedAt ?? ""),
        csvEscape(r.completedAt ?? ""),
        r.tokensRegistered ? "1" : "0",
        String(r.inputTokens),
        String(r.outputTokens),
        String(r.totalTokens),
        String(r.inputPct),
        String(r.costEurApprox),
        r.alertCost ? "1" : "0",
        r.alertTokens ? "1" : "0",
      ].join(","),
    );
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
