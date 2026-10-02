import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { loadSavedLocale } from './init.js';
import { t } from './i18n.js';

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Structural validation of parsed cuadrilla.yaml data.
 * @returns {Array<{path: string, message: string}>} issues (empty = valid)
 */
export function validateCuadrillaData(data, { folderName } = {}) {
  const issues = [];
  const isStr = (v) => typeof v === 'string' && v.trim() !== '';
  const isStrArray = (v) => Array.isArray(v) && v.every(isStr);

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    issues.push({ path: '', message: 'root must be a YAML mapping' });
    return issues;
  }
  if (!('cuadrilla' in data)) {
    issues.push({ path: 'cuadrilla', message: 'missing required "cuadrilla" key' });
    return issues;
  }
  const c = data.cuadrilla;
  if (typeof c !== 'object' || c === null || Array.isArray(c)) {
    issues.push({ path: 'cuadrilla', message: '"cuadrilla" must be a mapping' });
    return issues;
  }

  if (!isStr(c.code)) {
    issues.push({ path: 'cuadrilla.code', message: 'required string' });
  } else if (!ID_PATTERN.test(c.code)) {
    issues.push({ path: 'cuadrilla.code', message: `must match ${ID_PATTERN}` });
  } else if (folderName && c.code !== folderName) {
    issues.push({ path: 'cuadrilla.code', message: `does not match folder name "${folderName}"` });
  }

  if (!isStr(c.name)) issues.push({ path: 'cuadrilla.name', message: 'required string' });
  if ('description' in c && !isStr(c.description)) {
    issues.push({ path: 'cuadrilla.description', message: 'must be a string' });
  }
  if ('icon' in c && !isStr(c.icon)) {
    issues.push({ path: 'cuadrilla.icon', message: 'must be a string' });
  }
  if ('autonomy' in c && !isStr(c.autonomy)) {
    issues.push({ path: 'cuadrilla.autonomy', message: 'must be a string' });
  }
  if ('max_review_cycles' in c && (typeof c.max_review_cycles !== 'number' || c.max_review_cycles < 0)) {
    issues.push({ path: 'cuadrilla.max_review_cycles', message: 'must be a number >= 0' });
  }

  if (!('agents' in c)) {
    issues.push({ path: 'cuadrilla.agents', message: 'required: list of agent ids' });
  } else if (!isStrArray(c.agents) || c.agents.length === 0) {
    issues.push({ path: 'cuadrilla.agents', message: 'must be a non-empty list of strings' });
  }

  if ('skills' in c && !isStrArray(c.skills)) {
    issues.push({ path: 'cuadrilla.skills', message: 'must be a list of strings' });
  }
  if ('data' in c && !Array.isArray(c.data)) {
    issues.push({ path: 'cuadrilla.data', message: 'must be a list' });
  }

  if ('pipeline' in data) {
    const p = data.pipeline;
    if (typeof p !== 'object' || p === null || Array.isArray(p)) {
      issues.push({ path: 'pipeline', message: 'must be a mapping' });
    } else if ('steps' in p) {
      if (!Array.isArray(p.steps)) {
        issues.push({ path: 'pipeline.steps', message: 'must be a list' });
      } else {
        p.steps.forEach((s, i) => {
          if (typeof s !== 'object' || s === null || Array.isArray(s) || !isStr(s.file)) {
            issues.push({ path: `pipeline.steps[${i}].file`, message: 'required string' });
          }
        });
      }
    }
  }

  return issues;
}

/**
 * Full validation of cuadrillas/{name}/: schema + cross-checks against
 * cuadrilla-party.csv, agents/*.agent.md and pipeline step files.
 * @returns {Promise<{errors: Array<{path: string, message: string}>, warnings: Array<{path: string, message: string}>}>}
 */
