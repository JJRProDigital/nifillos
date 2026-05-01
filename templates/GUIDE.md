# Quick start (~10 minutes)

A single path through **this project**: IDE, cuadrillas, dashboard, skills, MCP, and migrations. For the **framework source and full docs**, see the [Nifillos repository on GitHub](https://github.com/JJRProDigital/nifillos).

**Requirement:** [Node.js 20+](https://nodejs.org/).

---

## 1. Your Nifillos project

This folder was created with **`npx nifillos init`**. On a **new machine or folder**, run that command again where you want the project.

To **refresh** templates and the `_nifillos/` core from your installed npm package:

```bash
npx nifillos update
```

To **only** migrate legacy names (`squads/` → `cuadrillas/`, etc.) without copying the full framework from the package:

```bash
npx nifillos migrate
```

---

## 2. Open the project in your IDE

Open **this folder** as the project root (where `_nifillos/` lives).

In **Cursor**, **Claude Code**, **Codex**, **Antigravity**, or **VS Code + Copilot**, start with:

```
/nifillos
```

That opens the menu: create cuadrilla, run, skills, help, etc. Exact files depend on the IDE (`.cursor/rules/`, `.claude/skills/`, …).

---

## 3. Create your first cuadrilla

**A.** From **`/nifillos`**, choose create cuadrilla.

**B.** In plain language, for example:

```
/nifillos create a cuadrilla for [one-line description]
```

The **Architect** asks questions and writes files under `cuadrillas/<name>/`.

---

## 4. Run the cuadrilla

```
/nifillos run the <cuadrilla-name> cuadrilla
```

(or your template’s wording). The **Pipeline Runner** runs the pipeline. **Checkpoints** pause for approval. Deliverables usually go to `cuadrillas/<name>/output/…`.

---

## 5. (Optional) Dashboard

There are **two** common setups:

### A. Project dashboard (2D office + metrics)

At the repo root you have a `dashboard/` folder (Vite + React). To run the **Office** (live state) and **Metrics** (runs, artifacts, preview, diff):

```bash
cd dashboard
npm install    # first time only
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). If the metrics API runs separately, from `dashboard/` run `npm run metrics:serve`, or set **`NIFILLOS_METRICS_API`** when it lives on another host/port. See **`dashboard/README.md`** in your project; package repo also has `docs/dashboard-metrics.md`.

### B. Static site inside a cuadrilla

Some cuadrillas ship `cuadrillas/<name>/dashboard/` as static HTML. Then:

```bash
npx serve cuadrillas/<cuadrilla-name>/dashboard
```

---

## 6. More skills

Bundled skills are in `skills/`. Install extras:

```bash
npx nifillos install <id>
npx nifillos skills
```

- **Local catalog:** [skills/README.md](skills/README.md)
- **Extended CLI reference** (in the package repo): [docs on GitHub](https://github.com/JJRProDigital/nifillos/tree/master/docs)

---

## 7. MCP (Playwright, Excalidraw, …)

**mcp** and **hybrid** skills usually need MCP servers. After `init`, check project JSON (`.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, etc.) **and** any IDE-local MCP/plugin settings.

- **Playwright:** browser automation (Sherlock, screenshots, several skills).
- **Excalidraw:** diagrams via HTTP MCP.

Run `npx nifillos skills` and read [skills/README.md](skills/README.md). If something fails to connect, check `npx`, firewall, and each skill’s env vars (see YAML frontmatter in `skills/<id>/SKILL.md`).

---

## 8. Legacy layout (`squads/`)

If you still have **`squads/`** or **`squad.yaml`**:

```bash
npx nifillos update
```

or migration only:

```bash
npx nifillos migrate
```

Current layout: **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, state field **`cuadrilla`**. If both `squads/` and `cuadrillas/` exist, merge manually; the CLI does not merge folders.

---

## Security: secrets and Git

- **Do not commit** API keys, tokens, or passwords in tracked files (e.g. `.mcp.json` with `Authorization` or embedded secrets).
- Use **`.env`** (usually gitignored) for skill variables (`APIFY_TOKEN`, OpenRouter keys, Instagram tokens, …).
- Prefer **environment variables** or **machine-local** / IDE-local MCP settings. Run `git status` before committing.
- Do not commit browser automation profiles (e.g. **`_nifillos/_browser_profile/`**, typically in `.gitignore`).
- **Package templates** must use placeholders, not real secrets.

If you leaked a secret, **rotate it at the provider** and clean Git history if needed.

---

## Where to read next

| Topic | Link |
|------|------|
| Usage overview | [README.md](README.md) |
| Skills catalog | [skills/README.md](skills/README.md) |
| IDE instructions (Claude Code) | `CLAUDE.md` (if present) |
| Framework source & docs | [github.com/JJRProDigital/nifillos](https://github.com/JJRProDigital/nifillos) |

**Español:** [GUIA.md](GUIA.md)

---

## One-liner

**Open project → `/nifillos` → create cuadrilla → run cuadrilla**; add skills, MCP, dashboard, and migration when you need them.
