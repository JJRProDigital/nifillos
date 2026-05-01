import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { migrateLegacyLayout } from '../src/migrate-legacy-layout.js';
import { loadLocale } from '../src/i18n.js';

test('migrateLegacyLayout renames squads/ to cuadrillas/', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const squads = join(dir, 'squads', 'demo');
  await mkdir(squads, { recursive: true });
  await writeFile(join(squads, 'note.txt'), 'x', 'utf-8');

  const s = await migrateLegacyLayout(dir);
  assert.equal(s.rootRenamed, true);
  const names = await readdir(dir);
  assert.ok(names.includes('cuadrillas'));
  assert.ok(!names.includes('squads'));
  assert.equal(await readFile(join(dir, 'cuadrillas', 'demo', 'note.txt'), 'utf-8'), 'x');
});

test('migrateLegacyLayout renames squad.yaml and patches root key', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'x');
  await mkdir(base, { recursive: true });
  await writeFile(join(base, 'squad.yaml'), 'squad:\n  name: x\n', 'utf-8');

  await migrateLegacyLayout(dir);
  const yml = await readFile(join(base, 'cuadrilla.yaml'), 'utf-8');
  assert.match(yml, /^cuadrilla:/m);
  assert.ok(!yml.includes('squad:'));
});

test('migrateLegacyLayout renames squad-party.csv', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'x');
  await mkdir(base, { recursive: true });
  await writeFile(join(base, 'squad-party.csv'), 'a,b\n', 'utf-8');

  await migrateLegacyLayout(dir);
  await readFile(join(base, 'cuadrilla-party.csv'), 'utf-8');
});

test('migrateLegacyLayout patches state.json squad → cuadrilla', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const out = join(dir, 'cuadrillas', 'x', 'output', '2026-01-01');
  await mkdir(out, { recursive: true });
  await writeFile(
    join(out, 'state.json'),
    JSON.stringify({ squad: 'x', status: 'done' }),
    'utf-8'
  );

  await migrateLegacyLayout(dir);
  const state = JSON.parse(await readFile(join(out, 'state.json'), 'utf-8'));
  assert.equal(state.cuadrilla, 'x');
  assert.ok(!Object.hasOwn(state, 'squad'));
  assert.equal(state.status, 'done');
});

test('migrateLegacyLayout is idempotent', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'x');
  await mkdir(base, { recursive: true });
  await writeFile(join(base, 'cuadrilla.yaml'), 'cuadrilla:\n  name: x\n', 'utf-8');

  const a = await migrateLegacyLayout(dir);
  const b = await migrateLegacyLayout(dir);
  assert.equal(a.filesRenamed.length, 0);
  assert.equal(b.filesRenamed.length, 0);
  assert.equal(a.yamlPatched.length, 0);
});

test('migrateLegacyLayout when squads/ and cuadrillas/ both exist: warns, keeps squads/, fixes cuadrillas/', async () => {
  await loadLocale('English');
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  await mkdir(join(dir, 'squads', 'orphan'), { recursive: true });
  await writeFile(join(dir, 'squads', 'orphan', 'keep.txt'), 's', 'utf-8');

  const cuBase = join(dir, 'cuadrillas', 'demo');
  await mkdir(cuBase, { recursive: true });
  await writeFile(join(cuBase, 'squad.yaml'), 'squad:\n  name: demo\n', 'utf-8');
  await writeFile(join(cuBase, 'squad-party.csv'), 'h\n', 'utf-8');

  const s = await migrateLegacyLayout(dir);
  assert.ok(s.warnings.some((w) => w.includes('squads/') && w.includes('cuadrillas/')));
  assert.equal(s.rootRenamed, false);

  const sqNames = await readdir(join(dir, 'squads'));
  assert.ok(sqNames.includes('orphan'));

  const yml = await readFile(join(cuBase, 'cuadrilla.yaml'), 'utf-8');
  assert.match(yml, /^cuadrilla:/m);
  await readFile(join(cuBase, 'cuadrilla-party.csv'), 'utf-8');
});

