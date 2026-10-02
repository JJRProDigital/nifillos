# Quick start (~10 minutes)

Canonical guide (in the repo and copied to user projects by `init`/`update`). For the **framework source and full docs**, see the [Nifillos repository on GitHub](https://github.com/JJRProDigital/nifillos).

**Requirement:** [Node.js 20+](https://nodejs.org/).

---

## 1. Create your Nifillos project

In an empty folder (or the folder you will use as the project):

```bash
npx nifillos init
```

The wizard asks for language, your name, IDE(s), then copies templates, bundled `skills/`, and editor config. The first run may install dashboard dependencies and Chromium for Playwright (can take a few minutes).

**You get:** `_nifillos/`, `cuadrillas/`, `skills/`, IDE-specific files (e.g. Cursor rules or Claude Code skills).

**Already have a project?** Keep it fresh and migrate:

```bash
npx nifillos update    # refresh templates and the _nifillos/ core from the installed package
npx nifillos migrate   # legacy renaming only (squads/ → cuadrillas/), nothing else refreshed
```

After an `update`, if you use the **dashboard**, install its Node dependencies again: `cd dashboard && npm install`.

---

## 2. Open the project in your IDE

Open the **project root** (where `_nifillos/` lives).

In **Cursor**, **Claude Code**, **Codex**, **OpenCode**, **Antigravity**, or **VS Code + Copilot**, the entry point is the slash command:

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

(or your template's equivalent). The **Pipeline Runner** executes pipeline steps. **Checkpoints** pause for your approval. Deliverables usually land in `cuadrillas/<name>/output/…`.

---

## 5. (Optional) Dashboard

Two usual contexts:

### A. Project dashboard (2D office + metrics)

The project root has a `dashboard/` folder (Vite + React). To see the **Office** (live state) and **Metrics** (runs, artifacts, preview, diff):

```bash
cd dashboard
npm install    # first time only
npm run dev    # development; or npm start for build + standalone server
```

Open the URL Vite prints (usually `http://localhost:5173`). If the metrics API runs separately: in `dashboard/`, `npm run metrics:serve`; optionally set **`NIFILLOS_METRICS_API`** for another host/port. Technical overview: `dashboard/README.md` in your project; the package repo also has [docs/dashboard-metrics.md](https://github.com/JJRProDigital/nifillos/blob/master/docs/dashboard-metrics.md).

### B. Static site inside a cuadrilla

If a cuadrilla ships its own `cuadrillas/<name>/dashboard/` folder (static HTML):

```bash
npx serve cuadrillas/<cuadrilla-name>/dashboard
```

---

## 6. Additional skills

Bundled skills live in `skills/`. To install more:

```bash
npx nifillos install <id>
npx nifillos skills
```

- **Local catalog:** [skills/README.md](skills/README.md)
- **Full CLI reference** (in the package repo): [docs on GitHub](https://github.com/JJRProDigital/nifillos/tree/master/docs)

---

## 7. MCP (Playwright, Excalidraw, etc.)

Skills typed **mcp** or **hybrid** usually need MCP servers. After `init`, check the project JSON files (e.g. `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `opencode.json`, depending on IDE) **and** your IDE's local plugin config.

- **Playwright:** browser automation (Sherlock, screenshots, several skills).
- **Excalidraw:** diagrams over MCP HTTP.

Skill list and types: `npx nifillos skills` and [skills/README.md](skills/README.md). If something does not connect, check `npx`, firewall, and the env vars each skill requires (see frontmatter in `skills/<id>/SKILL.md`).

---

## 8. Legacy projects (`squads/`)

If you still have **`squads/`** or **`squad.yaml`**:

```bash
npx nifillos update
```

or migration only:

```bash
npx nifillos migrate
```

Current convention: **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, and the **`cuadrilla`** key in state. If `squads/` and `cuadrillas/` coexist, merge manually; the CLI does not merge folders.

---

## 9. Diagnosis and validation

- **`npx nifillos doctor`** — diagnoses your installation: CLI/framework versions, IDE files, company profile, skills, Playwright browser and dashboard.
- **`npx nifillos validate [cuadrilla]`** — validates `cuadrilla.yaml` (schema, agents, party and pipeline files) with concrete per-path errors.

---

## Security: secrets and Git

- **Never commit** API keys, tokens or passwords in repo files (e.g. `.mcp.json` with `Authorization` or embedded tokens).
- Use **`.env`** (usually in `.gitignore`) for variables skills read (`APIFY_TOKEN`, OpenRouter keys, Instagram, etc.).
- For MCP, prefer **environment variables** or **local-only** IDE settings. Check `git status` before committing.
- Do not commit automated browser profiles (e.g. **`_nifillos/_browser_profile/`**, usually gitignored).
- **Package templates** must carry placeholders, never real secrets.

If you leaked a secret, **rotate it at the provider** and, if needed, clean Git history.

---

## Where to read next

| Topic | Link |
|------|--------|
| Usage overview | [README.md](README.md) |
| Skills catalog | [skills/README.md](skills/README.md) |
| IDE instructions (Claude Code) | `CLAUDE.md` (if present in this folder) |
| Framework source and docs | [github.com/JJRProDigital/nifillos](https://github.com/JJRProDigital/nifillos) |
| Contributing | [CONTRIBUTING.md](https://github.com/JJRProDigital/nifillos/blob/master/CONTRIBUTING.md) |

**Español:** [GUIA.md](GUIA.md)

---

## TL;DR

**`npx nifillos init` → open project → `/nifillos` → create cuadrilla → run cuadrilla**; skills, MCP, dashboard, migration and diagnosis as needed.
