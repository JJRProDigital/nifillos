import { readdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { t } from './i18n.js';
import { loadSavedLocale } from './init.js';
import { logEvent } from './logger.js';

function patchYamlRootSquadKey(content) {
  const noBom = content.replace(/^\uFEFF/, '');
  if (/^\s*squad:/m.test(noBom)) {
    return noBom.replace(/^\s*squad:/m, 'cuadrilla:');
  }
  return content;
}

function patchStateJsonSquadKey(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return { changed: false, raw };
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (Object.hasOwn(data, 'squad') && !Object.hasOwn(data, 'cuadrilla')) {
      data.cuadrilla = data.squad;
      delete data.squad;
      return { changed: true, raw: `${JSON.stringify(data, null, 2)}\n` };
    }
  }
  return { changed: false, raw };
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function walkStateJsonFiles(dir, acc = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walkStateJsonFiles(p, acc);
    else if (e.name === 'state.json') acc.push(p);
  }
  return acc;
}

/**
 * Migrates pre–cuadrilla layout: squads/, squad.yaml, squad-party.csv, state.json "squad".
 * Idempotent: safe to run multiple times.
 */
export async function migrateLegacyLayout(targetDir = process.cwd()) {
  const summary = {
    rootRenamed: false,
    filesRenamed: [],
    yamlPatched: [],
    statePatched: [],
    warnings: [],
  };

  const squadsDir = join(targetDir, 'squads');
  const cuadrillasDir = join(targetDir, 'cuadrillas');
  const hasSquads = await pathExists(squadsDir);
  const hasCuadrillas = await pathExists(cuadrillasDir);

  if (hasSquads && hasCuadrillas) {
    summary.warnings.push(t('migrateBothDirsWarn'));
    console.log(`  ${t('migrateBothDirsWarn')}`);
  } else if (hasSquads && !hasCuadrillas) {
    await rename(squadsDir, cuadrillasDir);
    summary.rootRenamed = true;
    console.log(`  ${t('migrateRenamedRoot')}`);
  }

  const workDir = (await pathExists(cuadrillasDir)) ? cuadrillasDir : null;
  if (!workDir) {
    return summary;
  }

  let cuadrillaNames;
  try {
    const entries = await readdir(workDir, { withFileTypes: true });
    cuadrillaNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch {
    cuadrillaNames = [];
  }

  for (const name of cuadrillaNames) {
    const base = join(workDir, name);
    const squadYaml = join(base, 'squad.yaml');
    const cuadrillaYaml = join(base, 'cuadrilla.yaml');
    const squadParty = join(base, 'squad-party.csv');
    const cuadrillaParty = join(base, 'cuadrilla-party.csv');

    if ((await pathExists(squadYaml)) && !(await pathExists(cuadrillaYaml))) {
      await rename(squadYaml, cuadrillaYaml);
      summary.filesRenamed.push(`${name}/squad.yaml → cuadrilla.yaml`);
      console.log(`  ${t('migrateRenamedFile', { path: `${name}/cuadrilla.yaml` })}`);
    } else if ((await pathExists(squadYaml)) && (await pathExists(cuadrillaYaml))) {
      const w = t('migrateConflictYaml', { name });
      summary.warnings.push(w);
      console.log(`  ${w}`);
    }

    if ((await pathExists(squadParty)) && !(await pathExists(cuadrillaParty))) {
      await rename(squadParty, cuadrillaParty);
      summary.filesRenamed.push(`${name}/squad-party.csv → cuadrilla-party.csv`);
      console.log(`  ${t('migrateRenamedFile', { path: `${name}/cuadrilla-party.csv` })}`);
    } else if ((await pathExists(squadParty)) && (await pathExists(cuadrillaParty))) {
      const w = t('migrateConflictParty', { name });
      summary.warnings.push(w);
      console.log(`  ${w}`);
    }

    const ymlPath = (await pathExists(cuadrillaYaml)) ? cuadrillaYaml : null;
    if (ymlPath) {
      const raw = await readFile(ymlPath, 'utf-8');
      const patched = patchYamlRootSquadKey(raw);
      if (patched !== raw) {
        await writeFile(ymlPath, patched, 'utf-8');
        summary.yamlPatched.push(`${name}/cuadrilla.yaml`);
        console.log(`  ${t('migratePatchedYaml', { path: `${name}/cuadrilla.yaml` })}`);
      }
    }
  }

  const statePaths = await walkStateJsonFiles(workDir);
  for (const p of statePaths) {
    const raw = await readFile(p, 'utf-8');
    const { changed, raw: next } = patchStateJsonSquadKey(raw);
    if (changed) {
      await writeFile(p, next, 'utf-8');
      const rel = relative(targetDir, p).replaceAll('\\', '/');
      summary.statePatched.push(rel);
      console.log(`  ${t('migratePatchedState', { path: rel })}`);
    }
  }

  const didAnything =
    summary.rootRenamed ||
    summary.filesRenamed.length > 0 ||
    summary.yamlPatched.length > 0 ||
    summary.statePatched.length > 0 ||
    summary.warnings.length > 0;

  if (didAnything && (await pathExists(join(targetDir, '_nifillos')))) {
    await logEvent(
      'migrate',
      {
        rootRenamed: summary.rootRenamed,
        filesRenamed: summary.filesRenamed.length,
        yamlPatched: summary.yamlPatched.length,
        statePatched: summary.statePatched.length,
        warnings: summary.warnings.length,
      },
      targetDir
    );
  }

  return summary;
}

/** CLI entry: migrate squads → cuadrillas without a full `update`. */
export async function runMigrateCli(targetDir = process.cwd()) {
  await loadSavedLocale(targetDir);
  const hasSquads = await pathExists(join(targetDir, 'squads'));
  const hasCuadrillas = await pathExists(join(targetDir, 'cuadrillas'));
  const hasNifillos = await pathExists(join(targetDir, '_nifillos'));

  if (!hasSquads && !hasCuadrillas) {
    console.log(`  ${t('migrateNoCuadrillasFolder')}`);
    if (!hasNifillos) console.log(`  ${t('migrateNeedInit')}`);
    return { success: hasNifillos };
  }

  console.log(t('migrateTitle'));
  const s = await migrateLegacyLayout(targetDir);
  const empty =
    !s.rootRenamed &&
    s.filesRenamed.length === 0 &&
    s.yamlPatched.length === 0 &&
    s.statePatched.length === 0 &&
    s.warnings.length === 0;
  if (empty) console.log(`  ${t('migrateNothing')}`);
  console.log('');
  return { success: true };
}
