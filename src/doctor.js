import { readFile, readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTemplateEntries, loadSavedLocale } from './init.js';
import { t } from './i18n.js';
import { listInstalled } from './skills.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const IDE_TOOLS = ['antigravity', 'claude-code', 'codex', 'cursor', 'opencode', 'vscode-copilot'];

/** Where Playwright stores downloaded browsers, per platform. */
function playwrightBrowsersDir() {
  if (process.platform === 'win32') {
    return process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, 'ms-playwright') : null;
  }
  if (process.platform === 'darwin') {
    return join(homedir(), 'Library', 'Caches', 'ms-playwright');
  }
  return join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), 'ms-playwright');
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Diagnose a Nifillos project: version alignment, IDE files, company profile,
 * skills, Playwright browsers and dashboard state. Read-only — never mutates.
 * @returns {Promise<{ok: boolean, checks: Array<{id: string, status: 'ok'|'warn'|'fail', detail: string}>}>}
 */
export async function doctor(targetDir) {
  await loadSavedLocale(targetDir);
  const checks = [];
  const add = (id, status, detail) => checks.push({ id, status, detail });

  const nifillosDir = join(targetDir, '_nifillos');
  const initialized = await pathExists(nifillosDir);
  if (!initialized) {
    add('init', 'fail', t('doctorNotInitialized'));
    return { ok: false, checks };
  }
  add('init', 'ok', t('doctorInitialized'));

  // CLI version vs installed framework version
  const pkg = JSON.parse(await readFile(join(__dirname, '..', 'package.json'), 'utf-8'));
  let installedVersion = null;
  try {
    installedVersion = (await readFile(join(nifillosDir, '.nifillos-version'), 'utf-8')).trim();
  } catch {
    // never stamped
  }
  if (!installedVersion) {
    add('version', 'warn', t('doctorNoVersionFile'));
  } else if (installedVersion === pkg.version) {
    add('version', 'ok', t('doctorVersionOk', { version: pkg.version }));
  } else {
    add('version', 'warn', t('doctorVersionMismatch', { cli: pkg.version, installed: installedVersion }));
  }

  // IDE files actually present vs templates for the saved IDEs
  let prefsContent = null;
  try {
    prefsContent = await readFile(join(nifillosDir, '_memory', 'preferences.md'), 'utf-8');
  } catch {
    // no preferences
  }
  const ideMatch = prefsContent?.match(/\*\*IDEs:\*\*\s*(.+)/);
  const ides = ideMatch
    ? ideMatch[1].trim().split(/,\s*/).filter((i) => IDE_TOOLS.includes(i))
    : [];
  if (!ideMatch || ides.length === 0) {
    add('ides', 'warn', t('doctorNoIdes'));
  } else {
    const missing = [];
    for (const ide of ides) {
      const ideSrcDir = join(TEMPLATES_DIR, 'ide-templates', ide);
      let entries;
      try {
        entries = await getTemplateEntries(ideSrcDir);
      } catch {
        continue; // no template dir for this IDE
      }
      for (const entry of entries) {
        const rel = entry.slice(ideSrcDir.length + 1);
        if (!(await pathExists(join(targetDir, rel)))) {
          missing.push(rel.replaceAll('\\', '/'));
        }
      }
    }
    if (missing.length > 0) {
      add('ides', 'fail', t('doctorIdeFilesMissing', { files: missing.slice(0, 3).join(', ') }));
    } else {
      add('ides', 'ok', t('doctorIdesOk', { ides: ides.join(', ') }));
    }
  }

  // Company profile
  let company = null;
  try {
    company = await readFile(join(nifillosDir, '_memory', 'company.md'), 'utf-8');
  } catch {
    // missing
  }
  if (company == null) {
    add('company', 'fail', t('doctorCompanyMissing'));
  } else if (company.trim() === '' || company.includes('<!-- NOT CONFIGURED -->')) {
    add('company', 'warn', t('doctorCompanyEmpty'));
  } else {
    add('company', 'ok', t('doctorCompanyOk'));
  }

  // Skills
  const installedSkills = await listInstalled(targetDir);
  add('skills', 'ok', t('doctorSkillsCount', { count: installedSkills.length }));

  // Playwright chromium browser
  const pwDir = playwrightBrowsersDir();
  let chromiumFound = false;
  if (pwDir) {
    try {
      chromiumFound = (await readdir(pwDir)).some((e) => e.startsWith('chromium'));
    } catch {
      // no browsers dir
    }
  }
  add(
    'playwright',
    chromiumFound ? 'ok' : 'warn',
    chromiumFound ? t('doctorPlaywrightOk') : t('doctorPlaywrightMissing')
  );

  // Dashboard
  if (await pathExists(join(targetDir, 'dashboard', 'node_modules'))) {
    if (await pathExists(join(targetDir, 'dashboard', 'dist'))) {
      add('dashboard', 'ok', t('doctorDashboardOk'));
    } else {
      add('dashboard', 'warn', t('doctorDashboardNotBuilt'));
    }
  } else {
    add('dashboard', 'warn', t('doctorDashboardNoDeps'));
  }

  return { ok: checks.every((c) => c.status !== 'fail'), checks };
}

const ICONS = { ok: '✓', warn: '⚠', fail: '✗' };

export async function doctorCli(targetDir) {
  await loadSavedLocale(targetDir);
  console.log(t('doctorTitle'));
  const { ok, checks } = await doctor(targetDir);
  for (const c of checks) {
    console.log(`  ${ICONS[c.status]} ${c.detail}`);
  }
  const okCount = checks.filter((c) => c.status === 'ok').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  console.log(
    `\n  ${t('doctorSummary', { ok: okCount, warn: warnCount, fail: failCount })}\n`
  );
  return { ok };
}
