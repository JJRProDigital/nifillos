#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { init } from '../src/init.js';
import { update } from '../src/update.js';
import { skillsCli } from '../src/skills-cli.js';
import { agentsCli } from '../src/agents-cli.js';
import { listRuns, printRuns } from '../src/runs.js';
import { runMigrateCli } from '../src/migrate-legacy-layout.js';

const { positionals } = parseArgs({
  allowPositionals: true,
  strict: false,
});

const command = positionals[0];

if (command === 'init') {
  await init(process.cwd());
} else if (command === 'install') {
  const result = await skillsCli('install', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'uninstall') {
  const result = await skillsCli('remove', positionals.slice(1), process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'update') {
  const target = positionals[1];
  if (target) {
    const result = await skillsCli('update-one', [target], process.cwd());
    if (!result.success) process.exitCode = 1;
  } else {
    const result = await update(process.cwd());
    if (!result.success) process.exitCode = 1;
  }
} else if (command === 'skills') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await skillsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'agents') {
  const subcommand = positionals[1];
  const args = positionals.slice(2);
  const result = await agentsCli(subcommand, args, process.cwd());
  if (!result.success) process.exitCode = 1;
} else if (command === 'runs') {
  const cuadrillaName = positionals[1] || null;
  const runs = await listRuns(cuadrillaName, process.cwd());
  printRuns(runs);
} else if (command === 'migrate') {
  const result = await runMigrateCli(process.cwd());
  if (!result.success) process.exitCode = 1;
} else {
  console.log(`
  nifillos — Multi-agent orchestration for your IDE

  Usage:
    npx nifillos init                    Initialize a project
    npx nifillos update                  Update framework files from the package
    npx nifillos migrate                 Rename squads/ → cuadrillas/ and fix legacy file keys
    npx nifillos install <id|path|git>   Install a skill (bundled id, local path, or git URL)
    npx nifillos uninstall <id>          Remove a skill
    npx nifillos update <id>             Refresh a skill from the bundle
    npx nifillos skills                  List installed skills
    npx nifillos agents                  List installed agents
    npx nifillos agents install <name>   Install a predefined agent
    npx nifillos agents remove <name>    Remove an agent
    npx nifillos agents update           Update all agents
    npx nifillos runs [cuadrilla-name]     View execution history

  `);
  if (command) process.exitCode = 1;
}
