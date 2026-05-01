import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { DASHBOARD_LIMITS } from './dashboardLimits.js';

const MAX_RUNS_CLI = 20;

const CUADRILLA_RUN_ID = /^[a-zA-Z0-9._-]+$/;

function safeCuadrillaName(name) {
  return typeof name === 'string' && CUADRILLA_RUN_ID.test(name) && !name.includes('..');
}

function safeRunId(id) {
  return typeof id === 'string' && CUADRILLA_RUN_ID.test(id) && !id.includes('..');
}

/** @returns {Promise<Record<string, unknown> | null>} */
async function tryReadJson(path) {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loadDashboardPricing(targetDir) {
  const pricingPath = join(targetDir, '_nifillos', 'dashboard-pricing.json');
  const raw = await tryReadJson(pricingPath);
  if (!raw || typeof raw !== 'object') {
    return {
      description: 'default',
      eurPerMillionInputTokens: 3,
      eurPerMillionOutputTokens: 15,
      tokensPerStepEstimate: 2500,
      estimateInputShare: 0.35,
      monthlyBudgetEur: null,
      alertCostEur: null,
      alertTotalTokens: null,
    };
  }
  const p = raw;
  return {
    description: typeof p.description === 'string' ? p.description : '',
    eurPerMillionInputTokens: Number(p.eurPerMillionInputTokens) || 0,
    eurPerMillionOutputTokens: Number(p.eurPerMillionOutputTokens) || 0,
    tokensPerStepEstimate: Number(p.tokensPerStepEstimate) || 2500,
    estimateInputShare: Math.min(1, Math.max(0, Number(p.estimateInputShare) || 0.35)),
    monthlyBudgetEur: p.monthlyBudgetEur == null ? null : Number(p.monthlyBudgetEur),
    alertCostEur: p.alertCostEur == null ? null : Number(p.alertCostEur),
    alertTotalTokens: p.alertTotalTokens == null ? null : Number(p.alertTotalTokens),
  };
}

function computeCostEur(inputTokens, outputTokens, pricing) {
  const inM = inputTokens / 1e6;
  const outM = outputTokens / 1e6;
  return inM * pricing.eurPerMillionInputTokens + outM * pricing.eurPerMillionOutputTokens;
}

/**
 * @param {object} state
 * @param {object | null} usage
 * @param {ReturnType<typeof loadDashboardPricing> extends Promise<infer R> ? R : never} pricing
 * @param {number} agentCount
 */
function tokenAndCostFromUsageOrEstimate(state, usage, pricing, agentCount) {
  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  let registered = false;
  /** @type {Record<string, unknown> | null} */
  let usageBreakdown = null;

  if (usage && typeof usage === 'object') {
    const u = usage;
    if (typeof u.inputTokens === 'number' || typeof u.outputTokens === 'number' || typeof u.totalTokens === 'number') {
      registered = true;
      inputTokens = Number(u.inputTokens) || 0;
      outputTokens = Number(u.outputTokens) || 0;
      totalTokens = Number(u.totalTokens) || inputTokens + outputTokens;
      if (!totalTokens) totalTokens = inputTokens + outputTokens;
      usageBreakdown = extractUsageBreakdown(u);
    }
  }

  if (!registered) {
    const stepTotal = state?.step && typeof state.step.total === 'number' ? state.step.total : 1;
    const steps = Math.max(1, stepTotal);
    const agents = Math.max(1, agentCount || 1);
    totalTokens = Math.round(steps * agents * pricing.tokensPerStepEstimate);
    inputTokens = Math.round(totalTokens * pricing.estimateInputShare);
    outputTokens = Math.max(0, totalTokens - inputTokens);
  }

  const costEurApprox = computeCostEur(inputTokens, outputTokens, pricing);
  const inputPct = totalTokens > 0 ? Math.round((inputTokens / totalTokens) * 1000) / 10 : 0;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    tokensRegistered: registered,
    costEurApprox,
    inputPct,
    usageBreakdown,
  };
}

function extractUsageBreakdown(u) {
  if (Array.isArray(u.byStep)) return { byStep: u.byStep };
  if (Array.isArray(u.steps)) return { steps: u.steps };
  if (Array.isArray(u.byAgent)) return { byAgent: u.byAgent };
  if (Array.isArray(u.agents)) return { agents: u.agents };
  return null;
}

/**
 * @param {string} cuadrilla
 * @param {string} runId
 * @param {string} targetDir
 * @param {Awaited<ReturnType<typeof loadDashboardPricing>>} pricing
 */
