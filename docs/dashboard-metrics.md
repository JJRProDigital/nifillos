# Dashboard Nifillos — API de métricas

La pestaña **Métricas** del dashboard consume una API HTTP bajo el prefijo **`/__cuadrillas_api/`**. En desarrollo (`npm run dev` dentro de `dashboard/`), un middleware de Vite implementa estas rutas salvo que definas **`NIFILLOS_METRICS_API`**: en ese caso el plugin solo registra el WebSocket de cuadrillas y Vite **reenvía** `/__cuadrillas_api` al origen indicado (`server.proxy` con `changeOrigin: true`).

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/__cuadrillas_api/runs` | Resumen global: `listRunSummaries` (runs, `byCuadrilla`, `pricing`, `limits`). ETag + 304. |
| GET | `/__cuadrillas_api/runs-page?cuadrilla=&offset=&limit=` | Página de runs de una cuadrilla (orden `runId` descendente). Ver **`focusRunId`** abajo. |
| GET | `/__cuadrillas_api/artifacts?cuadrilla=&runId=` | Lista de archivos del run, `manifest` opcional, límites y `truncated`. |
| GET | `/__cuadrillas_api/limits` | Objeto `DASHBOARD_LIMITS` (`src/dashboardLimits.js`). |
| GET | `/__cuadrillas_api/audit?lines=` | Cola de `_nifillos/logs/dashboard-audit.log`. |
| GET | `/__cuadrillas_api/preview?cuadrilla=&runId=&relPath=` | Vista previa (texto, Markdown→HTML con `marked`, binarios acotados). |
| GET | `/__cuadrillas_api/download?...` | Descarga con `Content-Disposition: attachment`. |
| POST | `/__cuadrillas_api/diff` | Cuerpo JSON `{ cuadrilla, runId, left, right }` → diff unificado (`diff`). |
| POST | `/__cuadrillas_api/diff-runs` | Cuerpo `{ cuadrilla, leftRunId, rightRunId, relPath? }`. |

Las respuestas JSON pertinentes llevan **ETag** débil y responden **304** si `If-None-Match` coincide.

### Paginación y `focusRunId` (`runs-page`)

Query estándar:

- **`cuadrilla`** (obligatorio): código de cuadrilla seguro (mismo criterio que en el resto de rutas).
- **`offset`**: índice base en la lista ordenada de `runId` descendente (entero ≥ 0).
- **`limit`**: tamaño de página (acotado por `DASHBOARD_LIMITS.maxRunsPerCuadrillaDefault`).

Query opcional:

- **`focusRunId`**: si el valor es un `runId` válido que **existe** en esa cuadrilla, el servidor **ignora** el `offset` solicitado y sustituye internamente el offset por  
  `floor(indexDelRun / limit) * limit`,  
  de modo que la página devuelta **contiene** ese run. La respuesta incluye el **`offset` efectivo** aplicado (campo `offset` del JSON) para que el cliente sincronice su estado de paginación.

Uso típico: enlaces compartidos o query string de la pestaña Métricas (`run=...`) donde el run puede estar fuera de la primera página. El dashboard envía `focusRunId` solo en la primera petición relevante tras cargar la URL; las páginas siguientes (`Anterior` / `Siguiente`) **no** envían `focusRunId` para no forzar la realineación.

Si `focusRunId` no existe en la cuadrilla o el segmento no pasa la validación, se descarta y se usa `offset`/`limit` normales.

Las acciones `preview`, `download`, `diff` y `diff-runs` añaden una línea JSON a **`_nifillos/logs/dashboard-audit.log`** (el directorio se crea si no existe).

## `usage.json`

Si en `cuadrillas/<id>/output/<runId>/usage.json` existen `inputTokens`, `outputTokens` y/o `totalTokens`, el dashboard trata los tokens como **registrados** y calcula el coste con `_nifillos/dashboard-pricing.json`. Si no, estima tokens a partir de pasos (`state.json`), número de agentes y `tokensPerStepEstimate` / `estimateInputShare`.

Opcional: arrays `byStep` / `steps` / `byAgent` / `agents` para un desglose en la respuesta (`usageBreakdown`).

## Precios (`_nifillos/dashboard-pricing.json`)

Campos usados:

- `eurPerMillionInputTokens`, `eurPerMillionOutputTokens`
- `tokensPerStepEstimate`, `estimateInputShare`
- `monthlyBudgetEur` (informativo en el JSON devuelto)
- `description`
- Opcional: `alertCostEur`, `alertTotalTokens` para marcar runs que superan umbrales en la UI

Plantilla empaquetada: `templates/_nifillos/dashboard-pricing.json`.

## Variables de entorno

| Variable | Uso |
|----------|-----|
| **`NIFILLOS_METRICS_API`** | URL base del servicio remoto (ej. `http://127.0.0.1:8787`). Con ella, Vite **no** monta el middleware local y usa **proxy** hacia ese origen. |
| **`NIFILLOS_METRICS_PORT`** | Puerto del servidor standalone (por defecto **8787**). |

## Servidor standalone

Desde `dashboard/`:

```bash
npm run metrics:serve
```

Arranca HTTP en **`127.0.0.1`** y el puerto de `NIFILLOS_METRICS_PORT` o **8787**, reutilizando la misma lógica que `tryHandleMetricsApi` con `repoRoot` padre de `dashboard/` y `cuadrillas/` en `repoRoot/cuadrillas/`.

Para el dashboard en modo dev apuntando a ese servidor:

```bash
set NIFILLOS_METRICS_API=http://127.0.0.1:8787
npm run dev
```

(En Unix: `export NIFILLOS_METRICS_API=http://127.0.0.1:8787`.)

## Seguridad

Los segmentos de ruta (`cuadrilla`, `runId`, partes de `relPath`) se validan con un patrón alfanumérico más `._-`, sin `..`. Los archivos se resuelven solo bajo `cuadrillas/<cuadrilla>/output/<runId>/`.

## `vite preview`

`vite preview` no ejecuta el plugin de desarrollo completo; para métricas en un entorno estático usa **`metrics:serve`** y **`NIFILLOS_METRICS_API`** o sirve el front detrás de un proxy que implemente la misma API.
