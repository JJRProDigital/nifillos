# Nifillos

CLI de orquestación multi-agente para tu IDE (licencia MIT). Incluye comando `/nifillos` en plantillas, instalación de skills por **id del paquete**, **ruta local** o **URL Git**, y metadatos leídos desde `skills/` del proyecto cuando la skill no está en el bundle.

## Requisitos

- Node.js **20+**

## Documentación

- **Guía paso a paso (~10 min, español):** [docs/guia-inicio-rapido.md](docs/guia-inicio-rapido.md) — init, IDE, primera cuadrilla, ejecución, dashboard, skills, MCP y migración `squads` → `cuadrillas`, con apartado de **seguridad** (secretos y Git).
- **Quick start (English):** [docs/quick-start.md](docs/quick-start.md)
- **CLI y catálogo de skills (español):** [docs/nifillos-comandos-y-skills.md](docs/nifillos-comandos-y-skills.md)
- **Copia en proyectos `init`:** [templates/GUIA.md](templates/GUIA.md) y [templates/GUIDE.md](templates/GUIDE.md) se copian a la raíz del proyecto del usuario; `npx nifillos update` las sobrescribe con la versión del paquete.
- **Dashboard — API de métricas:** [docs/dashboard-metrics.md](docs/dashboard-metrics.md)

## Uso rápido

Inicializar un proyecto (copia plantillas, skills empaquetadas, configuración por IDE):

```bash
npx nifillos init
```

Actualizar archivos del framework desde la versión instalada del paquete (respeta `_memory`, `cuadrillas`, etc.):

```bash
npx nifillos update
```

Para instalar o **actualizar el paquete desde GitHub** (rama por defecto del repo) y luego volcar plantillas y núcleo con la versión que acabas de instalar:

```bash
npm install -D git+https://github.com/JJRProDigital/nifillos.git
npx nifillos update
```

`update` también comprueba y migra el diseño antiguo. Si solo quieres esa migración sin copiar plantillas del paquete:

```bash
npx nifillos migrate
```



Skills:

```bash
npx nifillos skills
npx nifillos install apify
npx nifillos install ./ruta/a/mi-skill
npx nifillos install https://github.com/usuario/repo-skill.git
npx nifillos uninstall apify
```

Otros comandos: `npx nifillos agents …`, `npx nifillos runs [cuadrilla]`. Ver ayuda:

```bash
npx nifillos
```

## En el IDE

Tras `init`, abre el proyecto en Cursor, Claude Code, Codex, etc. y usa el comando slash **`/nifillos`** (menú, crear cuadrilla, ejecutar, skills, …). Los archivos concretos dependen del IDE (por ejemplo `.cursor/rules/nifillos.mdc`, `.claude/skills/nifillos/SKILL.md`).

## Extender el proyecto

| Qué quieres | Dónde / cómo |
|-------------|----------------|
| Nueva skill en el **paquete** publicado | Añade `skills/<id>/SKILL.md`, actualiza [skills/README.md](skills/README.md), sube versión en `package.json`. |
| Skill solo en un **proyecto** | Carpeta `skills/<id>/SKILL.md` o `npx nifillos install ./carpeta`. |
| **MCP / “plugins”** | Skills tipo `mcp` / `hybrid` y `.mcp.json` / `.cursor/mcp.json` / `.vscode/mcp.json` en plantillas (Playwright + Excalidraw HTTP); perfil Playwright bajo `_nifillos/config/`. |
| **Plantillas** | `templates/` (núcleo), `templates/ide-templates/<ide>/` (por IDE). |
| **Cuadrillas de ejemplo** | `templates/cuadrillas/` o documentación en tu repo. |

Convención de id de skill: `^[a-z0-9][a-z0-9-]*$`.

## Desarrollo local del paquete

```bash
git clone <tu-repo>
cd nifillos
npm install
npm test
npm run lint
```

### Dashboard (Vite + React)

En la carpeta `dashboard/` hay una UI con la pestaña **Oficina** (escena Pixi + WebSocket `/__cuadrillas_ws`) y la pestaña **Métricas** (runs, artefactos, diffs, auditoría). Desde la raíz del repo:

```bash
cd dashboard
npm install
npm run dev
```

La API **`/__cuadrillas_api/*`** la sirve el middleware de Vite en desarrollo. Si defines **`NIFILLOS_METRICS_API`** (URL de un backend remoto), el dashboard solo **proxifica** ese prefijo y no monta el handler local. Para un servidor HTTP autónomo de métricas:

```bash
cd dashboard
npm run metrics:serve
```

(puerto **`NIFILLOS_METRICS_PORT`** o **8787**). Detalle de rutas, `usage.json` y precios: [docs/dashboard-metrics.md](docs/dashboard-metrics.md).

Publicar en npm (ajusta `repository` y `bugs` en [package.json](package.json)):

```bash
npm publish --access public
```

Uso sin publicar:

```bash
npm link
nifillos init   # en la carpeta destino
```

## Licencia y atribución

MIT. Ver [LICENSE](LICENSE) y [NOTICE](NOTICE).

---

# Nifillos (English)

**nifillos** npm CLI for multi-agent cuadrillas in your IDE (MIT). Slash command **`/nifillos`**, skill install by **bundled id**, **local path**, or **git URL**, and `getSkillMeta` fallback to the project’s `skills/` folder.

**Walkthrough:** [docs/quick-start.md](docs/quick-start.md) (init → IDE → first cuadrilla → run → dashboard, skills, MCP, migration, **secrets/Git**). Spanish: [docs/guia-inicio-rapido.md](docs/guia-inicio-rapido.md).

```bash
npx nifillos init
npx nifillos update
npx nifillos migrate   
npx nifillos install <id|path|git-url>
```

To **pull the latest package from GitHub** and refresh templates/core:

```bash
npm install -D git+https://github.com/JJRProDigital/nifillos.git
npx nifillos update
```

`update` runs the same layout migration as `migrate` when  `cuadrillas/` exists. External automation (CI, scripts) should use paths **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, and dashboard/state field **`cuadrilla`** (not `squads` / `squad`).

**Web dashboard:** under `dashboard/`, run `npm install` and `npm run dev` for the **Office** (Pixi) + **Metrics** UI. Metrics API: `/__cuadrillas_api/*` (dev middleware), or set **`NIFILLOS_METRICS_API`** to proxy; optional **`npm run metrics:serve`** (see [docs/dashboard-metrics.md](docs/dashboard-metrics.md)).

IDE templates ship **Playwright** (stdio) and **Excalidraw** (`https://mcp.excalidraw.com/mcp`, HTTP) in `.mcp.json` / `.cursor/mcp.json` / `.vscode/mcp.json` where applicable; Codex and Antigravity are pointed to the same URL in their rules.

See [skills/README.md](skills/README.md) for the bundled catalog and extension notes.
