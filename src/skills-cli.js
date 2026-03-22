import { createInterface } from 'node:readline';
import { stat } from 'node:fs/promises';
import { basename as pathBasename, resolve } from 'node:path';
import {
  listInstalled,
  installSkill,
  installSkillFromPath,
  installSkillFromGit,
  looksLikeGitRemote,
  removeSkill,
  getSkillMeta,
  getLocalizedDescription,
} from './skills.js';
import { loadLocale, t, getLocaleCode } from './i18n.js';
import { loadSavedLocale } from './init.js';
import { logEvent } from './logger.js';

async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolveConfirm) => {
    rl.question(question, (answer) => {
      rl.close();
      resolveConfirm(answer.trim().toLowerCase());
    });
  });
}

export async function skillsCli(subcommand, args, targetDir) {
  try {
    await stat(resolve(targetDir, '_nifillos'));
  } catch {
    await loadLocale('English');
    console.log(`\n  ${t('skillsNotInitialized')}\n`);
    return { success: false };
  }

  await loadSavedLocale(targetDir);

  try {
    if (subcommand === 'list' || !subcommand) {
      await runList(targetDir);
    } else if (subcommand === 'install') {
      const installed = await runInstall(args[0], targetDir);
      if (installed === false) return { success: false };
    } else if (subcommand === 'remove') {
      const removed = await runRemove(args[0], targetDir);
      if (removed === false) return { success: false };
    } else if (subcommand === 'update') {
      await runUpdate(targetDir);
    } else if (subcommand === 'update-one') {
      await runUpdateOne(args[0], targetDir);
    } else {
      console.log(`\n  ${t('skillsUnknownCommand', { cmd: subcommand })}\n`);
      return { success: false };
    }
  } catch (err) {
    console.log(`\n  ${t('skillsError', { message: err.message })}\n`);
    return { success: false };
  }

  return { success: true };
}

async function runList(targetDir) {
  console.log(`\n  Nifillos skills\n`);

  const installed = await listInstalled(targetDir);

  if (installed.length > 0) {
    console.log(`  ${t('skillsInstalledHeader')}`);
    for (const id of installed) {
      const meta = await getSkillMeta(id, targetDir);
      if (meta) {
        const desc = getLocalizedDescription(meta, getLocaleCode());
        const parts = [meta.name];
        if (meta.type) parts.push(`(${meta.type})`);
        parts.push(`- ${desc.split('.')[0]}`);
        console.log(`    ${parts.join(' ')}`);
      } else {
        console.log(`    ${id}`);
      }
    }
  } else {
    console.log(`  ${t('skillsNoneInstalled')}`);
  }

  console.log(
    `\n  Bundled catalog: see the skills/ folder in the nifillos package (npm pack / GitHub).\n`
  );
}

async function runInstall(idOrPath, targetDir) {
  if (!idOrPath) {
    console.log('\n  Usage: nifillos install <id|path|git-url>\n');
    return false;
  }

  const fromCwd = resolve(process.cwd(), idOrPath);
  try {
    const st = await stat(fromCwd);
    if (st.isDirectory()) {
      const pathId = pathBasename(fromCwd);
      const installed = await listInstalled(targetDir);
      if (installed.includes(pathId)) {
        const answer = await confirm(`\n  ${t('skillsAlreadyInstalled', { id: pathId })}`);
        if (answer !== 'y' && answer !== 's') return false;
        console.log(`  ${t('skillsInstalling', { id: pathId })}`);
        await installSkillFromPath(fromCwd, targetDir);
        console.log(`  ${t('skillsReinstalled', { id: pathId })}\n`);
        await logEvent('skill:install', { name: pathId, reinstall: true, source: 'path' }, targetDir);
        return;
      }
      console.log(`\n  ${t('skillsInstalling', { id: pathId })}`);
      await installSkillFromPath(fromCwd, targetDir);
      console.log(`  ${t('skillsInstalled', { id: pathId })}\n`);
      await logEvent('skill:install', { name: pathId, source: 'path' }, targetDir);
      return;
    }
  } catch {
    /* not a directory */
  }

  if (looksLikeGitRemote(idOrPath)) {
    console.log(`\n  ${t('skillsInstalling', { id: idOrPath })}`);
    const id = await installSkillFromGit(idOrPath, targetDir);
    console.log(`  ${t('skillsInstalled', { id })}\n`);
    await logEvent('skill:install', { name: id, url: idOrPath, source: 'git' }, targetDir);
    return;
  }

  const installed = await listInstalled(targetDir);
  if (installed.includes(idOrPath)) {
    const answer = await confirm(`\n  ${t('skillsAlreadyInstalled', { id: idOrPath })}`);
    if (answer !== 'y' && answer !== 's') return false;
    console.log(`  ${t('skillsInstalling', { id: idOrPath })}`);
    await installSkill(idOrPath, targetDir);
    console.log(`  ${t('skillsReinstalled', { id: idOrPath })}\n`);
    await logEvent('skill:install', { name: idOrPath, reinstall: true }, targetDir);
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id: idOrPath })}`);
  await installSkill(idOrPath, targetDir);
  console.log(`  ${t('skillsInstalled', { id: idOrPath })}\n`);
  await logEvent('skill:install', { name: idOrPath }, targetDir);
}

async function runRemove(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: nifillos uninstall <id>\n');
    return false;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsRemoving', { id })}`);
  await removeSkill(id, targetDir);
  await logEvent('skill:remove', { name: id }, targetDir);
  console.log(`  ${t('skillsRemoved', { id })}\n`);
}

async function runUpdate(targetDir) {
  const installed = await listInstalled(targetDir);
  if (installed.length === 0) {
    console.log(`\n  ${t('skillsUpdateNone')}\n`);
    return;
  }

  console.log(`\n  ${t('skillsUpdating')}`);
  for (const id of installed) {
    console.log(`  ${t('skillsInstalling', { id })}`);
    await installSkill(id, targetDir);
    console.log(`  ${t('skillsInstalled', { id })}`);
  }
  await logEvent('skill:update', { count: installed.length }, targetDir);
  console.log(`\n  ${t('skillsUpdateDone', { count: installed.length })}\n`);
}

async function runUpdateOne(id, targetDir) {
  if (!id) {
    console.log('\n  Usage: nifillos update <name>\n');
    return;
  }

  const installed = await listInstalled(targetDir);
  if (!installed.includes(id)) {
    console.log(`\n  ${t('skillsNotInstalled', { id })}\n`);
    return;
  }

  console.log(`\n  ${t('skillsInstalling', { id })}`);
  await installSkill(id, targetDir);
  await logEvent('skill:update', { name: id }, targetDir);
  console.log(`  ${t('skillsInstalled', { id })}\n`);
}
