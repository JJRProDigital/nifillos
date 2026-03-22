import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { migrateLegacyLayout } from '../src/migrate-legacy-layout.js';

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
