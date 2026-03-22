/**
 * One-off migration: squad/squads → cuadrilla/cuadrillas (paths, filenames, protocol).
 * Run from repo root: node scripts/rename-squad-to-cuadrilla.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'dist', 'build']);

const EXT = /\.(md|yaml|yml|js|mjs|ts|tsx|json|mdc|gitignore)$/i;

function walk(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (EXT.test(e.name) && !e.name.endsWith('.tsbuildinfo')) out.push(p);
  }
  return out;
}

const REPLACEMENTS = [
  ['    squad: core', '    bundle: core'],
  ['      squad: "{code}"', '      cuadrilla: "{code}"'],
  ['list-squads', 'list-cuadrillas'],
  ['create-squad', 'create-cuadrilla'],
  ['edit-squad', 'edit-cuadrilla'],
  ['delete-squad', 'delete-cuadrilla'],
  ['SQUAD_INACTIVE', 'CUADRILLA_INACTIVE'],
  ['SQUAD_UPDATE', 'CUADRILLA_UPDATE'],
  ['SQUAD_ACTIVE', 'CUADRILLA_ACTIVE'],
  ['__squads_ws', '__cuadrillas_ws'],
  ['squad-watcher', 'cuadrilla-watcher'],
  ['squad-party.csv', 'cuadrilla-party.csv'],
  ['squad-party', 'cuadrilla-party'],
  ['squad.yaml', 'cuadrilla.yaml'],
  ['squads/', 'cuadrillas/'],
  ['`squads`', '`cuadrillas`'],
  ['"squad":', '"cuadrilla":'],
  ['squad: my-squad', 'cuadrilla: my-squad'],
  ['squad: name', 'cuadrilla: name'],
  ['squad: \'my-squad\'', 'cuadrilla: \'my-squad\''],
  ['runs [squad-name]', 'runs [cuadrilla-name]'],
  ['{squad name}', '{cuadrilla name}'],
  ['{squad}', '{cuadrilla}'],
  ['squads/{squad}', 'cuadrillas/{cuadrilla}'],
  ['squads/<name>', 'cuadrillas/<name>'],
  ['squad\'s', 'cuadrilla\'s'],
];

function applyProseEnglish(content) {
  let s = content;
  // Word-ish replacements for remaining English prose (after paths fixed)
  const prose = [
    [/\bMy squads\b/g, 'My crews'],
    [/\bmy squads\b/g, 'my crews'],
    [/\ball squads\b/g, 'all crews'],
    [/\bAll squads\b/g, 'All crews'],
    [/\bno squads\b/g, 'no crews'],
    [/\bNo squads\b/g, 'No crews'],
    [/\bmultiple squads\b/g, 'multiple crews'],
    [/\bMulti-agent squads\b/g, 'Multi-agent crews'],
    [/\bAI squads\b/g, 'AI crews'],
    [/\bai squads\b/g, 'AI crews'],
    [/\bAI agent squads\b/g, 'AI agent crews'],
    [/\brun AI squads\b/g, 'run AI crews'],
    [/\bfor your squads\b/g, 'for your crews'],
    [/\bfor AI squads\b/g, 'for AI crews'],
    [/\bexisting squad\b/g, 'existing crew'],
    [/\bexisting squads\b/g, 'existing crews'],
    [/\bnew squad\b/g, 'new crew'],
    [/\bnew squads\b/g, 'new crews'],
    [/\bCreate a new squad\b/g, 'Create a new crew'],
    [/\bCreate squad\b/g, 'Create crew'],
    [/\bRun an existing squad\b/g, 'Run an existing crew'],
    [/\bRun squad\b/g, 'Run crew'],
    [/\bdelete squad\b/g, 'delete crew'],
    [/\bDelete squad\b/g, 'Delete crew'],
    [/\bthe squad\b/g, 'the crew'],
    [/\bThe squad\b/g, 'The crew'],
    [/\bthis squad\b/g, 'this crew'],
    [/\bThis squad\b/g, 'This crew'],
    [/\byour squad\b/g, 'your crew'],
    [/\bYour squad\b/g, 'Your crew'],
    [/\ba squad\b/g, 'a crew'],
    [/\bA squad\b/g, 'A crew'],
    [/\bany squad\b/g, 'any crew'],
    [/\beach squad\b/g, 'each crew'],
    [/\bEvery squad\b/g, 'Every crew'],
    [/\bevery squad\b/g, 'every crew'],
    [/\bother squads\b/g, 'other crews'],
    [/\bcontent squads\b/g, 'content crews'],
    [/\bContent squads\b/g, 'Content crews'],
    [/\bnon-content squads\b/g, 'non-content crews'],
    [/\bdata squads\b/g, 'data crews'],
    [/\bnews-based squads\b/g, 'news-based crews'],
    [/\bmulti-platform squads\b/g, 'multi-platform crews'],
    [/\bcommunication squads\b/g, 'communication crews'],
    [/\bautomation squads\b/g, 'automation crews'],
    [/\bResearch\/data squads\b/g, 'Research/data crews'],
    [/\bsquad complete\b/g, 'crew complete'],
    [/\bSquad complete\b/g, 'Crew complete'],
    [/\bsquad design\b/g, 'crew design'],
    [/\bSquad definition\b/g, 'Crew definition'],
    [/\bsquad directory\b/g, 'crew directory'],
    [/\bsquad files\b/g, 'crew files'],
    [/\bsquad memory\b/g, 'crew memory'],
    [/\bsquad\'s\b/g, "crew's"],
    [/\bSquad Architecture\b/g, 'Crew Architecture'],
    [/\bsquad configurations\b/g, 'crew configurations'],
    [/\bhalf-built\b/g, 'half-built'], // keep
    [/\bList all squads\b/g, 'List all crews'],
    [/\bList all your squads\b/g, 'List all your crews'],
    [/\bmanage, and run AI agent squads\b/g, 'manage, and run AI agent crews'],
    [/\bmanage squads\b/g, 'manage crews'],
    [/\bEdit Squad\b/g, 'Edit Crew'],
    [/\bCreate Squad\b/g, 'Create Crew'],
    [/\bExecute squad\b/g, 'Execute crew'],
    [/\bExecute a squad\b/g, 'Execute a crew'],
    [/\bbuilding the squad\b/g, 'building the crew'],
    [/\bthe squad\'s\b/g, "the crew's"],
    [/\bdesigning the squad\b/g, 'designing the crew'],
    [/\bbenefit this squad\b/g, 'benefit this crew'],
    [/\benhance your squad\b/g, 'enhance your crew'],
    [/\bcontent creation squad\b/g, 'content creation crew'],
    [/\bresearch these knowledge areas to build the best squad\b/g,
      'research these knowledge areas to build the best crew'],
    [/\bArchitect designs the squad\b/g, 'Architect designs the crew'],
    [/\bNatural language about squads\b/g, 'Natural language about crews'],
    [/\bSquad\b/g, 'Crew'],
    [/\bsquads\b/g, 'crews'],
    [/\bsquad\b/g, 'crew'],
  ];
  for (const [re, rep] of prose) {
    s = s.replace(re, rep);
  }
  return s;
}

const files = walk(ROOT);
let changed = 0;
for (const file of files) {
  if (file.includes(`${path.sep}scripts${path.sep}rename-squad-to-cuadrilla.mjs`)) continue;
  let c = fs.readFileSync(file, 'utf8');
  const orig = c;
  for (const [a, b] of REPLACEMENTS) {
    c = c.split(a).join(b);
  }
  // English prose only in selected roots (avoid breaking Spanish "cuadrilla" later — Spanish files use cuadrilla already)
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (
    rel.endsWith('.md') ||
    rel.endsWith('.yaml') ||
    rel.endsWith('.yml') ||
    rel.endsWith('.mdc') ||
    rel.endsWith('prompt.md') ||
    rel.endsWith('.ts') ||
    rel.endsWith('.tsx') ||
    rel.endsWith('.js') ||
    rel.endsWith('.json')
  ) {
    if (!rel.startsWith('src/readme/') && !rel.startsWith('src/locales/es.json')) {
      c = applyProseEnglish(c);
    }
  }
  if (c !== orig) {
    fs.writeFileSync(file, c, 'utf8');
    changed++;
    console.log(rel);
  }
}

console.log(`\nUpdated ${changed} files.`);
