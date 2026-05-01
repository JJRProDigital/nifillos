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

## 5. (Optional) Dashboard (virtual office)

1. In the IDE, request the dashboard (e.g. from **`/nifillos`**).
2. In a terminal at the project root:

   ```bash
   npx serve cuadrillas/<cuadrilla-name>/dashboard
   ```

3. Open the URL shown (often `http://localhost:3000`).

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

Check `.mcp.json`, `.cursor/mcp.json`, or `.vscode/mcp.json` as shipped by `init`.

- **Playwright:** browser automation (Sherlock, screenshots, some skills).
- **Excalidraw:** diagrams via HTTP MCP.

If connection fails, verify `npx` and firewall rules.

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
- Use **`.env`** (usually gitignored) for skill variables.
- Prefer **environment variables** or **machine-local** MCP settings. Run `git status` before committing.

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