export async function buildRunSummary(cuadrilla, runId, targetDir, pricing) {
  const runDir = join(targetDir, 'cuadrillas', cuadrilla, 'output', runId);
  const statePath = join(runDir, 'state.json');
  const usagePath = join(runDir, 'usage.json');
  const manifestPath = join(runDir, 'manifest.json');

  const state = (await tryReadJson(statePath)) || {};
  const usage = await tryReadJson(usagePath);
  const manifest = await tryReadJson(manifestPath);

  const status = typeof state.status === 'string' ? state.status : 'unknown';
  let steps = null;
  if (state.step && typeof state.step === 'object') {
    const c = state.step.current;
    const t = state.step.total;
    if (typeof c === 'number' && typeof t === 'number') steps = `${c}/${t}`;
  }

  let duration = null;
  let durationMs = null;
  if (state.startedAt && (state.completedAt || state.failedAt)) {
    const start = new Date(state.startedAt).getTime();
    const end = new Date(state.completedAt || state.failedAt).getTime();
    durationMs = end - start;
    duration = formatDuration(durationMs);
  }

  const agentCount = Array.isArray(state.agents) ? state.agents.length : 0;
  const tc = tokenAndCostFromUsageOrEstimate(state, usage, pricing, agentCount);

  const alertCost = pricing.alertCostEur != null && tc.costEurApprox >= pricing.alertCostEur;
  const alertTokens =
    pricing.alertTotalTokens != null && tc.totalTokens >= pricing.alertTotalTokens;

  return {
    cuadrilla,
    runId,
    status,
    steps,
    duration,
    durationMs,
    startedAt: state.startedAt ?? null,
    completedAt: state.completedAt ?? state.failedAt ?? null,
    agentCount,
    hasUsageJson: usage != null && registeredTokens(usage),
    hasManifest: manifest != null,
    ...tc,
    alertCost,
    alertTokens,
  };
}

function registeredTokens(usage) {
  const u = usage;
  return typeof u === 'object' && u != null &&
    (typeof u.inputTokens === 'number' || typeof u.outputTokens === 'number' || typeof u.totalTokens === 'number');
}

export async function listAllRunIdsGrouped(targetDir) {
  const cuadrillasDir = join(targetDir, 'cuadrillas');
  /** @type {Record<string, { runIds: string[], totalRunsInOutput: number }>} */
  const map = {};
  try {
    const cDirs = await readdir(cuadrillasDir, { withFileTypes: true });
    for (const c of cDirs) {
      if (!c.isDirectory() || !safeCuadrillaName(c.name)) continue;
      const outDir = join(cuadrillasDir, c.name, 'output');
      let runIds = [];
      try {
        const entries = await readdir(outDir, { withFileTypes: true });
        runIds = entries.filter((e) => e.isDirectory() && safeRunId(e.name)).map((e) => e.name);
      } catch {
        runIds = [];
      }
      runIds.sort((a, b) => b.localeCompare(a));
      map[c.name] = { runIds, totalRunsInOutput: runIds.length };
    }
  } catch {
    return map;
  }
  return map;
}

/**
 * @param {string} targetDir
 * @param {object} [options]
 * @param {number} [options.maxPerCuadrilla]
 * @param {Partial<typeof DASHBOARD_LIMITS>} [options.limits]
 */
export async function listRunSummaries(targetDir, options = {}) {
  const limits = { ...DASHBOARD_LIMITS, ...options.limits };
  const maxPer = options.maxPerCuadrilla ?? limits.maxRunsPerCuadrillaDefault;
  const pricing = await loadDashboardPricing(targetDir);
  const grouped = await listAllRunIdsGrouped(targetDir);

  const byCuadrilla = [];
  const runs = [];

  for (const code of Object.keys(grouped).sort()) {
    const { runIds, totalRunsInOutput } = grouped[code];
    const slice = runIds.slice(0, maxPer);
    byCuadrilla.push({
      code,
      totalRunsInOutput,
      loadedRunCount: slice.length,
    });
    for (const runId of slice) {
      runs.push(await buildRunSummary(code, runId, targetDir, pricing));
    }
  }

  runs.sort((a, b) => {
    const ca = a.cuadrilla.localeCompare(b.cuadrilla);
    if (ca !== 0) return ca;
    return b.runId.localeCompare(a.runId);
  });

  return {
    runs,
    byCuadrilla,
    pricing,
    limits,
  };
}

