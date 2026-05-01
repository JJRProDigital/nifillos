# Guía de inicio rápido (~10 minutos)

Recorrido único en este proyecto: IDE, cuadrillas, dashboard, skills, MCP y migraciones. Para el **código fuente y más documentación** del framework, visita el [repositorio Nifillos en GitHub](https://github.com/JJRProDigital/nifillos).

**Requisito:** [Node.js 20+](https://nodejs.org/).

---

## 1. Tu proyecto Nifillos

Esta carpeta se creó con **`npx nifillos init`**. En una **máquina o carpeta nueva**, ejecuta de nuevo ese comando donde quieras el proyecto.

Para **actualizar** plantillas y el núcleo `_nifillos/` desde el paquete npm que tengas instalado:

```bash
npx nifillos update
```

Para **solo** migrar nombres antiguos (`squads/` → `cuadrillas/`, etc.) sin refrescar todo el framework desde el paquete:

```bash
npx nifillos migrate
```

---

## 2. Abrir el proyecto en tu IDE

Abre **esta carpeta** como raíz del proyecto (donde está `_nifillos/`).

En **Cursor**, **Claude Code**, **Codex**, **Antigravity** o **VS Code + Copilot**, el punto de entrada es:

```
/nifillos
```

Ahí está el menú: crear cuadrilla, ejecutar, skills, ayuda, etc. Los archivos concretos dependen del IDE (`.cursor/rules/`, `.claude/skills/`, …).

---

## 3. Crear tu primera cuadrilla

**A.** Desde **`/nifillos`**, elige crear cuadrilla.

**B.** En lenguaje natural, por ejemplo:

```
/nifillos crea una cuadrilla para [describe en una frase lo que necesitas]
```

El **Arquitecto** hará preguntas y generará archivos bajo `cuadrillas/<nombre>/`.

---

## 4. Ejecutar la cuadrilla

```
/nifillos ejecuta la cuadrilla <nombre-de-la-cuadrilla>
```

(o el equivalente en inglés si tu plantilla está en inglés).

El **Pipeline Runner** ejecuta el pipeline. Los **checkpoints** pausan el flujo para que apruebes o elijas. Los entregables suelen estar en `cuadrillas/<nombre>/output/…`.

---

## 5. (Opcional) Dashboard «oficina virtual»

1. En el IDE: pide el dashboard (p. ej. desde **`/nifillos`**).
2. En la terminal, en la raíz del proyecto:

   ```bash
   npx serve cuadrillas/<nombre-de-la-cuadrilla>/dashboard
   ```

3. Abre la URL que muestre la consola (suele ser `http://localhost:3000`).

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

Revisa `.mcp.json`, `.cursor/mcp.json` o `.vscode/mcp.json` (según lo que te haya copiado `init`).

- **Playwright:** navegador (Sherlock, capturas, algunas skills).
- **Excalidraw:** diagramas por MCP HTTP.

Si falla la conexión, comprueba `npx` y el firewall.

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

## Seguridad: secretos y Git

- **No subas** API keys, tokens ni contraseñas en archivos del repo (p. ej. `.mcp.json` con `Authorization` o tokens embebidos).
- Usa **`.env`** (suele estar en `.gitignore`) para variables que pidan las skills.
- Para MCP, preferible **variables de entorno** o ajustes **solo en tu máquina**. Revisa `git status` antes de hacer commit.

Si filtraste un secreto, **revócalo en el proveedor** y, si hace falta, limpia el historial de Git.

---

## Dónde seguir leyendo

| Tema | Enlace |
|------|--------|
| Resumen de uso | [README.md](README.md) |
| Catálogo de skills | [skills/README.md](skills/README.md) |
| Instrucciones del IDE (Claude Code) | `CLAUDE.md` (si existe en esta carpeta) |
| Código y documentación del framework | [github.com/JJRProDigital/nifillos](https://github.com/JJRProDigital/nifillos) |

**English:** [GUIDE.md](GUIDE.md)

---

## Resumen

**Abrir proyecto → `/nifillos` → crear cuadrilla → ejecutar cuadrilla**; skills, MCP, dashboard y migración cuando los necesites.
