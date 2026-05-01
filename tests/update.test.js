import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';
import { update } from '../src/update.js';

test('update returns failure when not initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    const result = await update(tempDir);
    assert.equal(result.success, false);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update overwrites system files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(join(tempDir, 'CLAUDE.md'), 'garbage content', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(tempDir, 'CLAUDE.md'), 'utf-8');
    assert.ok(content.includes('Nifillos'));
    assert.ok(!content.includes('garbage content'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update rewrites dashboard metricsApiHandler imports to user repo depth', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-update-dashpaths-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    const handlerPath = join(tempDir, 'dashboard', 'src', 'server', 'metricsApiHandler.ts');
    await writeFile(
      handlerPath,
      'import { x } from "../../../../src/runs.js";\n',
      'utf-8',
    );

    await update(tempDir);

    const content = await readFile(handlerPath, 'utf-8');
    assert.ok(content.includes('../../../src/runs.js'), 'handler must import project-root src');
    assert.ok(!content.includes('../../../../src/runs.js'), 'template-only depth must not remain');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _memory contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_nifillos', '_memory', 'company.md'),
      'My Company Info',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_nifillos', '_memory', 'company.md'),
      'utf-8'
    );
    assert.equal(content, 'My Company Info');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves _investigations contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await writeFile(
      join(tempDir, '_nifillos', '_investigations', 'profile-analysis.md'),
      'investigation data',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, '_nifillos', '_investigations', 'profile-analysis.md'),
      'utf-8'
    );
    assert.equal(content, 'investigation data');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves cuadrillas contents', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await mkdir(join(tempDir, 'cuadrillas', 'mi-cuadrilla'), { recursive: true });
    await writeFile(
      join(tempDir, 'cuadrillas', 'mi-cuadrilla', 'custom.md'),
      'contenido usuario',
      'utf-8'
    );

    await update(tempDir);

    const content = await readFile(
      join(tempDir, 'cuadrillas', 'mi-cuadrilla', 'custom.md'),
      'utf-8'
    );
    assert.equal(content, 'contenido usuario');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update writes new version to .nifillos-version', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });

    await update(tempDir);

    const version = await readFile(
      join(tempDir, '_nifillos', '.nifillos-version'),
      'utf-8'
    );
    assert.ok(version.trim().length > 0);
    assert.match(version.trim(), /^\d+\.\d+\.\d+$/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update succeeds without existing .nifillos-version (legacy install)', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    await rm(join(tempDir, '_nifillos', '.nifillos-version'), { force: true });

    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update returns success when initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));

  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update succeeds when no bundled agents exist', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    const result = await update(tempDir);
    assert.equal(result.success, true);
    // No bundled agents — agents/ dir should not exist
    await assert.rejects(
      stat(join(tempDir, 'agents')),
      { code: 'ENOENT' }
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update preserves user-created agent files', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // User manually created an agent
    const agentsDir = join(tempDir, 'agents');
    await mkdir(agentsDir, { recursive: true });
    await writeFile(join(agentsDir, 'custom.agent.md'), 'my agent', 'utf-8');

    await update(tempDir);

    const content = await readFile(join(agentsDir, 'custom.agent.md'), 'utf-8');
    assert.equal(content, 'my agent');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update auto-imports bundled skills with env requirements', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-test-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    // image-generator is the canonical non-MCP skill with env requirements (env: [OPENROUTER_API_KEY])
    // Simulate a user who installed Nifillos before this skill was bundled
    await rm(join(tempDir, 'skills', 'image-generator'), { recursive: true, force: true });

    await update(tempDir);

    // image-generator has `env: [OPENROUTER_API_KEY]` and should be re-installed by update
    const skillMd = join(tempDir, 'skills', 'image-generator', 'SKILL.md');
    const content = await readFile(skillMd, 'utf-8');
    assert.ok(content.includes('OPENROUTER_API_KEY'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('update runs migrate squads → cuadrillas when only squads/ exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-upd-migrate-'));
  try {
    await init(tempDir, { _skipPrompts: true });
    await rm(join(tempDir, 'cuadrillas'), { recursive: true, force: true });

    const demo = join(tempDir, 'squads', 'legacy');
    await mkdir(join(demo, 'output', 'run1'), { recursive: true });
    await writeFile(join(demo, 'squad.yaml'), 'squad:\n  name: legacy\n', 'utf-8');
    await writeFile(join(demo, 'squad-party.csv'), 'path,displayName,icon\n', 'utf-8');
    await writeFile(
      join(demo, 'output', 'run1', 'state.json'),
      JSON.stringify({ squad: 'legacy', status: 'completed' }),
      'utf-8'
    );

    const result = await update(tempDir);
    assert.equal(result.success, true);

    const yml = await readFile(join(tempDir, 'cuadrillas', 'legacy', 'cuadrilla.yaml'), 'utf-8');
    assert.match(yml, /^cuadrilla:/m);

    const state = JSON.parse(
      await readFile(join(tempDir, 'cuadrillas', 'legacy', 'output', 'run1', 'state.json'), 'utf-8')
    );
    assert.equal(state.cuadrilla, 'legacy');
    assert.equal(state.status, 'completed');
    assert.ok(!Object.hasOwn(state, 'squad'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
