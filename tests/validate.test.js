import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateCuadrillaData, validateCuadrillaDir, validateCli, listCuadrillas } from '../src/validate.js';

const VALID_YAML = `cuadrilla:
  code: demo
  name: Demo
  description: >-
    A demo cuadrilla.
  icon: "📋"
  agents:
    - ana
  skills:
    - web_search
  data: []

pipeline:
  steps:
    - file: ./pipeline/steps/step-01.md
`;

async function makeCuadrilla(tempDir, name, yamlContent, { withParty = true, withAgent = true, withStep = true, withPipelineYaml = true } = {}) {
  const dir = join(tempDir, 'cuadrillas', name);
  await mkdir(join(dir, 'pipeline', 'steps'), { recursive: true });
  await mkdir(join(dir, 'agents'), { recursive: true });
  await writeFile(join(dir, 'cuadrilla.yaml'), yamlContent, 'utf-8');
  if (withStep) {
    await writeFile(join(dir, 'pipeline', 'steps', 'step-01.md'), '# Step 1', 'utf-8');
  }
  if (withPipelineYaml) {
    await writeFile(join(dir, 'pipeline', 'pipeline.yaml'), 'steps: []\n', 'utf-8');
  }
  if (withAgent) {
    await writeFile(join(dir, 'agents', 'ana.agent.md'), '# Ana', 'utf-8');
  }
  if (withParty) {
    await writeFile(
      join(dir, 'cuadrilla-party.csv'),
      'name,displayName,icon,path\nAna,Ana,🎯,./agents/ana.agent.md\n',
      'utf-8'
    );
  }
}

test('validateCuadrillaData accepts a valid definition', () => {
  const issues = validateCuadrillaData({
    cuadrilla: {
      code: 'demo',
      name: 'Demo',
      description: 'A demo',
      agents: ['ana'],
      skills: ['web_search'],
      data: [],
    },
    pipeline: { steps: [{ file: './pipeline/steps/step-01.md' }] },
  });
  assert.deepEqual(issues, []);
});

test('validateCuadrillaData reports precise paths', () => {
  const issues = validateCuadrillaData({
    cuadrilla: { code: 'Bad_Name', name: '', agents: [], max_review_cycles: -1 },
    pipeline: { steps: [{ file: 42 }, { nope: true }] },
  });
  const paths = issues.map((i) => i.path);
  assert.ok(paths.includes('cuadrilla.code'));
  assert.ok(paths.includes('cuadrilla.name'));
  assert.ok(paths.includes('cuadrilla.agents'));
  assert.ok(paths.includes('cuadrilla.max_review_cycles'));
  assert.ok(paths.includes('pipeline.steps[0].file'));
  assert.ok(paths.includes('pipeline.steps[1].file'));
});

test('validateCuadrillaData rejects root without cuadrilla key', () => {
  const issues = validateCuadrillaData({ something: {} });
  assert.equal(issues.length, 1);
  assert.equal(issues[0].path, 'cuadrilla');
});

test('validateCuadrillaData flags code/folder mismatch', () => {
  const issues = validateCuadrillaData(
    { cuadrilla: { code: 'otro', name: 'Demo', agents: ['ana'] } },
    { folderName: 'demo' }
  );
  assert.ok(issues.some((i) => i.path === 'cuadrilla.code' && i.message.includes('demo')));
});

test('validateCuadrillaDir cross-checks party, agent files and step files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    await makeCuadrilla(tempDir, 'demo', VALID_YAML, { withAgent: false, withStep: false });
    const { errors, warnings } = await validateCuadrillaDir(tempDir, 'demo');
    assert.ok(errors.some((e) => e.message.includes('agents/ana.agent.md')));
    assert.ok(errors.some((e) => e.message.includes('step-01.md')));
    // party row exists for ana, so no warning for it
    assert.ok(!warnings.some((w) => w.message.includes('ana')));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('validateCuadrillaDir warns when party csv lacks an agent row', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    await makeCuadrilla(tempDir, 'demo', VALID_YAML, { withParty: false });
    const { warnings } = await validateCuadrillaDir(tempDir, 'demo');
    assert.ok(warnings.some((w) => w.path === 'cuadrilla-party.csv'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('validateCuadrillaDir reports invalid YAML without throwing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    await makeCuadrilla(tempDir, 'demo', 'cuadrilla: [broken');
    const { errors } = await validateCuadrillaDir(tempDir, 'demo');
    assert.equal(errors.length, 1);
    assert.ok(errors[0].message.includes('invalid YAML'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('validateCli validates all cuadrillas and reports ok status', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    await makeCuadrilla(tempDir, 'demo', VALID_YAML);
    const result = await validateCli(tempDir, null);
    assert.equal(result.ok, true);
    assert.equal(result.checked, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('validateCli returns ok=false when a cuadrilla has errors', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    await makeCuadrilla(tempDir, 'demo', 'cuadrilla:\n  name: broken\n');
    const result = await validateCli(tempDir, null);
    assert.equal(result.ok, false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('listCuadrillas returns folder names and tolerates missing dir', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-validate-'));
  try {
    assert.deepEqual(await listCuadrillas(tempDir), []);
    await makeCuadrilla(tempDir, 'demo', VALID_YAML);
    assert.deepEqual(await listCuadrillas(tempDir), ['demo']);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
