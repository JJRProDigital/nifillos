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

## Prioridad 3 — Robustez

- **Tests** de `migrate` / flujo `update` con fixtures legacy (`squads/` → `cuadrillas/`, claves en `state.json`).

## Explícitamente después (o no sin replantear producto)

- Panel que **cree** o **arranque** cuadrillas sustituyendo al IDE (alto coste, choca con el diseño actual).
- **Clon / convergencia OpenClaw** (otro producto; si acaso integración puntual por el borde).

## Referencias en repo

- Runner y tiers: `_nifillos/core/runner.pipeline.md`, `_nifillos/config.yaml`
- Runs/historial: `src/runs.js`
- Dashboard: `dashboard/`, `templates/dashboard/`
- Guías usuario: `templates/GUIA.md`, `templates/GUIDE.md`, `docs/guia-inicio-rapido.md`
