# Guía de inicio rápido (≈10 minutos)

Un solo recorrido: desde cero hasta tener una cuadrilla ejecutándose, con enlaces al detalle técnico cuando haga falta.

**Requisito:** [Node.js 20+](https://nodejs.org/).

---

## 1. Crear el proyecto Nifillos

En una carpeta vacía (o la que usarás como proyecto):

```bash
npx nifillos init
```

El asistente pregunta idioma, tu nombre, IDE(s) y copia plantillas, carpeta `skills/` del paquete y configuración del editor. Si es la primera vez, puede instalar dependencias del dashboard y Chromium para Playwright (tarda un poco).

**Qué obtienes:** `_nifillos/`, `cuadrillas/`, `skills/`, archivos del IDE elegido (por ejemplo reglas de Cursor o skills de Claude Code).

---

## 2. Abrir el proyecto en tu IDE

Abre **la raíz del proyecto** (donde está `_nifillos/`).

En **Cursor**, **Claude Code**, **Codex**, **Antigravity** o **VS Code + Copilot**, el punto de entrada es el comando slash:

```
/nifillos
```

Ahí aparece el menú: crear cuadrilla, ejecutar, skills, ayuda, etc. Los archivos exactos dependen del IDE (`.cursor/rules/`, `.claude/skills/`, …).

---

## 3. Crear tu primera cuadrilla

Opción A — desde el menú **`/nifillos`**, elige crear cuadrilla.

Opción B — en lenguaje natural, por ejemplo:

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

El **Pipeline Runner** recorre los pasos del pipeline. Donde haya **checkpoints**, el flujo se pausa para que apruebes o elijas.

Los entregables suelen guardarse en `cuadrillas/<nombre>/output/…`.

---

## 5. (Opcional) Dashboard «oficina virtual» y métricas

### Dashboard del proyecto (`dashboard/`)

Para la **oficina 2D** (WebSocket) y la pestaña **Métricas** (runs, artefactos, diff):

```bash
cd dashboard
npm install   # solo la primera vez
npm run dev
```

Abre la URL de Vite (p. ej. `http://localhost:5173`). API de métricas: en `dashboard/`, `npm run metrics:serve`; variable opcional **`NIFILLOS_METRICS_API`**. Documentación: [dashboard-metrics.md](./dashboard-metrics.md) y `dashboard/README.md` en proyectos tras `init`.

### Sitio estático por cuadrilla

Si existe `cuadrillas/<nombre>/dashboard/` como estático:

```bash
npx serve cuadrillas/<nombre-de-la-cuadrilla>/dashboard
```

---

## 6. Skills adicionales

Las skills ya empaquetadas están en `skills/`. Para instalar más (por id del paquete, carpeta local o Git):

```bash
npx nifillos install <id>
npx nifillos skills
```

Referencia completa de CLI y catálogo: [nifillos-comandos-y-skills.md](./nifillos-comandos-y-skills.md) y [skills/README.md](../skills/README.md).

---

## 7. MCP (Playwright, Excalidraw, etc.)

Las skills **mcp** y **hybrid** dependen de servidores MCP. Tras `init`, revisa `.mcp.json`, `.cursor/mcp.json` o `.vscode/mcp.json` (según plantilla) y la **configuración local del IDE** si usas plugins MCP.

- **Playwright:** automatización de navegador (Sherlock, capturas, algunas skills).
- **Excalidraw:** diagramas vía MCP HTTP.

Catálogo y tipo de cada skill: [nifillos-comandos-y-skills.md](./nifillos-comandos-y-skills.md) y [skills/README.md](../skills/README.md). Variables de entorno: frontmatter de `skills/<id>/SKILL.md`.

Si algo no conecta, comprueba que Node pueda ejecutar `npx` y que no bloquee el firewall.

---

## 8. Proyectos antiguos (`squads/`)

Si venías de una versión con carpetas **`squads/`** y **`squad.yaml`**:

```bash
npx nifillos update
```

…aplica migración y actualiza plantillas. Solo migración, sin refrescar todo el framework desde el paquete:

```bash
npx nifillos migrate
```

Norma actual: **`cuadrillas/`**, **`cuadrilla.yaml`**, **`cuadrilla-party.csv`**, y en estado/dashboard la clave **`cuadrilla`**. Si coexisten `squads/` y `cuadrillas/`, hay que unificar a mano; el CLI no fusiona carpetas.

---

## Seguridad: secretos y Git

- **No subas API keys, tokens ni contraseñas** en archivos que vayan al repositorio (p. ej. `.mcp.json` con cabeceras `Authorization`, tokens en JSON, etc.).
- El proyecto suele incluir **`.env` en `.gitignore`**: pon ahí variables que lean tus skills (`APIFY_TOKEN`, claves de OpenRouter, Instagram, …).
- Para MCP, usa variables de entorno o configuración **solo local** del IDE cuando sea posible; revisa qué archivos están trackeados con `git status` antes de hacer commit.
- No subas perfiles de navegador automatizado (p. ej. **`_nifillos/_browser_profile/`**, suele estar en `.gitignore`).
- Las **plantillas del paquete** Nifillos deben llevar **placeholders** o URLs públicas, no tus secretos personales.

Si compartiste un secreto por error en Git, **rótalo en el proveedor** (revocar token) además de borrarlo del historial si procede.

---

## Dónde seguir leyendo

| Tema | Documento |
|------|-----------|
| README del paquete | [README.md](../README.md) |
| Instrucciones para el asistente en repo | [CLAUDE.md](../CLAUDE.md) |
| Contribuir | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Planes y diseños | [plans/](plans/) |
| Misma guía en proyectos tras `npx nifillos init` | `GUIA.md` y `GUIDE.md` en la **raíz del proyecto** (plantillas en [`templates/GUIA.md`](../templates/GUIA.md) y [`templates/GUIDE.md`](../templates/GUIDE.md)) |

---

## Resumen en una frase

**`npx nifillos init` → abrir carpeta en el IDE → `/nifillos` → crear cuadrilla → ejecutar cuadrilla**; el resto (skills, MCP, dashboard, migración) es ampliación cuando lo necesites.
