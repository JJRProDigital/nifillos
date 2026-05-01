/**
 * Limits for dashboard metrics API, artifact walk, previews, diffs, audit tail.
 * Imported by dashboard server and root src/runs.js.
 */
export const DASHBOARD_LIMITS = {
  maxRunsPerCuadrillaDefault: 100,
  maxArtifacts: 2000,
  maxArtifactDepth: 12,
  maxPreviewTextBytes: 512 * 1024,
  maxPreviewMarkdownBytes: 2 * 1024 * 1024,
  maxPreviewBinaryBytes: 20 * 1024 * 1024,
  maxDownloadBytes: 50 * 1024 * 1024,
  maxDiffEachBytes: 2 * 1024 * 1024,
  auditTailMaxLines: 500,
};
