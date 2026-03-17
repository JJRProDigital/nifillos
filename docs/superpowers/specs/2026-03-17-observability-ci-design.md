# Observability & CI — Design Spec

Alternative to PR #7 (`feat/observability-ci`). Same goals, split into 3 focused PRs, with improvements.

## Goals

- Master test suite passes (currently 5 failures)
- Automated CI on every push/PR
- CLI operation logging for debugging
- Pipeline execution history via `npx opensquad runs`

## Decisions

- **Run logging reads `state.json` directly** — no separate `run-log.json`. The runner already writes `state.json` during execution; we stop deleting it at the end and mark it as `completed`/`failed` instead. Fewer files, fewer instructions, fewer tokens.
- **Run log is minimal** — only essential fields to avoid inflating token usage.
- **Logger errors are silent** — never breaks the operation being logged.
- **ESLint is error-only** — no style rules, just catches real bugs.
- **Fix tests first** — CI must be born green.

---

## PR 1 — Fix failing tests

**Branch:** `fix/master-test-failures`

### Problem

5 tests fail on master:

| Test file | Failure | Root cause |
|-----------|---------|------------|
| `init.test.js:291` | "init installs all bundled agents" | Expects `agents/` directory with `.agent.md` files, but no bundled agents exist yet |
| `update.test.js:152` | "update installs new bundled agents not already present" | Same — no bundled agents directory |
| `update.test.js:177` | "update does not overwrite existing agent files" | Same — no bundled agents directory |
| `init.test.js:143` | "README.md is in Portuguese when language is PT-BR" | Test expects "Instalação", README uses different wording |
| `init.test.js:156` | "README.md is in Spanish when language is Español" | Test expects "Instalación", README uses different wording |

### Solution

- **Agent tests:** Adjust expectations to handle the case where no bundled agents exist (skip or expect empty). The code is correct — the tests assumed agents would be bundled before they were.
- **README tests:** Update expected strings to match actual content in `src/readme/README.md`.

### Scope

Tests only. Zero production code changes.

### Acceptance criteria

- `npm test` — 89/89 pass (previously 84/89)

---

## PR 2 — ESLint + GitHub Actions CI

**Branch:** `feat/eslint-ci`
**Depends on:** PR 1 merged

### ESLint

**New file:** `eslint.config.js`

```js
// ESLint 9 flat config — error checking only
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js", "bin/**/*.js", "tests/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { /* node globals */ }
    }
  }
];
```

**package.json changes:**
- Add `eslint` as devDependency
- Add `"lint": "eslint src/ bin/ tests/"` script

### GitHub Actions

**New file:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

### Acceptance criteria

- `npm run lint` passes with zero errors
- `npm test` passes
- CI runs on push/PR to master and both jobs are green

---

## PR 3 — Observability

**Branch:** `feat/observability`
**Depends on:** PR 2 merged

### 3a. CLI Logger

**New file:** `src/logger.js`

```js
// logEvent(action, details) — appends to _opensquad/logs/cli.log
// readCliLogs({ action, since, limit }) — reads with optional filters
```

- Format: JSONL (one JSON object per line)
- Fields per line: `{ timestamp, action, details }`
- Actions: `init`, `update`, `skill:install`, `skill:remove`, `agent:install`, `agent:remove`
- Silent on failure (try/catch, no throw)
- `details` is a flat object with 1-3 relevant fields (e.g., `{ name: "sherlock" }`)

**Modified files** (add `logEvent` call at end of operation):
- `src/init.js`
- `src/update.js`
- `src/skills-cli.js`
- `src/agents-cli.js`

### 3b. Persistent state.json

**Modified files:**
- `_opensquad/core/runner.pipeline.md`
- `templates/_opensquad/core/runner.pipeline.md`

**Change:** Remove the instruction that deletes `state.json` after pipeline completion. Instead, the runner marks the final status:

```json
{
  "status": "completed",
  "completedAt": "2026-03-17T12:00:00Z"
}
```

On failure:

```json
{
  "status": "failed",
  "error": "brief error description",
  "failedAt": "2026-03-17T12:00:00Z"
}
```

No new fields, no new files. Just stop deleting what's already there.

### 3c. Runs command

**New file:** `src/runs.js`

```js
// listRuns(squadName?) — scans squads/*/output/*/state.json
// printRuns(runs) — formatted console output
// formatDuration(ms) — "2m 30s" format
```

**Modified file:** `bin/opensquad.js` — registers `runs` command

**Behavior:**
- `npx opensquad runs` — all squads
- `npx opensquad runs my-squad` — filter by squad
- Reads `state.json` from each `squads/*/output/*/` directory
- Shows: squad name, run date, status, step count, duration
- Fallback: runs without `state.json` show as "unknown"
- Sorted by date descending, limit 20
- Graceful handling of malformed JSON

### Tests

**New files:**
- `tests/logger.test.js` — write, append, read, filtering, silent failure
- `tests/runs.test.js` — empty state, parsing, sorting, filtering, malformed JSON, duration formatting

### Acceptance criteria

- All new tests pass
- `npm test` full suite green
- `npx opensquad runs` shows "No runs found." on fresh project
- After a pipeline run, `state.json` persists and `npx opensquad runs` shows the run