/**
 * @param {string} targetDir
 * @param {string} cuadrilla
 * @param {number} offset
 * @param {number} limit
 * @param {{ focusRunId?: string }} [options] Si focusRunId está en la cuadrilla, calcula offset para que el run quede en la página.
 */
export async function listCuadrillaRunsPage(targetDir, cuadrilla, offset, limit, options = {}) {
  if (!safeCuadrillaName(cuadrilla)) {
    return { error: 'invalid_cuadrilla', total: 0, offset: 0, limit: 0, runs: [] };
  }
  const limits = { ...DASHBOARD_LIMITS };
  const pricing = await loadDashboardPricing(targetDir);
  const grouped = await listAllRunIdsGrouped(targetDir);
  const bucket = grouped[cuadrilla];
  if (!bucket) {
    return {
      total: 0,
      offset,
      limit,
      runs: [],
      pricingSummary: pricing,
      limits,
      totalRunsInOutput: 0,
    };
  }
  const { runIds, totalRunsInOutput } = bucket;
  const total = runIds.length;
  const safeLimit = Math.min(Math.max(1, limit), limits.maxRunsPerCuadrillaDefault);
  let safeOffset = Math.max(0, offset);

  const fr = options.focusRunId;
  if (typeof fr === 'string' && safeRunId(fr)) {
    const idx = runIds.indexOf(fr);
    if (idx >= 0) {
      safeOffset = Math.floor(idx / safeLimit) * safeLimit;
    }
  }

  const pageIds = runIds.slice(safeOffset, safeOffset + safeLimit);
  const runs = [];
  for (const runId of pageIds) {
    runs.push(await buildRunSummary(cuadrilla, runId, targetDir, pricing));
  }
  return {
    total,
    offset: safeOffset,
    limit: safeLimit,
    runs,
    pricingSummary: pricing,
    limits,
    totalRunsInOutput,
    loadedRunCount: runs.length,
  };
}

export function weakEtag(body) {
  const h = createHash('sha1').update(typeof body === 'string' ? body : JSON.stringify(body)).digest('base64');
  return `W/"${h}"`;
}

export async function listRuns(cuadrillaName, targetDir = process.cwd()) {
  const cuadrillasDir = join(targetDir, 'cuadrillas');
  let cuadrillaNames;

  try {
    if (cuadrillaName) {
      if (!safeCuadrillaName(cuadrillaName)) return [];
      cuadrillaNames = [cuadrillaName];
    } else {
      const entries = await readdir(cuadrillasDir, { withFileTypes: true });
      cuadrillaNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    }
  } catch {
    return [];
  }

  const runs = [];

  for (const name of cuadrillaNames) {
    const outputDir = join(cuadrillasDir, name, 'output');
    let runDirs;
    try {
      const entries = await readdir(outputDir, { withFileTypes: true });
      runDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      continue;
    }

    for (const runId of runDirs) {
      if (!safeRunId(runId)) continue;
      const run = { cuadrilla: name, runId, status: 'unknown', steps: null, duration: null };

      try {
        const raw = await readFile(join(outputDir, runId, 'state.json'), 'utf-8');
        const state = JSON.parse(raw);
        run.status = state.status || 'unknown';
        if (state.step) run.steps = `${state.step.current}/${state.step.total}`;
        if (state.startedAt && (state.completedAt || state.failedAt)) {
          const start = new Date(state.startedAt).getTime();
          const end = new Date(state.completedAt || state.failedAt).getTime();
          run.duration = formatDuration(end - start);
        }
      } catch {
        // No state.json or malformed — keep defaults
      }

      runs.push(run);
    }
  }

  runs.sort((a, b) => b.runId.localeCompare(a.runId));
  return runs.slice(0, MAX_RUNS_CLI);
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const seconds = Math.floor(ms / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function printRuns(runs) {
  if (runs.length === 0) {
    console.log('\n  No runs found.\n');
    return;
  }

  let currentCuadrilla = null;
  for (const run of runs) {
    if (run.cuadrilla !== currentCuadrilla) {
      currentCuadrilla = run.cuadrilla;
      console.log(`\n  ${currentCuadrilla}`);
      console.log('  ' + '─'.repeat(50));
    }
    const parts = [`    ${run.runId}`];
    parts.push(`[${run.status}]`);
    if (run.steps) parts.push(`${run.steps} steps`);
    if (run.duration) parts.push(run.duration);
    console.log(parts.join('  '));
  }
  console.log();
}
