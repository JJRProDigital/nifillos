import type {
  ArtifactsResponse,
  AuditResponse,
  RunsListResponse,
  RunsPageResponse,
  DashboardLimits,
} from "@/types/metrics";

export class MetricsApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "MetricsApiError";
    this.status = status;
    this.path = path;
  }
}

function networkMessage(err: unknown): string {
  if (err instanceof TypeError && /fetch|network|failed/i.test(String(err.message))) {
    return "network";
  }
  return "unknown";
}

async function apiFetch<T>(path: string): Promise<T> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) {
      throw new MetricsApiError(`${res.status} ${path}`, res.status, path);
    }
    return res.json() as Promise<T>;
  } catch (e) {
    if (e instanceof MetricsApiError) throw e;
    throw new MetricsApiError(networkMessage(e), 0, path);
  }
}

export async function fetchRunsSummary(): Promise<RunsListResponse> {
  return apiFetch<RunsListResponse>("/__cuadrillas_api/runs");
}

export async function fetchRunsPage(
  cuadrilla: string,
  offset: number,
  limit: number,
  options?: { focusRunId?: string },
): Promise<RunsPageResponse> {
  const q = new URLSearchParams({ cuadrilla, offset: String(offset), limit: String(limit) });
  if (options?.focusRunId) q.set("focusRunId", options.focusRunId);
  return apiFetch<RunsPageResponse>(`/__cuadrillas_api/runs-page?${q}`);
}

export async function fetchArtifacts(cuadrilla: string, runId: string): Promise<ArtifactsResponse> {
  const q = new URLSearchParams({ cuadrilla, runId });
  return apiFetch<ArtifactsResponse>(`/__cuadrillas_api/artifacts?${q}`);
}

export async function fetchLimits(): Promise<DashboardLimits> {
  return apiFetch<DashboardLimits>("/__cuadrillas_api/limits");
}

export async function fetchAudit(lines: number): Promise<AuditResponse> {
  const q = new URLSearchParams({ lines: String(lines) });
  return apiFetch<AuditResponse>(`/__cuadrillas_api/audit?${q}`);
}

export function previewUrl(cuadrilla: string, runId: string, relPath: string): string {
  const q = new URLSearchParams({ cuadrilla, runId, relPath });
  return `/__cuadrillas_api/preview?${q}`;
}

export function downloadUrl(cuadrilla: string, runId: string, relPath: string): string {
  const q = new URLSearchParams({ cuadrilla, runId, relPath });
  return `/__cuadrillas_api/download?${q}`;
}

export async function postDiff(body: {
  cuadrilla: string;
  runId: string;
  left: string;
  right: string;
}): Promise<string> {
  try {
    const res = await fetch("/__cuadrillas_api/diff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new MetricsApiError(String(res.status), res.status, "/diff");
    return res.text();
  } catch (e) {
    if (e instanceof MetricsApiError) throw e;
    throw new MetricsApiError(networkMessage(e), 0, "/diff");
  }
}

export async function postDiffRuns(body: {
  cuadrilla: string;
  leftRunId: string;
  rightRunId: string;
  relPath?: string;
}): Promise<string> {
  try {
    const res = await fetch("/__cuadrillas_api/diff-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) throw new MetricsApiError(String(res.status), res.status, "/diff-runs");
    return res.text();
  } catch (e) {
    if (e instanceof MetricsApiError) throw e;
    throw new MetricsApiError(networkMessage(e), 0, "/diff-runs");
  }
}
