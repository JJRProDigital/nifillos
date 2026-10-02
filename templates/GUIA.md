# Guía de inicio rápido (~10 minutos)

Guía canónica (en el repo y copiada a los proyectos de usuario por `init`/`update`). Para el **código fuente y más documentación**, visita el [repositorio Nifillos en GitHub](https://github.com/JJRProDigital/nifillos).

**Requisito:** [Node.js 20+](https://nodejs.org/).

---

## 1. Crea tu proyecto Nifillos

En una carpeta vacía (o la que usarás como proyecto):

```bash
npx nifillos init
```

El asistente pregunta idioma, tu nombre, IDE(s) y copia plantillas, carpeta `skills/` del paquete y configuración del editor. Si es la primera vez, puede instalar dependencias del dashboard y Chromium para Playwright (tarda un poco).

**Qué obtienes:** `_nifillos/`, `cuadrillas/`, `skills/`, archivos del IDE elegido (por ejemplo reglas de Cursor o skills de Claude Code).

**¿Proyecto ya creado?** Mantenlo al día y migra:

```bash
npx nifillos update    # refresca plantillas y núcleo _nifillos/ desde el paquete instalado
npx nifillos migrate   # solo migración de nombres antiguos (squads/ → cuadrillas/), sin refrescar nada más
```

Tras un `update`, si usas el **dashboard**, instala de nuevo sus dependencias: `cd dashboard && npm install`.

---

## 2. Abre el proyecto en tu IDE

Abre **la raíz del proyecto** (donde está `_nifillos/`).

En **Cursor**, **Claude Code**, **Codex**, **OpenCode**, **Antigravity** o **VS Code + Copilot**, el punto de entrada es el comando slash:

```
/nifillos
```

Ahí aparece el menú: crear cuadrilla, ejecutar, skills, ayuda, etc. Los archivos exactos dependen del IDE (`.cursor/rules/`, `.claude/skills/`, …).

---

## 3. Crear tu primera cuadrilla

**A.** Desde **`/nifillos`**, elige crear cuadrilla.

**B.** En lenguaje natural, por ejemplo:

```
/nifillos crea una cuadrilla para [describe en una frase lo que necesitas]
```

El **Arquitecto** hará preguntas y generará archivos bajo `cuadrillas/<nombre>/` (pipeline, agentes, `cuadrilla.yaml`, …).

---

## 4. Ejecutar la cuadrilla

```
/nifillos ejecuta la cuadrilla <nombre-de-la-cuadrilla>
```

(o el equivalente en inglés si tu plantilla está en inglés).

El **Pipeline Runner** ejecuta el pipeline. Los **checkpoints** pausan el flujo para que apruebes o elijas. Los entregables suelen estar en `cuadrillas/<nombre>/output/…`.

---

## 5. (Opcional) Dashboard

Hay **dos** contextos habituales:

### A. Dashboard del proyecto (oficina 2D + métricas)

En la raíz hay una carpeta `dashboard/` (Vite + React). Para ver la **Oficina** (estado en vivo) y **Métricas** (runs, artefactos, vista previa, diff):

```bash
cd dashboard
npm install    # solo la primera vez
npm run dev    # desarrollo; o npm start para build + servidor standalone
```

Abre la URL que indique Vite (suele ser `http://localhost:5173`). Si la API de métricas va aparte: en `dashboard/`, `npm run metrics:serve`; opcionalmente define **`NIFILLOS_METRICS_API`** si usas otro host/puerto. Resumen técnico: `dashboard/README.md` en tu proyecto; en el repo del paquete también existe [docs/dashboard-metrics.md](https://github.com/JJRProDigital/nifillos/blob/master/docs/dashboard-metrics.md).

### B. Sitio estático dentro de una cuadrilla

Si una cuadrilla trae su propia carpeta `cuadrillas/<nombre>/dashboard/` (HTML estático), puedes servirla así:

```bash
npx serve cuadrillas/<nombre-de-la-cuadrilla>/dashboard
```

---

## 6. Skills adicionales

Las skills empaquetadas están en `skills/`. Para instalar más:

```bash
npx nifillos install <id>
npx nifillos skills
```

- **Catálogo local:** [skills/README.md](skills/README.md)
- **Referencia amplia del CLI** (en el repo del paquete): [docs en GitHub](https://github.com/JJRProDigital/nifillos/tree/master/docs)

---

## 7. MCP (Playwright, Excalidraw, etc.)

Las skills **mcp** o **hybrid** suelen necesitar servidores MCP. Tras `init`, revisa los JSON del proyecto (p. ej. `.mcp.json`, `.cursor/mcp.json`, `.vscode/mcp.json`, `opencode.json`, según IDE) **y** la configuración local del IDE si añadiste plugins MCP.

- **Playwright:** navegador (Sherlock, capturas, varias skills).
- **Excalidraw:** diagramas vía MCP HTTP.

Listado de skills y tipo: `npx nifillos skills` y [skills/README.md](skills/README.md). Si algo no conecta, comprueba `npx`, firewall y variables de entorno que pida cada skill (véase frontmatter en `skills/<id>/SKILL.md`).

---

## 8. Proyectos antiguos (`squads/`)

Si aún tienes **`squads/`** o **`squad.yaml`**:

```bash
npx nifillos update
```

o solo migración:

```bash
npx nifillos migrate
```

Norma actual: **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, clave **`cuadrilla`** en estado. Si conviven `squads/` y `cuadrillas/`, unifica a mano; el CLI no fusiona carpetas.

---

## 9. Diagnóstico y validación

- **`npx nifillos doctor`** — diagnostica tu instalación: versiones CLI/framework, archivos de tus IDEs, perfil de empresa, skills, navegador de Playwright y dashboard.
- **`npx nifillos validate [cuadrilla]`** — valida `cuadrilla.yaml` (schema, agentes, party y archivos de pipeline) con errores concretos por ruta.

---

## Seguridad: secretos y Git

- **No subas** API keys, tokens ni contraseñas en archivos del repo (p. ej. `.mcp.json` con `Authorization` o tokens embebidos).
- Usa **`.env`** (suele estar en `.gitignore`) para variables que pidan las skills (`APIFY_TOKEN`, claves de OpenRouter, Instagram, etc.).
- Para MCP, preferible **variables de entorno** o ajustes **solo en tu máquina** / ajustes locales del IDE. Revisa `git status` antes de hacer commit.
- No commitees perfiles de navegador automatizado (p. ej. carpeta **`_nifillos/_browser_profile/`**, suele ignorarse en `.gitignore`).
- Las **plantillas del paquete** deben llevar placeholders, no secretos reales.

Si filtraste un secreto, **revócalo en el proveedor** y, si hace falta, limpia el historial de Git.

---

## Dónde seguir leyendo

| Tema | Enlace |
|------|--------|
| Resumen de uso | [README.md](README.md) |
| Catálogo de skills | [skills/README.md](skills/README.md) |
| Instrucciones del IDE (Claude Code) | `CLAUDE.md` (si existe en esta carpeta) |
| Código y documentación del framework | [github.com/JJRProDigital/nifillos](https://github.com/JJRProDigital/nifillos) |
| Contribuir | [CONTRIBUTING.md](https://github.com/JJRProDigital/nifillos/blob/master/CONTRIBUTING.md) |

**English:** [GUIDE.md](GUIDE.md)

---

## Resumen

**`npx nifillos init` → abrir proyecto → `/nifillos` → crear cuadrilla → ejecutar cuadrilla**; skills, MCP, dashboard, migración y diagnóstico cuando los necesites.
