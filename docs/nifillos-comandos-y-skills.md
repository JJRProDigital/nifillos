# Nifillos — Comandos CLI y uso de skills

Referencia en español del CLI `nifillos` y de las skills empaquetadas en el paquete. Requisito: **Node.js 20+**.

Tras `npx nifillos init`, el proyecto tiene `_nifillos/`, plantillas por IDE y (según plantilla) skills copiadas bajo `skills/<id>/`. Las rutas de scripts en esta guía asumen **raíz del proyecto** y carpeta `skills/<id>/`.

---

## Ayuda general

```bash
npx nifillos
```

Muestra el resumen de comandos si no pasas subcomando o si el comando no existe.

---

## Comandos principales

| Comando | Descripción |
|--------|-------------|
| `npx nifillos init` | Inicializa el proyecto: plantillas, skills del bundle, configuración por IDE. |
| `npx nifillos update` | Actualiza archivos del framework desde la versión del paquete instalada. También aplica migración de layout legacy (`squads/` → `cuadrillas/`, etc.) cuando aplica. |
| `npx nifillos migrate` | Solo migración legacy: renombra carpetas/archivos y claves (`squad` → `cuadrilla` en `state.json` bajo cuadrillas). No copia plantillas nuevas del paquete. |
| `npx nifillos install <id \| ruta \| git>` | Instala una skill: id del paquete, carpeta local con `SKILL.md`, o URL de repositorio Git. |
| `npx nifillos uninstall <id>` | Elimina la skill `skills/<id>/`. |
| `npx nifillos update <id-skill>` | Actualiza **solo** esa skill desde el bundle (debe estar ya instalada). |
| `npx nifillos skills` | Lista skills instaladas (equivale a `npx nifillos skills list`). |
| `npx nifillos skills list` | Igual: lista instaladas. |
| `npx nifillos skills install` | **No existe** — usar `npx nifillos install <id>`. |
| `npx nifillos skills remove` | **No existe** — usar `npx nifillos uninstall <id>`. |
| `npx nifillos skills update` | Actualiza **todas** las skills instaladas desde el bundle. |
| `npx nifillos agents` | Lista agentes instalados (`agents/*.agent.md`). |
| `npx nifillos agents list` | Igual. |
| `npx nifillos agents install <id>` | Instala un agente predefinido del paquete (si existe en `agents/<id>/AGENT.md` del npm). |
| `npx nifillos agents remove <id>` | Quita `agents/<id>.agent.md`. |
| `npx nifillos agents update` | Reinstala todos los agentes instalados desde el bundle. |
| `npx nifillos runs [nombre-cuadrilla]` | Muestra historial de ejecuciones (opcionalmente filtrado por cuadrilla). |

**Nota:** `npx nifillos skills` y `npx nifillos agents` requieren que exista `_nifillos/` (proyecto inicializado).

### Instalar skill desde origen distinto al id del paquete

```bash
npx nifillos install ./mi-skill-local
npx nifillos install https://github.com/org/repo-skill.git
```

El id de una skill solo puede contener `^[a-z0-9][a-z0-9-]*$`. Carpeta local: el **nombre de la carpeta** es el id.

---

## Cómo usar las skills (visión general)

1. **Instalar** (si no vino con `init`): `npx nifillos install <id>`.
2. **Leer** `skills/<id>/SKILL.md` en el proyecto: ahí están *cuándo usarla*, instrucciones y variables de entorno.
3. Según el **tipo** en el frontmatter:
   - **mcp** / **hybrid**: el IDE debe tener configurado el servidor MCP (p. ej. `.mcp.json`, `.cursor/mcp.json` según plantilla). La skill documenta `server_name`, `command`, `args` o `url`.
   - **script**: ejecutar el runtime indicado (`python3`, `node`, …) contra la ruta bajo `skills/<id>/` (ver `script.invoke` en el YAML o la sección de comandos del SKILL).
   - **prompt**: no ejecuta binarios; el agente del IDE sigue el texto de `SKILL.md`.

4. **Variables de entorno**: muchas skills listan `env:` en el frontmatter; conviene un `.env` en la raíz del proyecto (ver `.env.example` si existe).

---

## Catálogo de skills empaquetadas

Tabla resumen. Para detalle operativo, abre `skills/<id>/SKILL.md` en el repo del paquete o en tu proyecto tras instalar.

| Id | Tipo | Variables de entorno | Uso resumido |
|----|------|----------------------|--------------|
| `apify` | mcp | `APIFY_TOKEN` | Scraping y Actors vía MCP (`npx -y @apify/actors-mcp-server@latest`). |
| `canva` | mcp | OAuth Canva | Diseños Canva por MCP HTTP (`https://mcp.canva.com/mcp`). |
| `blotato` | mcp | `BLOTATO_API_KEY` | Publicar/programar redes vía MCP HTTP + cabecera API. |
| `image-creator` | mcp | _(ninguna)_ | HTML/CSS → PNG con Playwright (servidor MCP `playwright`). |
| `image-fetcher` | hybrid | _(ninguna)_ | Búsqueda de imágenes, screenshots con Playwright, organización de assets. |
| `image-generator` | script | `OPENROUTER_API_KEY` | Imágenes con IA (OpenRouter); ver `scripts/generate.py`. |
| `instagram-publisher` | script | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | Carrusel Instagram; `scripts/publish.js` con Node y `.env`. |
| `pdf-export` | script | _(ninguna)_ | PDF desde URL/HTML (Playwright) o ReportLab (`html`, `doc`, `direct`). |
| `nifillos-skill-creator` | prompt | _(ninguna)_ | Crear/mejorar skills y evaluaciones. |
| `nifillos-agent-creator` | prompt | _(ninguna)_ | Best practices / biblioteca `_nifillos/core/best-practices/`. |

