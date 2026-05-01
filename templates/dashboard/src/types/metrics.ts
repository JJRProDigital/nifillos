export type DashboardLimits = {
  maxRunsPerCuadrillaDefault: number;
  maxArtifacts: number;
  maxArtifactDepth: number;
  maxPreviewTextBytes: number;
  maxPreviewMarkdownBytes: number;
  maxPreviewBinaryBytes: number;
  maxDownloadBytes: number;
  maxDiffEachBytes: number;
  auditTailMaxLines: number;
};

export type PricingSummary = {
  description: string;
  eurPerMillionInputTokens: number;
  eurPerMillionOutputTokens: number;
  tokensPerStepEstimate: number;
  estimateInputShare: number;
  monthlyBudgetEur: number | null;
  alertCostEur: number | null;
  alertTotalTokens: number | null;
};

export type UsageBreakdown =
  | { byStep: unknown[] }
  | { steps: unknown[] }
  | { byAgent: unknown[] }
  | { agents: unknown[] }
  | null;

export type RunSummary = {
  cuadrilla: string;
  runId: string;
  status: string;
  steps: string | null;
  duration: string | null;
  durationMs: number | null;
  startedAt: string | null;
  completedAt: string | null;
  /** ISO timestamp for charts when startedAt/completedAt absent (server: output dir mtime). */
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
  usageBreakdown: UsageBreakdown;
  alertCost: boolean;
  alertTokens: boolean;
};

export type RunsListResponse = {
  runs: RunSummary[];
  byCuadrilla: { code: string; totalRunsInOutput: number; loadedRunCount: number }[];
  pricing: PricingSummary;
  limits: DashboardLimits;
};

export type RunsPageResponse = {
  total: number;
  offset: number;
  limit: number;
  runs: RunSummary[];
  pricingSummary: PricingSummary;
  limits: DashboardLimits;
  totalRunsInOutput: number;
  loadedRunCount?: number;
  error?: string;
};

export type ArtifactsResponse = {
  cuadrilla: string;
  runId: string;
  files: string[];
  truncated: boolean;
  manifest: unknown;
  runDirAbs: string;
  limits: DashboardLimits;
};

export type AuditResponse = {
  lines: string[];
  path: string;
};
