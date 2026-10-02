import { cp, mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { dirname, join, resolve, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_SKILLS_DIR = join(__dirname, '..', 'skills');

const metaCache = new Map();

function metaCacheKey(id, targetDir) {
  return `${id}\0${targetDir ?? ''}`;
}

function parseSkillFrontmatter(raw, id) {
  const empty = { name: id, description: '', descriptions: {}, type: '', env: [] };
  const content = raw.replace(/\r\n/g, '\n');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return empty;

  let fm;
  try {
    fm = parseYaml(fmMatch[1]);
  } catch {
    return empty;
  }
  if (typeof fm !== 'object' || fm === null || Array.isArray(fm)) return empty;

  // Any `description_<locale>` key works — locales are data, not code.
  const descriptions = {};
  for (const [key, value] of Object.entries(fm)) {
    if (key.startsWith('description_') && key.length > 'description_'.length && typeof value === 'string') {
      descriptions[key.slice('description_'.length)] = value.trim();
    }
  }

  return {
    name: typeof fm.name === 'string' && fm.name.trim() ? fm.name.trim() : id,
    description: typeof fm.description === 'string' ? fm.description.trim() : '',
    descriptions,
    type: typeof fm.type === 'string' ? fm.type.trim() : '',
    env: Array.isArray(fm.env)
      ? fm.env.map((e) => String(e).trim()).filter(Boolean)
      : [],
  };
}

export async function listInstalled(targetDir) {
  try {
    const skillsDir = join(targetDir, 'skills');
    const entries = await readdir(skillsDir, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && e.name !== 'nifillos-skill-creator')
      .map((e) => e.name);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function listAvailable() {
  try {
    const entries = await readdir(BUNDLED_SKILLS_DIR, { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function getSkillMeta(id, targetDir = null) {
  const key = metaCacheKey(id, targetDir);
  if (metaCache.has(key)) return metaCache.get(key);

  let raw = null;
  try {
    raw = await readFile(join(BUNDLED_SKILLS_DIR, id, 'SKILL.md'), 'utf-8');
  } catch {
    // try user project
  }
  if (!raw && targetDir) {
    try {
      raw = await readFile(join(targetDir, 'skills', id, 'SKILL.md'), 'utf-8');
    } catch {
      // missing
    }
  }

  if (!raw) {
    metaCache.set(key, null);
    return null;
  }

  const result = parseSkillFrontmatter(raw, id);
  metaCache.set(key, result);
  return result;
}

function validateSkillId(id) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error(`Invalid skill id: '${id}'`);
  }
}

export async function installSkill(id, targetDir) {
  validateSkillId(id);
  const srcDir = join(BUNDLED_SKILLS_DIR, id);
  try {
    await stat(srcDir);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Skill '${id}' not found in registry`, { cause: err });
    throw err;
  }
  const destDir = join(targetDir, 'skills', id);
  const resolvedSrc = resolve(srcDir);
  const resolvedDest = resolve(destDir);
  if (resolvedSrc === resolvedDest || resolvedDest.startsWith(resolvedSrc + sep)) {
    return;
  }
  await cp(srcDir, destDir, { recursive: true });
  invalidateSkillMetaForId(id);
}

/**
 * Copy a skill from a local directory (must contain SKILL.md). Folder name becomes skill id.
 */
export async function installSkillFromPath(absSourceDir, targetDir) {
  const resolved = resolve(absSourceDir);
  const st = await stat(resolved);
  if (!st.isDirectory()) {
    throw new Error(`Skill path is not a directory: ${resolved}`);
  }
  await stat(join(resolved, 'SKILL.md'));
  const id = basename(resolved);
  validateSkillId(id);
  const destDir = join(targetDir, 'skills', id);
  await cp(resolved, destDir, { recursive: true });
  invalidateSkillMetaForId(id);
}

function findSkillRootInClone(cloneRoot) {
  const skillMd = join(cloneRoot, 'SKILL.md');
  return stat(skillMd).then(
    () => cloneRoot,
    async () => {
      const entries = await readdir(cloneRoot, { withFileTypes: true });
      const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      const withSkill = [];
      for (const d of dirs) {
        const p = join(cloneRoot, d, 'SKILL.md');
        try {
          await stat(p);
          withSkill.push(join(cloneRoot, d));
        } catch {
          /* skip */
        }
      }
      if (withSkill.length === 1) return withSkill[0];
      if (withSkill.length === 0) {
        throw new Error('No SKILL.md found at repository root or in a single subfolder');
      }
      throw new Error('Multiple skill folders found; clone a repo with one skill at root or one subdirectory');
    }
  );
}

/**
 * Shallow-clone a git URL and install the skill (SKILL.md at root or one subfolder).
 */
export async function installSkillFromGit(repoUrl, targetDir) {
  const tmpDir = await mkdtemp(join(tmpdir(), 'nifillos-git-'));
  try {
    execFileSync('git', ['clone', '--depth', '1', repoUrl, tmpDir], { stdio: 'inherit' });
    const skillRoot = await findSkillRootInClone(tmpDir);
    const id = basename(skillRoot);
    await installSkillFromPath(skillRoot, targetDir);
    return id;
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

function looksLikeGitRemote(s) {
  return (
    /^https?:\/\//.test(s) && (s.includes('github.com') || s.includes('.git') || s.includes('gitlab.com'))
  );
}

export { looksLikeGitRemote };

export async function removeSkill(id, targetDir) {
  validateSkillId(id);
  const skillDir = join(targetDir, 'skills', id);
  await rm(skillDir, { recursive: true, force: true });
  invalidateSkillMetaForId(id);
}

export function invalidateSkillMetaForId(id) {
  for (const k of [...metaCache.keys()]) {
    if (k.split('\0')[0] === id) metaCache.delete(k);
  }
}

export function clearMetaCache() {
  metaCache.clear();
}

export async function getSkillVersion(id, targetDir) {
  try {
    const skillPath = join(targetDir, 'skills', id, 'SKILL.md');
    const content = await readFile(skillPath, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return null;
    const versionMatch = fmMatch[1].match(/^version:\s*(.+)$/m);
    return versionMatch ? versionMatch[1].trim() : null;
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export function getLocalizedDescription(meta, localeCode) {
  if (localeCode && localeCode !== 'en' && meta.descriptions?.[localeCode]) {
    return meta.descriptions[localeCode];
  }
  return meta.description;
}
