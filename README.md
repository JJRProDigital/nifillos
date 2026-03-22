# Nifillos

CLI de orquestación multi-agente para tu IDE (licencia MIT). Incluye comando `/nifillos` en plantillas, instalación de skills por **id del paquete**, **ruta local** o **URL Git**, y metadatos leídos desde `skills/` del proyecto cuando la skill no está en el bundle.

## Requisitos

- Node.js **20+**

## Uso rápido

Inicializar un proyecto (copia plantillas, skills empaquetadas, configuración por IDE):

```bash
npx nifillos init
```

Actualizar archivos del framework desde la versión instalada del paquete (respeta `_memory`, `cuadrillas`, etc.):

```bash
npx nifillos update
```

`update` también comprueba y migra el diseño antiguo: renombra `squads/` → `cuadrillas/`, `squad.yaml` → `cuadrilla.yaml`, `squad-party.csv` → `cuadrilla-party.csv` y la clave `squad` → `cuadrilla` en `state.json` bajo `cuadrillas/`. Si solo quieres esa migración sin copiar plantillas del paquete:

```bash
npx nifillos migrate
```

Si coexisten `squads/` y `cuadrillas/`, el CLI no fusiona carpetas: hay que unir o borrar `squads/` a mano; los arreglos por archivo se aplican solo bajo `cuadrillas/`.

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

```bash
npx nifillos init
npx nifillos update
npx nifillos migrate   # optional: squads/ → cuadrillas/ and legacy keys only
npx nifillos install <id|path|git-url>
```

`update` runs the same layout migration as `migrate` when `squads/` or `cuadrillas/` exists. External automation (CI, scripts) should use paths **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, and dashboard/state field **`cuadrilla`** (not `squads` / `squad`).

IDE templates ship **Playwright** (stdio) and **Excalidraw** (`https://mcp.excalidraw.com/mcp`, HTTP) in `.mcp.json` / `.cursor/mcp.json` / `.vscode/mcp.json` where applicable; Codex and Antigravity are pointed to the same URL in their rules.

See [skills/README.md](skills/README.md) for the bundled catalog and extension notes.
