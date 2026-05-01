import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { listRunSummaries, listCuadrillaRunsPage } from '../src/runs.js';
import { DASHBOARD_LIMITS } from '../src/dashboardLimits.js';

test('listRunSummaries builds rows with pricing limits', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nif-summ-'));
  try {
    await mkdir(join(dir, '_nifillos', 'logs'), { recursive: true });
    await writeFile(
      join(dir, '_nifillos', 'dashboard-pricing.json'),
      JSON.stringify({
        description: 't',
        eurPerMillionInputTokens: 3,
        eurPerMillionOutputTokens: 15,
        tokensPerStepEstimate: 1000,
        estimateInputShare: 0.4,
        monthlyBudgetEur: null,
      }),
      'utf-8',
    );
    const runDir = join(dir, 'cuadrillas', 'c1', 'output', 'run-a');
    await mkdir(runDir, { recursive: true });
    await writeFile(
      join(runDir, 'state.json'),
      JSON.stringify({
        cuadrilla: 'c1',
        status: 'completed',
        step: { current: 2, total: 2 },
        agents: [{ id: 'a' }, { id: 'b' }],
        startedAt: '2026-04-01T10:00:00Z',
        completedAt: '2026-04-01T10:05:00Z',
      }),
      'utf-8',
    );

    const out = await listRunSummaries(dir, { limits: DASHBOARD_LIMITS });
    assert.equal(out.runs.length, 1);
    assert.equal(out.runs[0].cuadrilla, 'c1');
    assert.equal(out.runs[0].runId, 'run-a');
    assert.equal(out.runs[0].tokensRegistered, false);
    assert.ok(out.runs[0].totalTokens > 0);
    assert.equal(out.byCuadrilla[0].code, 'c1');
    assert.equal(out.byCuadrilla[0].totalRunsInOutput, 1);
    assert.equal(out.limits.maxArtifacts, DASHBOARD_LIMITS.maxArtifacts);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listCuadrillaRunsPage paginates by runId desc', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nif-page-'));
  try {
    for (const id of ['2026-04-01-run', '2026-04-02-run']) {
      const runDir = join(dir, 'cuadrillas', 'cx', 'output', id);
      await mkdir(runDir, { recursive: true });
      await writeFile(
        join(runDir, 'state.json'),
        JSON.stringify({
          status: 'completed',
          step: { current: 1, total: 1 },
          agents: [],
          startedAt: '2026-04-01T10:00:00Z',
          completedAt: '2026-04-01T10:01:00Z',
        }),
        'utf-8',
      );
    }
    const p1 = await listCuadrillaRunsPage(dir, 'cx', 0, 1);
    assert.equal(p1.error, undefined);
    assert.equal(p1.total, 2);
    assert.equal(p1.runs.length, 1);
    assert.equal(p1.runs[0].runId, '2026-04-02-run');
    const p2 = await listCuadrillaRunsPage(dir, 'cx', 1, 1);
    assert.equal(p2.runs[0].runId, '2026-04-01-run');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listCuadrillaRunsPage focusRunId aligns offset to page containing run', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nif-focus-'));
  try {
    for (const id of ['2026-04-01-run', '2026-04-02-run', '2026-04-03-run']) {
      const runDir = join(dir, 'cuadrillas', 'cx', 'output', id);
      await mkdir(runDir, { recursive: true });
      await writeFile(
        join(runDir, 'state.json'),
        JSON.stringify({
          status: 'completed',
          step: { current: 1, total: 1 },
          agents: [],
          startedAt: '2026-04-01T10:00:00Z',
          completedAt: '2026-04-01T10:01:00Z',
        }),
        'utf-8',
      );
    }
    const p = await listCuadrillaRunsPage(dir, 'cx', 0, 1, { focusRunId: '2026-04-01-run' });
    assert.equal(p.error, undefined);
    assert.equal(p.offset, 2);
    assert.equal(p.runs.length, 1);
    assert.equal(p.runs[0].runId, '2026-04-01-run');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('listCuadrillaRunsPage returns error for invalid cuadrilla id', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nif-inv-'));
  try {
    const out = await listCuadrillaRunsPage(dir, '../x', 0, 10);
    assert.equal(out.error, 'invalid_cuadrilla');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
