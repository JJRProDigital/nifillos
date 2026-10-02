import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { logEvent, readCliLogs, MAX_LOG_BYTES } from '../src/logger.js';

test('logEvent writes JSONL line to cli.log', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    const raw = await readFile(join(dir, '_nifillos', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.action, 'init');
    assert.ok(entry.timestamp);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent appends multiple entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const raw = await readFile(join(dir, '_nifillos', 'logs', 'cli.log'), 'utf-8');
    const lines = raw.trim().split('\n');
    assert.equal(lines.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent includes details', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('skill:install', { name: 'apify' }, dir);
    const raw = await readFile(join(dir, '_nifillos', 'logs', 'cli.log'), 'utf-8');
    const entry = JSON.parse(raw.trim());
    assert.equal(entry.details.name, 'apify');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent silently fails on invalid path', async () => {
  await logEvent('init', {}, '/nonexistent/path/that/does/not/exist');
});

test('readCliLogs returns entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs filters by action', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ action: 'init' }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs respects limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    await logEvent('init', {}, dir);
    const logs = await readCliLogs({ limit: 2 }, dir);
    assert.equal(logs.length, 2);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns newest first', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    await logEvent('init', {}, dir);
    await logEvent('update', {}, dir);
    const logs = await readCliLogs({}, dir);
    assert.equal(logs[0].action, 'update');
    assert.equal(logs[1].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs handles malformed lines gracefully', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    await mkdir(join(dir, '_nifillos', 'logs'), { recursive: true });
    await writeFile(
      join(dir, '_nifillos', 'logs', 'cli.log'),
      'not json\n{"action":"init","timestamp":"2026-01-01T00:00:00Z","details":{}}\n',
      'utf-8'
    );
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('readCliLogs returns empty array when no log file', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const logs = await readCliLogs({}, dir);
    assert.equal(logs.length, 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('logEvent rotates cli.log to cli.log.old past the size limit', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'osq-log-'));
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    const logDir = join(dir, '_nifillos', 'logs');
    await mkdir(logDir, { recursive: true });
    await writeFile(join(logDir, 'cli.log'), 'x'.repeat(MAX_LOG_BYTES + 1), 'utf-8');

    await logEvent('init', {}, dir);

    const rotated = await readFile(join(logDir, 'cli.log.old'), 'utf-8');
    assert.equal(rotated.length, MAX_LOG_BYTES + 1);
    const current = await readFile(join(logDir, 'cli.log'), 'utf-8');
    assert.equal(current.trim().split('\n').length, 1);
    assert.equal(JSON.parse(current).action, 'init');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
