import { cp, mkdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadLocale, t } from './i18n.js';
import { getTemplateEntries, loadSavedLocale, rewriteDashboardPathsAfterTemplateCopy } from './init.js';
import { listAvailable as listAvailableSkills, listInstalled as listInstalledSkills, installSkill, getSkillMeta } from './skills.js';
import { logEvent } from './logger.js';
import { migrateLegacyLayout } from './migrate-legacy-layout.js';

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function loadSavedIdes(targetDir) {
  try {
    const prefsPath = join(targetDir, '_nifillos', '_memory', 'preferences.md');
    const content = await readFile(prefsPath, 'utf-8');
    const match = content.match(/\*\*IDEs:\*\*\s*(.+)/);
    if (match) {
      return match[1].trim().split(/,\s*/);
    }
  } catch {
    // No preferences file
  }
  return ['claude-code'];
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const PROTECTED_PATHS = [
  '_nifillos/_memory',
  '_nifillos/_investigations',
  'agents',
  'cuadrillas',
];

function isProtected(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  return PROTECTED_PATHS.some(
    (p) => normalized === p || normalized.startsWith(p + '/')
  );
}

export async function update(targetDir) {
  console.log('\n  🔄 Nifillos — Update\n');

  // 1. Check initialized
  try {
    await stat(join(targetDir, '_nifillos'));
  } catch {
    await loadLocale('English');
    console.log(`  ${t('updateNotInitialized')}`);
    return { success: false };
  }

  // 2. Load user's locale
  await loadSavedLocale(targetDir);

  const hasLegacyDirs =
    (await pathExists(join(targetDir, 'squads'))) ||
    (await pathExists(join(targetDir, 'cuadrillas')));
  if (hasLegacyDirs) {
    console.log(`\n  ${t('migrateSection')}`);
    const migrated = await migrateLegacyLayout(targetDir);
    const empty =
      !migrated.rootRenamed &&
      migrated.filesRenamed.length === 0 &&
      migrated.yamlPatched.length === 0 &&
      migrated.statePatched.length === 0 &&
      migrated.warnings.length === 0;
    if (empty) console.log(`  ${t('migrateNothing')}`);
  }

  // 3. Read versions
  let currentVersion = null;
  try {
    currentVersion = (
      await readFile(join(targetDir, '_nifillos', '.nifillos-version'), 'utf-8')
    ).trim();
  } catch {
    // Legacy install — no version file
  }

  const newVersion = (
    await readFile(join(TEMPLATES_DIR, '_nifillos', '.nifillos-version'), 'utf-8')
  ).trim();

  // 4. Announce
  if (currentVersion) {
    console.log(
      `  ${t('updateStarting', { old: `v${currentVersion}`, new: `v${newVersion}` })}`
    );
  } else {
    console.log(`  ${t('updateStartingUnknown', { new: `v${newVersion}` })}`);
  }

  // 5. Copy common templates, skipping protected paths and ide-templates/
  const entries = await getTemplateEntries(TEMPLATES_DIR);
  let count = 0;

  for (const entry of entries) {
    const relativePath = relative(TEMPLATES_DIR, entry);
    if (isProtected(relativePath)) continue;
    // Skip ide-templates — handled separately below
    if (relativePath.replaceAll('\\', '/').startsWith('ide-templates/')) continue;

    const destPath = join(targetDir, relativePath);
    await mkdir(dirname(destPath), { recursive: true });
    await cp(entry, destPath);
    await rewriteDashboardPathsAfterTemplateCopy(
      destPath,
      relativePath.replaceAll('\\', '/'),
    );
    console.log(`  ${t('updatedFile', { path: relativePath.replaceAll('\\', '/') })}`);
    count++;
  }

  // 6. Copy IDE-specific templates based on saved preferences
  const ides = await loadSavedIdes(targetDir);
  for (const ide of ides) {
    const ideSrcDir = join(TEMPLATES_DIR, 'ide-templates', ide);
    let ideEntries;
    try {
      ideEntries = await getTemplateEntries(ideSrcDir);
    } catch {
      continue; // no template dir for this IDE
    }
    for (const entry of ideEntries) {
      const relPath = relative(ideSrcDir, entry);
      if (isProtected(relPath)) continue;

      const destPath = join(targetDir, relPath);
      await mkdir(dirname(destPath), { recursive: true });
      await cp(entry, destPath);
      console.log(`  ${t('updatedFile', { path: relPath.replaceAll('\\', '/') })}`);
      count++;
    }
  }

  // 7. Install new non-MCP, non-hybrid bundled skills not already present
  const availableSkills = await listAvailableSkills();
  const installedSkills = await listInstalledSkills(targetDir);
  for (const id of availableSkills) {
    if (id === 'nifillos-skill-creator') continue;
    if (installedSkills.includes(id)) continue;
    const meta = await getSkillMeta(id);
    if (!meta) continue;
    if (meta.type === 'mcp' || meta.type === 'hybrid') continue;
    await installSkill(id, targetDir);
    console.log(`  ${t('createdFile', { path: `skills/${id}/SKILL.md` })}`);
    count++;
  }

  // 8. Summary
  console.log(`\n  ${t('updateFileCount', { count })}`);
  console.log(`  ${t('updatePreserved')}`);
  console.log(`  ${t('updateSuccess', { version: `v${newVersion}` })}`);
  console.log(`\n  ${t('updateLatestHint')}`);
  console.log(`  ${t('updateDashboardNpmInstallHint')}\n`);

  await logEvent('update', { from: currentVersion || 'unknown', to: newVersion }, targetDir);

  return { success: true };
}
