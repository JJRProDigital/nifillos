# Quick start (~10 minutes)

One path from zero to a running cuadrilla, with pointers to deeper docs when you need them.

**Requirement:** [Node.js 20+](https://nodejs.org/).

---

## 1. Create your Nifillos project

In an empty folder (or the folder you will use as the project):

```bash
npx nifillos init
```

The wizard asks for language, your name, IDE(s), then copies templates, bundled `skills/`, and editor config. The first run may install dashboard dependencies and Chromium for Playwright (can take a few minutes).

**You get:** `_nifillos/`, `cuadrillas/`, `skills/`, IDE-specific files (e.g. Cursor rules or Claude Code skills).

---

## 2. Open the project in your IDE

Open the **project root** (where `_nifillos/` lives).

In **Cursor**, **Claude Code**, **Codex**, **Antigravity**, or **VS Code + Copilot**, the entry point is the slash command:

```
/nifillos
```

That opens the menu: create cuadrilla, run, skills, help, etc. Exact files depend on the IDE (`.cursor/rules/`, `.claude/skills/`, …).

---

## 3. Create your first cuadrilla

**A.** From the **`/nifillos`** menu, choose create cuadrilla.

**B.** In natural language, for example:

```
/nifillos create a cuadrilla for [one-line description]
```

The **Architect** asks questions and writes files under `cuadrillas/<name>/` (pipeline, agents, `cuadrilla.yaml`, …).

---

## 4. Run the cuadrilla

```
/nifillos run the <cuadrilla-name> cuadrilla
```

(or your template’s equivalent). The **Pipeline Runner** executes pipeline steps. **Checkpoints** pause for your approval.

Deliverables usually land in `cuadrillas/<name>/output/…`.

---

## 5. (Optional) Dashboard

### Project dashboard (`dashboard/`)

For the **2D office** (WebSocket) and **Metrics** (runs, artifacts, diff):

```bash
cd dashboard
npm install   # first time only
npm run dev
```

Open Vite’s URL (e.g. `http://localhost:5173`). Metrics API: from `dashboard/`, `npm run metrics:serve`; optional **`NIFILLOS_METRICS_API`**. See [dashboard-metrics.md](./dashboard-metrics.md).

### Per-cuadrilla static dashboard

If `cuadrillas/<name>/dashboard/` exists as static files:

```bash
npx serve cuadrillas/<cuadrilla-name>/dashboard
```

---

## 6. More skills

Bundled skills live in `skills/`. Install extras by package id, local folder, or Git:

```bash
npx nifillos install <id>
npx nifillos skills
```

Full CLI reference (Spanish): [nifillos-comandos-y-skills.md](./nifillos-comandos-y-skills.md). Catalog: [skills/README.md](../skills/README.md).

---

## 7. MCP (Playwright, Excalidraw, …)

**mcp** and **hybrid** skills need MCP servers. After `init`, check `.mcp.json`, `.cursor/mcp.json`, or `.vscode/mcp.json` as applicable, plus any **IDE-local** MCP/plugin config.

- **Playwright:** browser automation (Sherlock, screenshots, some skills).
- **Excalidraw:** diagrams via HTTP MCP.

Catalog and skill types: [nifillos-comandos-y-skills.md](./nifillos-comandos-y-skills.md) and [skills/README.md](../skills/README.md). Env vars: YAML frontmatter in `skills/<id>/SKILL.md`.

If something fails to connect, verify `npx` works and the firewall allows it.

---

## 8. Legacy layouts (`squads/`)

If you still have **`squads/`** and **`squad.yaml`**:

```bash
npx nifillos update   # migrate + refresh templates from package
npx nifillos migrate # migrate only
```

Current layout: **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, state field **`cuadrilla`**. If both `squads/` and `cuadrillas/` exist, merge manually; the CLI does not merge folders.

---

## Security: secrets and Git

- **Do not commit** API keys, tokens, or passwords in tracked files (e.g. `.mcp.json` with `Authorization` headers or embedded tokens).
- Projects usually **gitignore `.env`**: put secrets there (`APIFY_TOKEN`, OpenRouter keys, Instagram tokens, …).
- Prefer **environment variables** or **IDE-only local MCP config** when possible; run `git status` before committing.
- Do not commit browser automation profiles (e.g. **`_nifillos/_browser_profile/`**, usually gitignored).
- **Package templates** in this repo must use **placeholders**, not real secrets.

If you leaked a secret, **rotate it at the provider** and remove it from history if needed.

---

## Where to read next

| Topic | Doc |
|------|-----|
| Package overview | [README.md](../README.md) |
| Assistant / project instructions | [CLAUDE.md](../CLAUDE.md) |
| Contributing | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Design notes | [plans/](plans/) |
| Same walkthrough in projects after `npx nifillos init` | **`GUIA.md`** and **`GUIDE.md`** at project root (templates: [`templates/GUIA.md`](../templates/GUIA.md), [`templates/GUIDE.md`](../templates/GUIDE.md)) |

Spanish walkthrough (same structure): [guia-inicio-rapido.md](./guia-inicio-rapido.md).

---

## One-liner

**`npx nifillos init` → open folder in IDE → `/nifillos` → create cuadrilla → run cuadrilla**; skills, MCP, dashboard, and migration are add-ons when you need them.
