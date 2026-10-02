import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fetchRemoteRegistry, resolveRegistryEntry, registryUrl } from '../src/registry.js';
import { skillsCli } from '../src/skills-cli.js';

function mockFetchBody(body, status = 200) {
  return mock.method(globalThis, 'fetch', async () => ({
    ok: status < 400,
    status,
    json: async () => body,
  }));
}

test('registryUrl honors NIFILLOS_SKILLS_REGISTRY', () => {
  const original = process.env.NIFILLOS_SKILLS_REGISTRY;
  try {
    process.env.NIFILLOS_SKILLS_REGISTRY = 'https://example.test/registry.json';
    assert.equal(registryUrl(), 'https://example.test/registry.json');
    delete process.env.NIFILLOS_SKILLS_REGISTRY;
    assert.ok(registryUrl().startsWith('https://raw.githubusercontent.com/'));
  } finally {
    if (original === undefined) delete process.env.NIFILLOS_SKILLS_REGISTRY;
    else process.env.NIFILLOS_SKILLS_REGISTRY = original;
  }
});

test('fetchRemoteRegistry validates entries and shape', async () => {
  const restore = mockFetchBody({
    version: 1,
    skills: [
      { id: 'alpha', description: 'First', url: 'https://github.com/u/alpha', ref: 'v1' },
      { id: 'beta', description: 'Second', url: 'https://github.com/u/beta' },
      { id: 'skipped-invalid' }, // no url — filtered out
    ],
  });
  try {
    const entries = await fetchRemoteRegistry();
    assert.equal(entries.length, 2);
    assert.equal(entries[0].ref, 'v1');
    assert.equal(entries[1].ref, null);
    assert.equal(resolveRegistryEntry(entries, 'beta').url, 'https://github.com/u/beta');
    assert.equal(resolveRegistryEntry(entries, 'nope'), null);
  } finally {
    restore.mock.restore();
  }
});

test('fetchRemoteRegistry throws on bad shape', async () => {
  const restore = mockFetchBody({ version: 1 });
  try {
    await assert.rejects(fetchRemoteRegistry(), /invalid registry shape/);
  } finally {
    restore.mock.restore();
  }
});

test('install falls back to the remote registry when id is not bundled', async () => {
  const targetDir = await mkdtemp(join(tmpdir(), 'nifillos-registry-'));
  const repoDir = await mkdtemp(join(tmpdir(), 'nifillos-reg-src-'));
  try {
    await mkdir(join(targetDir, '_nifillos'), { recursive: true });
    // Local git repo acting as the remote skill source
    execFileSync('git', ['init', '-b', 'main', repoDir]);
    await writeFile(
      join(repoDir, 'SKILL.md'),
      '---\nname: remote-demo\ndescription: from registry\n---\nBody\n',
      'utf-8'
    );
    execFileSync('git', ['-C', repoDir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '.']);
    execFileSync('git', [
      '-C', repoDir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-m', 'v1',
    ]);

    const repoUrl = pathToFileURL(repoDir).href;
    const restore = mockFetchBody({
      version: 1,
      skills: [{ id: 'remote-demo', description: 'from registry', url: repoUrl }],
    });

    try {
      const result = await skillsCli('install', ['remote-demo'], targetDir);
      assert.equal(result.success, true);
      const installed = await readFile(
        join(targetDir, 'skills', 'remote-demo', 'SKILL.md'),
        'utf-8'
      );
      assert.ok(installed.includes('from registry'));
    } finally {
      restore.mock.restore();
    }
  } finally {
    await rm(targetDir, { recursive: true, force: true });
    await rm(repoDir, { recursive: true, force: true });
  }
});
