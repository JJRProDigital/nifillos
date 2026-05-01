# Roadmap — siguientes pasos razonables (Nifillos)

**Guardado para retomar.** Contexto breve de lo **no** hacer por ahora: no clonar OpenClaw; no implementar LLM por agente (plan aplazado); no apostar todavía por un panel que cree/lance cuadrillas sustituyendo al IDE.

## Prioridad 1 — Dashboard / resultados

Ampliar el dashboard existente (oficina 2D + `state.json`) hacia utilidad operativa:

- Lista de **runs** por cuadrilla (fechas, estado, duración si está disponible en `state.json` u otros artefactos).
- **Explorador** de `cuadrillas/<nombre>/output/<run_id>/` con enlaces o previsualización simple de Markdown/archivos clave.

Objetivo: pasar de visualización en vivo a **herramienta de revisión** sin un segundo motor de ejecución.

## Prioridad 2 — Pulir el producto mínimo

- Revisar que **GUIA.md / GUIDE.md** y la doc en `docs/` cubran flujos reales (MCP, secretos, migración).
- **Frontmatter mínimo** en skills tipo prompt empaquetadas (p. ej. `market-*`) para catálogo y listados.
- Valorar una **cuadrilla ejemplo** pequeña y mantenida en plantillas si falta un “hola mundo” claro.

**Estado (revisión):** Guías del proyecto (`templates/GUIA.md`, `templates/GUIDE.md`) y `docs/guia-inicio-rapido.md`, `docs/quick-start.md` actualizadas: dashboard Vite en `dashboard/`, MCP (IDE + proyecto), secretos (incl. perfiles de navegador), migración. Skills `market-audit`, `market-social`, `market-landing` con YAML `name`, `description`, `description_es`, `type`, `version`, `categories`. `templates/cuadrillas/README.md` orienta la primera cuadrilla vía `/nifillos` sin duplicar un ejemplo ejecutable mínimo en el paquete.

## Prioridad 3 — Robustez

- **Tests** de `migrate` / flujo `update` con fixtures legacy (`squads/` → `cuadrillas/`, claves en `state.json`).

**Estado (revisión):** `tests/migrate.test.js` cubre renombrado de raíz, `squad.yaml` / `squad-party.csv`, parche YAML y `state.json` (incl. raíz de cuadrilla y bajo `output/`), idempotencia, convivencia `squads/` + `cuadrillas/`, conflictos de archivos duplicados, `state.json` con `cuadrilla` ya presente (no pisa). `tests/update.test.js` incluye **`update runs migrate squads → cuadrillas when only squads/ exists`** (integración tras `init`). Migración en tests de advertencias: `loadLocale('English')` para mensajes i18n estables.

## Explícitamente después (o no sin replantear producto)

- Panel que **cree** o **arranque** cuadrillas sustituyendo al IDE (alto coste, choca con el diseño actual).
- **Clon / convergencia OpenClaw** (otro producto; si acaso integración puntual por el borde).

## Referencias en repo

- Runner y tiers: `_nifillos/core/runner.pipeline.md`, `_nifillos/config.yaml`
- Runs/historial: `src/runs.js`
- Dashboard: `dashboard/`, `templates/dashboard/`
- Guías usuario: `templates/GUIA.md`, `templates/GUIDE.md`, `docs/guia-inicio-rapido.md`
