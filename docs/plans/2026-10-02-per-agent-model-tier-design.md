# Per-Agent Model Tiers — Design & Plan

**Date:** 2026-10-02
**Status:** Draft — reconstruction. The original plan (saved in a Cursor session) was never committed; this document was rebuilt from the surviving artifacts: `_nifillos/config.yaml` (commit `46b76a8`), `runner.pipeline.md` (`model_tier` in step frontmatter), and `docs/plans/2026-02-26-token-cost-performance-mode-*.md`.

## Problem

Nifillos dispatches every agent through the IDE's single active model. Two things are missing:

1. **No per-agent override.** `_nifillos/config.yaml` maps agent *types* to tiers (`orchestrator`/`writer`/`researcher`/`investigator` → `powerful`/`fast`), but an individual agent cannot choose its own model. A lightweight summarizer typed as `writer` is forced onto the expensive model just because of its type.
2. **The tier config never ships.** `templates/_nifillos/` has no `config.yaml`, so user projects created with `npx nifillos init` do not receive the tier mapping. The runner's instruction is "if the file doesn't exist, ignore silently — all steps default to `powerful`", which silently disables the feature for everyone except the dev repo.

## Current state (recovered)

| Mechanism | Where | Semantics |
|-----------|-------|-----------|
| Type → tier mapping | `_nifillos/config.yaml` `models:` | `orchestrator: powerful`, `writer: powerful`, `researcher: fast`, `investigator: fast` |
| Per-step override | `pipeline/steps/*.md` frontmatter `model_tier:` | The step declares its own tier at dispatch (set by the Architect) |
| Tier meaning per IDE | comments in `config.yaml` | `powerful` = claude-opus / Gemini Pro / o3 · `fast` = claude-haiku / Gemini Flash / gpt-4o-mini |

## Solution

A **three-level precedence chain** for choosing the model tier at dispatch time:

```
step frontmatter `model_tier`   ← highest (explicit per-task choice)
  → agent file frontmatter `model_tier`   ← NEW (per-agent override)
    → `config.yaml` `models.{type}`        ← type default
      → `powerful`                          ← final fallback
```

### 1. Per-agent override: agent file frontmatter

Each `agents/<id>.agent.md` may declare:

```yaml
---
name: Esteban Estructura
role: researcher
model_tier: fast        # optional — overrides the type default for THIS agent
---
```

Rationale: the agent file is already the agent's identity (persona, role, tools). Keeping the override there means the Architect sets it at cuadrilla creation time and it survives updates untouched (`agents/` is a protected path).

### 2. Ship the config

Add `templates/_nifillos/config.yaml` (same content as `_nifillos/config.yaml`) so `init`/`update` deliver it. It is a common template: no-clobber on `init` (respects user edits), refreshed by `update` with `.bak` backup — consistent with the template policy introduced in `d2d4625`.

### 3. Validation

`nifillos validate` (added in `099641f`) gains cross-checks:

- `model_tier` present in an agent file must be `powerful` or `fast` (unknown tier → error).
- A `model_tier` that contradicts the type default (`researcher` + `powerful`) is **not** an error — it is the point of the feature — but `validate` reports it as a **warning** with the cost implication, mirroring the token-cost plan's spirit.

### 4. Dashboard (optional, phase 2)

`cuadrilla-party.csv` gains an optional `model_tier` column read for display in the office view (badge next to the agent). State files are untouched. This is cosmetic and can be deferred.

## Explicit non-goals

- **No per-agent concrete model names** (`claude-opus-4.5`, `gemini-3-pro`…). The tier indirection exists because each IDE maps tiers to its own catalog; hardcoding names would break the IDE-agnostic contract.
- **No runtime model switching inside a step.** The tier is decided at dispatch.
- **No cost metering per agent** — `usage.json` cost estimation (runs.js) stays run-level.

## Files affected

1. `templates/_nifillos/config.yaml` — new (copy of `_nifillos/config.yaml`).
2. `templates/_nifillos/core/runner.pipeline.md` — dispatch precedence chain documented (step → agent → type → fallback).
3. `templates/cuadrillas/` demo cuadrillas — one agent with `model_tier: fast` as a worked example.
4. `src/validate.js` — validate `model_tier` in agent frontmatter (error: unknown tier; warning: contradicts type default).
5. `docs/nifillos-comandos-y-skills.md` — document the override.
6. Phase 2 (optional): `dashboard/` — model badge from `cuadrilla-party.csv`.

## Implementation tasks

1. Copy `_nifillos/config.yaml` → `templates/_nifillos/config.yaml`.
2. Extend `runner.pipeline.md` dispatch section with the precedence chain (step → agent → type → `powerful`).
3. Extend `src/validate.js`: read agent frontmatter, validate `model_tier`, emit warnings for type-contradicting overrides. Add tests (valid tier, unknown tier, contradiction warning).
4. Add a worked example to a demo cuadrilla agent file.
5. Update `docs/nifillos-comandos-y-skills.md` + guides (one line each in GUIA/GUIDE §9).
6. Phase 2: dashboard badge (separate plan).

## Risks

- **Drift between IDE catalogs**: tier meanings live in comments only. If an IDE renames its models, the comment goes stale — acceptable, the contract is the tier, not the model name.
- **Frontmatter parsing**: agent `.agent.md` files are markdown with YAML frontmatter parsed by the agent itself (not by code), so validation is advisory — `validate` catches mistakes before a run, the runner still needs defensive reading instructions ("if `model_tier` is missing or invalid, fall through the chain").
- **Cost surprises**: an agent forced to `powerful` by contradiction now emits a warning, not silence — this is the deliberate guard.