### Tipos de skill

- **mcp** — Integración con un servidor MCP en el IDE.
- **script** — Script local (Python, Node, …).
- **hybrid** — MCP + instrucciones adicionales.
- **prompt** — Solo Markdown de comportamiento para el agente.

---

## Comandos concretos por skill tipo script

Sustituye rutas de salida por las de tu cuadrilla (`cuadrillas/<nombre>/output/...`) cuando corresponda.

### `image-generator`

Solo necesita Python 3 (usa biblioteca estándar y `urllib`); no hay `requirements.txt` en la skill.

```bash
python3 skills/image-generator/scripts/generate.py \
  --prompt "Descripción de la imagen" \
  --output "ruta/salida/imagen.jpg" \
  --mode test
```

- `--mode production` para calidad final (más coste).
- `--reference ruta/logo.png` para imagen de referencia.
- `--batch ruta/batch.json` para lote.

Requiere `OPENROUTER_API_KEY`.

### `instagram-publisher`

```bash
node --env-file=.env skills/instagram-publisher/scripts/publish.js \
  --images "img1.jpg,img2.jpg" \
  --caption "Texto del post"
```

- `--dry-run` para probar sin publicar.
- JPEG, 2–10 imágenes. Ver SKILL para límites y setup de Meta.

### `pdf-export`

Setup una vez: `pip install -r skills/pdf-export/requirements.txt` y `playwright install chromium`.

```bash
# URL → PDF
python3 skills/pdf-export/scripts/pdf_export.py html --url "https://ejemplo.com" -o salida.pdf

# HTML local
python3 skills/pdf-export/scripts/pdf_export.py html --html-file ./doc.html -o salida.pdf

# Documento flujo (platypus)
python3 skills/pdf-export/scripts/pdf_export.py doc --title "Título" --body "Cuerpo" -o salida.pdf

# PDF directo (Canvas, sin archivo fuente)
python3 skills/pdf-export/scripts/pdf_export.py direct --title "Informe" --line "Línea 1" -o salida.pdf
```

Más modos (`--spec-json`, `direct` con ops, stdin): ver `skills/pdf-export/SKILL.md`.

---

## Skills MCP (resumen de uso en el agente)

No se invocan por un solo comando de terminal universal: el **cliente MCP del IDE** arranca el servidor según la config del proyecto.

| Skill | Servidor / transporte | Notas |
|-------|------------------------|--------|
| `apify` | stdio, `npx @apify/actors-mcp-server` | Token en entorno `APIFY_TOKEN`. |
| `canva` | HTTP `https://mcp.canva.com/mcp` | OAuth en el flujo Canva. |
| `blotato` | HTTP + API key en cabecera | `BLOTATO_API_KEY`. |
| `image-creator` | MCP `playwright` | Servidor Playwright del proyecto (plantillas suelen incluirlo). |
| `image-fetcher` | Playwright + instrucciones | Combinación de herramientas web y Playwright. |

Tras cambiar MCP, reinicia el IDE o recarga servidores MCP según tu editor.

---

## Skills solo prompt

| Id | Cuándo usarla |
|----|----------------|
| `nifillos-skill-creator` | Diseñar o iterar `SKILL.md`, tipos mcp/script/hybrid/prompt, evals. |
| `nifillos-agent-creator` | Crear o mantener archivos de best-practice bajo `_nifillos/core/best-practices/`. |

El agente debe **cargar o seguir** el contenido de `skills/<id>/SKILL.md` cuando el usuario pide esa tarea.

---

## Agentes (`npx nifillos agents`)

Los agentes empaquetados viven en el paquete npm bajo `agents/<id>/AGENT.md` y se copian a `agents/<id>.agent.md` al instalar.

```bash
npx nifillos agents
npx nifillos agents install <id>
npx nifillos agents remove <id>
npx nifillos agents update
```

Si tu copia del paquete no incluye la carpeta `agents/`, la lista de ids disponibles vendrá vacía hasta que se añadan en el repositorio del paquete.

---

## En el IDE

- Comando slash **`/nifillos`** (según plantilla): menú, cuadrillas, ejecución, skills.
- Reglas y skills por IDE: p. ej. `.cursor/rules/nifillos.mdc`, `.claude/skills/nifillos/SKILL.md`, etc.

---

## Documentación relacionada

- [README principal](../README.md) — visión general y migración `cuadrillas`.
- [skills/README.md](../skills/README.md) — catálogo y cómo añadir skills al paquete.
- [skills/nifillos-skill-creator/references/skill-format.md](../skills/nifillos-skill-creator/references/skill-format.md) — formato de `SKILL.md`.

---

*Última revisión alineada con el CLI en `bin/nifillos.js` y el catálogo en `skills/README.md`.*
