# Fix Init Distribution — Design Document

> Fix Nifillos distribution: sync stale templates, make init install agents + skills automatically.

## Problem

When users run `npx Nifillos init`, they receive:
- **Missing:** `_nifillos/core/formats/` (14 format files) — never synced to templates
- **Stale:** `_nifillos/core/platforms/` (deprecated, deleted from source but still in templates)
- **Outdated:** `architect.agent.yaml`, `runner.pipeline.md`, `sherlock.prompt.md` — template copies behind source
- **Missing:** No agents installed (agents are only available via separate `npx Nifillos agents install`)
- **Missing:** No bundled skills installed (only MCP skills are offered during init)

## Root Cause

1. The formats system was added to `_nifillos/core/` but the templates directory was never synced
2. The deprecated `platforms/` was deleted from source but not from templates
3. `src/init.js` only copies from `templates/` — it never calls `installAgent()` or `installSkill()`

## Solution

### Part 1: Template Sync (immediate fix)

Sync all stale/missing files between `_nifillos/core/` and `templates/_nifillos/core/`:

| Source | Template | Action |
|--------|----------|--------|
| `_nifillos/core/formats/*.md` (14 files) | `templates/_nifillos/core/formats/` | **Create** directory + copy all |
| `_nifillos/core/architect.agent.yaml` | `templates/_nifillos/core/architect.agent.yaml` | **Overwrite** |
| `_nifillos/core/runner.pipeline.md` | `templates/_nifillos/core/runner.pipeline.md` | **Overwrite** |
| `_nifillos/core/prompts/sherlock.prompt.md` | `templates/_nifillos/core/prompts/sherlock.prompt.md` | **Overwrite** |
| — | `templates/_nifillos/core/platforms/` | **Delete** (deprecated) |

### Part 2: Init installs agents + skills automatically

Modify `src/init.js` to install all bundled agents and non-MCP skills after copying templates:

```
init() flow:
  1. copyCommonTemplates(targetDir)     ← existing
  2. copyIdeTemplates(ides, targetDir)  ← existing
  3. installAllAgents(targetDir)        ← NEW
  4. installAllBundledSkills(targetDir) ← NEW (non-MCP skills only)
  5. writeProjectReadme(targetDir)      ← existing
  6. [skills MCP selection prompt]      ← existing (unchanged)
```

**`installAllAgents(targetDir)`:**
- Reads `agents/` directory from npm package (BUNDLED_AGENTS_DIR)
- For each agent directory, calls existing `installAgent(id, targetDir)`
- Copies `agents/{id}/AGENT.md` → `{targetDir}/agents/{id}.agent.md`
- Logs each installed agent

**`installAllBundledSkills(targetDir)`:**
- Reads `skills/` directory from npm package (BUNDLED_SKILLS_DIR)
- Filters out `nifillos-skill-creator` (internal, already filtered elsewhere)
- For each skill, calls existing `installSkill(id, targetDir)`
- Copies `skills/{id}/SKILL.md` → `{targetDir}/_nifillos/skills/{id}/SKILL.md`
- These are non-MCP skills (no env vars, no configuration needed)
- MCP skills continue to be offered via the existing interactive prompt

### Part 3: Update also installs new agents/skills

Modify `src/update.js`:
- After updating templates, check for new agents/skills in the bundle
- Install any agent/skill that exists in the bundle but NOT in the user's project
- Respect `PROTECTED_PATHS` — never overwrite existing agents
- Log new additions separately from updates

### Part 4: Update Nifillos-dev skill

Add Check H to `.claude/skills/Nifillos-dev/SKILL.md`:
- Verify that `src/init.js` calls `installAllAgents()` and `installAllBundledSkills()`
- Verify the functions import from `src/agents.js` and `src/skills.js`

## Files Modified

- `src/init.js` — Add agent/skill auto-installation
- `src/update.js` — Add new agent/skill detection during update
- `templates/_nifillos/core/` — Full sync with source
- `.claude/skills/Nifillos-dev/SKILL.md` — Add Check H

## Out of Scope

- Moving `_nifillos/skills/` to project root `/skills/` (separate design doc)
- Agent selection UI during init (decided: install all silently)
- MCP skill flow changes (unchanged)
