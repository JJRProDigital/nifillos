import type { DASHBOARD_LIMITS } from "./dashboardLimits.js";

export type RunSummaryRow = {
  cuadrilla: string;
  runId: string;
  status: string;
  steps: string | null;
  duration: string | null;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  /** ISO timestamp for trend charts when state dates are missing (run folder mtime). */
  metricsChartAt: string | null;
  agentCount: number;
  hasUsageJson: boolean;
  hasManifest: boolean;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  tokensRegistered: boolean;
  costEurApprox: number;
  inputPct: number;
  usageBreakdown: unknown;
  alertCost: boolean;
  alertTokens: boolean;
};

export type DashboardPricing = {
  description: string;
  eurPerMillionInputTokens: number;
  eurPerMillionOutputTokens: number;
  tokensPerStepEstimate: number;
  estimateInputShare: number;
  monthlyBudgetEur: number | null;
  alertCostEur: number | null;
  alertTotalTokens: number | null;
};

export function loadDashboardPricing(targetDir: string): Promise<DashboardPricing>;

export function buildRunSummary(
  cuadrilla: string,
  runId: string,
  targetDir: string,
  pricing: DashboardPricing,
): Promise<RunSummaryRow>;

export function listAllRunIdsGrouped(
  targetDir: string,
): Promise<Record<string, { runIds: string[]; totalRunsInOutput: number }>>;

export function listRunSummaries(
  targetDir: string,
  options?: {
    maxPerCuadrilla?: number;
    limits?: Partial<typeof DASHBOARD_LIMITS>;
  },
): Promise<{
  runs: RunSummaryRow[];
  byCuadrilla: { code: string; totalRunsInOutput: number; loadedRunCount: number }[];
  pricing: DashboardPricing;
  limits: typeof DASHBOARD_LIMITS;
}>;

export function listCuadrillaRunsPage(
  targetDir: string,
  cuadrilla: string,
  offset: number,
  limit: number,
  options?: { focusRunId?: string },
): Promise<
  | { error: string; total: number; offset: number; limit: number; runs: never[] }
  | {
      total: number;
      offset: number;
      limit: number;
      runs: RunSummaryRow[];
      pricingSummary: DashboardPricing;
      limits: typeof DASHBOARD_LIMITS;
      totalRunsInOutput: number;
      loadedRunCount: number;
    }
>;

export function weakEtag(body: unknown): string;

export function listRuns(
  cuadrillaName: string | null,
  targetDir?: string,
): Promise<
  {
    cuadrilla: string;
    runId: string;
    status: string;
    steps: string | null;
    duration: string | null;
  }[]
>;

export function formatDuration(ms: number): string;

export function printRuns(
  runs: {
    cuadrilla: string;
    runId: string;
    status: string;
    steps: string | null;
    duration: string | null;
  }[],
): void;