export async function validateCuadrillaDir(targetDir, name) {
  const errors = [];
  const warnings = [];
  const cuadrillaDir = join(targetDir, 'cuadrillas', name);
  const yamlPath = join(cuadrillaDir, 'cuadrilla.yaml');

  let raw;
  try {
    raw = await readFile(yamlPath, 'utf-8');
  } catch {
    return { errors: [{ path: 'cuadrilla.yaml', message: 'file not found' }], warnings };
  }

  let data;
  try {
    data = parseYaml(raw);
  } catch (err) {
    return {
      errors: [{ path: 'cuadrilla.yaml', message: `invalid YAML: ${String(err.message).split('\n')[0]}` }],
      warnings,
    };
  }

  for (const issue of validateCuadrillaData(data, { folderName: name })) {
    errors.push(issue);
  }
  if (errors.length > 0) return { errors, warnings };

  const c = data.cuadrilla;

  // agents[] ids must exist as agent files and have a party row
  let partyRaw = null;
  try {
    partyRaw = await readFile(join(cuadrillaDir, 'cuadrilla-party.csv'), 'utf-8');
  } catch {
    warnings.push({ path: 'cuadrilla-party.csv', message: 'file not found' });
  }
  const partyPaths = new Set();
  if (partyRaw) {
    const lines = partyRaw.replace(/\r\n/g, '\n').trim().split('\n');
    const header = (lines[0] ?? '').split(',').map((h) => h.trim());
    const pathIdx = header.indexOf('path');
    for (const line of lines.slice(1)) {
      const cols = line.split(',');
      if (pathIdx >= 0 && cols[pathIdx]) partyPaths.add(cols[pathIdx].trim());
    }
  }
  for (const agentId of c.agents) {
    if (!(await pathExists(join(cuadrillaDir, 'agents', `${agentId}.agent.md`)))) {
      errors.push({ path: `cuadrilla.agents`, message: `agent file not found: agents/${agentId}.agent.md` });
    }
    if (partyRaw && !partyPaths.has(`./agents/${agentId}.agent.md`)) {
      warnings.push({
        path: 'cuadrilla.agents',
        message: `agent "${agentId}" has no row in cuadrilla-party.csv`,
      });
    }
  }

  // pipeline step files must exist; runner also expects pipeline/pipeline.yaml
  if (data.pipeline?.steps) {
    for (const [i, s] of data.pipeline.steps.entries()) {
      if (!(await pathExists(join(cuadrillaDir, s.file)))) {
        errors.push({ path: `pipeline.steps[${i}].file`, message: `step file not found: ${s.file}` });
      }
    }
    if (!(await pathExists(join(cuadrillaDir, 'pipeline', 'pipeline.yaml')))) {
      warnings.push({ path: 'pipeline', message: 'pipeline/pipeline.yaml not found (the runner reads it)' });
    }
  }

  return { errors, warnings };
}

async function pathExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/** List cuadrilla folder names under cuadrillas/ (empty array if missing). */
export async function listCuadrillas(targetDir) {
  try {
    const entries = await readdir(join(targetDir, 'cuadrillas'), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function validateCli(targetDir, onlyName) {
  await loadSavedLocale(targetDir);
  console.log(t('validateTitle'));

  const names = onlyName ? [onlyName] : await listCuadrillas(targetDir);
  if (names.length === 0 && !(await pathExists(join(targetDir, 'cuadrillas', onlyName ?? '')))) {
    console.log(`  ${t('validateNoCuadrillas')}\n`);
    return { ok: true, checked: 0 };
  }

  let okCount = 0;
  let invalidCount = 0;
  for (const name of names) {
    const { errors, warnings } = await validateCuadrillaDir(targetDir, name);
    if (errors.length === 0) {
      okCount++;
      console.log(`  ✓ ${name}`);
      for (const w of warnings) {
        console.log(`    ⚠ ${w.path}: ${w.message}`);
      }
    } else {
      invalidCount++;
      console.log(`  ✗ ${name}`);
      for (const e of errors) {
        console.log(`    ✗ ${e.path}: ${e.message}`);
      }
      for (const w of warnings) {
        console.log(`    ⚠ ${w.path}: ${w.message}`);
      }
    }
  }
  console.log(
    `\n  ${t('validateSummary', { count: names.length, ok: okCount, invalid: invalidCount })}\n`
  );
  return { ok: invalidCount === 0, checked: names.length };
}
