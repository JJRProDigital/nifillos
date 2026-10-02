import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { init } from '../src/init.js';
import { doctor } from '../src/doctor.js';

test('doctor fails cleanly when not initialized', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    const result = await doctor(tempDir);
    assert.equal(result.ok, false);
    assert.equal(result.checks[0].id, 'init');
    assert.equal(result.checks[0].status, 'fail');
    assert.equal(result.checks.length, 1);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('doctor reports healthy project after init', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });
    // Configure company profile so the check is a clear pass
    await writeFile(
      join(tempDir, '_nifillos', '_memory', 'company.md'),
      '# My Company\n\nWe do things.',
      'utf-8'
    );

    const result = await doctor(tempDir);
    assert.equal(result.ok, true);

    const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
    assert.equal(byId.version.status, 'ok');
    assert.equal(byId.ides.status, 'ok');
    assert.ok(byId.ides.detail.includes('opencode'));
    assert.equal(byId.company.status, 'ok');
    // Playwright depends on the machine: must exist as a check and never fail
    assert.ok(['ok', 'warn'].includes(byId.playwright.status));
    assert.ok(['ok', 'warn'].includes(byId.dashboard.status));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('doctor fails when a saved-IDE file is missing', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });
    const { rm: rmFile } = await import('node:fs/promises');
    await rmFile(join(tempDir, '.opencode', 'command', 'nifillos.md'));

    const result = await doctor(tempDir);
    assert.equal(result.ok, false);
    const ides = result.checks.find((c) => c.id === 'ides');
    assert.equal(ides.status, 'fail');
    assert.ok(ides.detail.includes('nifillos.md'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('doctor warns on version mismatch', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });
    await writeFile(join(tempDir, '_nifillos', '.nifillos-version'), '0.0.1\n', 'utf-8');

    const result = await doctor(tempDir);
    const version = result.checks.find((c) => c.id === 'version');
    assert.equal(version.status, 'warn');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('doctor warns on missing IDE list in preferences', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    await init(tempDir, { _skipPrompts: true, _ides: ['opencode'] });
    const prefsPath = join(tempDir, '_nifillos', '_memory', 'preferences.md');
    const prefs = await readFile(prefsPath, 'utf-8');
    await writeFile(prefsPath, prefs.replace(/\*\*IDEs:\*\*.+\n/, ''), 'utf-8');

    const result = await doctor(tempDir);
    const ides = result.checks.find((c) => c.id === 'ides');
    assert.equal(ides.status, 'warn');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('doctor init check still passes with minimal _nifillos dir (mkdir only)', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'nifillos-doctor-'));
  try {
    await mkdir(join(tempDir, '_nifillos'), { recursive: true });
    const result = await doctor(tempDir);
    assert.equal(result.checks[0].id, 'init');
    assert.equal(result.checks[0].status, 'ok');
    // Everything else must degrade to warn, never crash
    assert.ok(result.checks.length > 3);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
