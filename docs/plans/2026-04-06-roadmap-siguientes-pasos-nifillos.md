# Roadmap — siguientes pasos razonables (Nifillos)

**Guardado para retomar.** Contexto breve de lo **no** hacer por ahora: no clonar OpenClaw; no implementar LLM por agente (plan aplazado); no apostar todavía por un panel que cree/lance cuadrillas sustituyendo al IDE.

## Estado global (2026-05-05)

- ✅ **Prioridad 2 (pulido mínimo): completada**
- ✅ **Prioridad 3 (robustez): completada**
- 🟡 **Prioridad 1 (dashboard/resultados): muy avanzada**, con mejoras recientes de estado en vivo, fallback desde `output/` y refresco sin F5.

## Prioridad 1 — Dashboard / resultados (🟡 en progreso avanzado)

Ampliar el dashboard existente (oficina 2D + `state.json`) hacia utilidad operativa:

- ✅ Lista de **runs** por cuadrilla (fechas, estado, duración si está disponible en `state.json` u otros artefactos).
- ✅ **Explorador** de `cuadrillas/<nombre>/output/<run_id>/` con enlaces y previsualización (texto/Markdown/HTML/imagen, diff y descarga).
- ✅ Oficina con estado activo desde raíz y fallback al último `output/<run_id>/state.json`.
- ✅ Refresco automático sin F5 (WebSocket + polling HTTP cada 15s).

Objetivo: pasar de visualización en vivo a **herramienta de revisión** sin un segundo motor de ejecución.

### Pendiente operativo derivado de P1 (⏳)

- ⏳ **Tokens reales en curso**: hoy Métricas usa `usage.json` (si existe) o estimación; falta telemetría incremental durante ejecución.
- ⏳ **Run activo en Métricas**: reflejar explícitamente el run en curso antes de archivarse en `output/<runId>/`.
- ⏳ **Ruta de cuadrillas configurable**: soportar y documentar una variable explícita (p. ej. `NIFILLOS_CUADRILLAS_DIR`) para ejecuciones fuera del árbol esperado.
- ⏳ **Tests de integración de refresco** (WS + polling) para casos donde el watcher de ficheros no dispara.

## Prioridad 2 — Pulir el producto mínimo (✅ completada)

- ✅ Revisar que **GUIA.md / GUIDE.md** y la doc en `docs/` cubran flujos reales (MCP, secretos, migración).
- ✅ **Frontmatter mínimo** en skills tipo prompt empaquetadas (p. ej. `market-*`) para catálogo y listados.
- 🟡 Valorar una **cuadrilla ejemplo** pequeña y mantenida en plantillas si falta un “hola mundo” claro.

**Estado (revisión):** Guías del proyecto (`templates/GUIA.md`, `templates/GUIDE.md`) y `docs/guia-inicio-rapido.md`, `docs/quick-start.md` actualizadas: dashboard Vite en `dashboard/`, MCP (IDE + proyecto), secretos (incl. perfiles de navegador), migración. Skills `market-audit`, `market-social`, `market-landing` con YAML `name`, `description`, `description_es`, `type`, `version`, `categories`. `templates/cuadrillas/README.md` orienta la primera cuadrilla vía `/nifillos` sin duplicar un ejemplo ejecutable mínimo en el paquete.

## Prioridad 3 — Robustez (✅ completada)

- ✅ **Tests** de `migrate` / flujo `update` con fixtures legacy (`squads/` → `cuadrillas/`, claves en `state.json`).

**Estado (revisión):** `tests/migrate.test.js` cubre renombrado de raíz, `squad.yaml` / `squad-party.csv`, parche YAML y `state.json` (incl. raíz de cuadrilla y bajo `output/`), idempotencia, convivencia `squads/` + `cuadrillas/`, conflictos de archivos duplicados, `state.json` con `cuadrilla` ya presente (no pisa). `tests/update.test.js` incluye **`update runs migrate squads → cuadrillas when only squads/ exists`** (integración tras `init`). Migración en tests de advertencias: `loadLocale('English')` para mensajes i18n estables.

## Explícitamente después (o no sin replantear producto)

- Panel que **cree** o **arranque** cuadrillas sustituyendo al IDE (alto coste, choca con el diseño actual).
- **Clon / convergencia OpenClaw** (otro producto; si acaso integración puntual por el borde).

## Referencias en repo

- Runner y tiers: `_nifillos/core/runner.pipeline.md`, `_nifillos/config.yaml`
- Runs/historial: `src/runs.js`
- Dashboard: `dashboard/`, `templates/dashboard/`
- Guías usuario: `templates/GUIA.md`, `templates/GUIDE.md`, `docs/guia-inicio-rapido.md`
