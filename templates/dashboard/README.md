# Dashboard Nifillos (Vite + React)

Interfaz de **Oficina** (escena Pixi) y **Métricas** (runs, artefactos, diff y auditoría) del ecosistema Nifillos.

## Requisitos

- Node.js 20+ recomendado
- En el monorepo/ejemplos: rutas `cuadrillas/<código>/output/<runId>/` con `state.json` para que la API liste runs

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que indique Vite (por defecto `http://localhost:5173`). El servidor de desarrollo proxifica `/__cuadrillas_api` al backend de métricas (ver abajo).

## API de métricas (`/__cuadrillas_api`)

En otra terminal, desde esta carpeta:

```bash
npm run metrics:serve
```

Por defecto el proceso escucha en el puerto **8787** (`NIFILLOS_METRICS_PORT`). El plugin de Vite reenvía las peticiones salvo que definas un destino distinto.

### Variable `NIFILLOS_METRICS_API`

Si el servidor de métricas corre en otro host/puerto (por ejemplo en CI o un túnel), expón la URL base antes de `npm run dev`:

```bash
# Windows (PowerShell)
$env:NIFILLOS_METRICS_API = "http://127.0.0.1:8787"

# Unix
export NIFILLOS_METRICS_API=http://127.0.0.1:8787
```

Si está definida, el middleware local de métricas puede omitirse y todo el tráfico `/__cuadrillas_api` va al proxy (mensaje en consola del watcher).

## Build de producción

```bash
npm run build
npm run preview
```

Los artefactos quedan en `dist/`. Sirve ese directorio detrás de cualquier static host; la API debe seguir accesible en la misma ruta `/__cuadrillas_api` o configurar el proxy del hosting.

## Solución de problemas habituales

| Síntoma | Comprobación |
|--------|----------------|
| Métricas en blanco o errores de red | Confirma `npm run metrics:serve` y que no haya firewalls bloqueando el puerto; revisa consola del navegador (fallos `fetch` en `/__cuadrillas_api/...`). |
| 404 en preview/descarga de artefactos | Run y ruta relativos deben existir bajo `cuadrillas/.../output/<runId>/`. |
| Oficina sin personajes | Comprueba que el WebSocket/plugin de cuadrillas esté activo en `vite.config.ts` y que existan definiciones en `cuadrillas/`. |
| Deep link a un run no muestra la fila | La URL incluye `run=`; el cliente envía `focusRunId` en la primera petición paginada para alinear la página. Detalle en `docs/dashboard-metrics.md` (sección `focusRunId`). |

## Accesibilidad y rendimiento

- La pestaña **Métricas** se carga en diferido (`React.lazy`) para no penalizar la carga inicial de Oficina.
- Preferencias del sistema: animaciones del skeleton de gráficos se reducen con `prefers-reduced-motion`.
- Contraste: tokens `--text-secondary` y estados de diff pensados para tema claro/oscuro.

## Documentación adicional

En el repositorio raíz, `docs/dashboard-metrics.md` describe el contrato HTTP y los endpoints.