test('migrateLegacyLayout warns on squad.yaml + cuadrilla.yaml conflict', async () => {
  await loadLocale('English');
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'c');
  await mkdir(base, { recursive: true });
  await writeFile(join(base, 'squad.yaml'), 'squad:\n  x: 1\n', 'utf-8');
  await writeFile(join(base, 'cuadrilla.yaml'), 'cuadrilla:\n  x: 2\n', 'utf-8');

  const s = await migrateLegacyLayout(dir);
  assert.ok(s.warnings.some((w) => w.includes('c:') && w.includes('squad.yaml') && w.includes('cuadrilla.yaml')));
  const squad = await readFile(join(base, 'squad.yaml'), 'utf-8');
  assert.ok(squad.includes('squad:'));
});

test('migrateLegacyLayout warns on squad-party + cuadrilla-party conflict', async () => {
  await loadLocale('English');
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'c');
  await mkdir(base, { recursive: true });
  await writeFile(join(base, 'squad-party.csv'), 'a\n', 'utf-8');
  await writeFile(join(base, 'cuadrilla-party.csv'), 'b\n', 'utf-8');

  const s = await migrateLegacyLayout(dir);
  assert.ok(s.warnings.some((w) => w.includes('c:') && w.includes('squad-party') && w.includes('cuadrilla-party')));
});

test('migrateLegacyLayout patches state.json at cuadrilla root', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'x');
  await mkdir(base, { recursive: true });
  await writeFile(
    join(base, 'state.json'),
    JSON.stringify({ squad: 'x', step: { current: 1, total: 2 } }),
    'utf-8'
  );

  await migrateLegacyLayout(dir);
  const state = JSON.parse(await readFile(join(base, 'state.json'), 'utf-8'));
  assert.equal(state.cuadrilla, 'x');
  assert.ok(!Object.hasOwn(state, 'squad'));
  assert.equal(state.step.total, 2);
});

test('migrateLegacyLayout full squads tree: folder + yaml + party + state in output', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const demo = join(dir, 'squads', 'demo');
  const out = join(demo, 'output', '2026-01-01-run');
  await mkdir(out, { recursive: true });
  await writeFile(join(demo, 'squad.yaml'), 'squad:\n  name: demo\n', 'utf-8');
  await writeFile(join(demo, 'squad-party.csv'), 'path,displayName,icon\n', 'utf-8');
  await writeFile(join(out, 'state.json'), JSON.stringify({ squad: 'demo', status: 'idle' }), 'utf-8');

  const s = await migrateLegacyLayout(dir);
  assert.equal(s.rootRenamed, true);
  assert.equal(s.filesRenamed.length, 2);
  assert.ok(s.yamlPatched.length >= 1 || (await readFile(join(dir, 'cuadrillas', 'demo', 'cuadrilla.yaml'), 'utf-8')).includes('cuadrilla:'));

  const state = JSON.parse(await readFile(join(dir, 'cuadrillas', 'demo', 'output', '2026-01-01-run', 'state.json'), 'utf-8'));
  assert.equal(state.cuadrilla, 'demo');
  assert.equal(state.status, 'idle');
});

test('migrateLegacyLayout leaves state.json unchanged when cuadrilla key already set', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'nifillos-migrate-'));
  const base = join(dir, 'cuadrillas', 'x');
  await mkdir(base, { recursive: true });
  await writeFile(
    join(base, 'state.json'),
    JSON.stringify({ squad: 'ignored', cuadrilla: 'x', done: true }),
    'utf-8'
  );

  const s = await migrateLegacyLayout(dir);
  assert.equal(s.statePatched.length, 0);
  const state = JSON.parse(await readFile(join(base, 'state.json'), 'utf-8'));
  assert.equal(state.cuadrilla, 'x');
  assert.equal(state.squad, 'ignored');
  assert.equal(state.done, true);
});
