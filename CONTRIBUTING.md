# Contribuir a Nifillos

Estás contribuyendo a algo más grande que código.

Nifillos existe para liberar a empresas y equipos del trabajo repetitivo. Cada skill que creas, cada mejora que aportas, permite que emprendedores y equipos dediquen su tiempo a lo que las máquinas no pueden hacer: creatividad, relación humana y decisión.

No solo estás desarrollando un framework: estás cambiando la forma en que la gente trabaja.

---

## Bienvenida

Buscamos personas que entiendan nuestra misión: **liberar tiempo para el trabajo humano**.

### Qué es Nifillos

Nifillos es un framework de orquestación multi‑agente. Ayudamos a emprendedores y a perfiles no técnicos a crear equipos de agentes de IA que colaboran de forma automática.

### A quién buscamos

- Diseñadores de IA (prompts, orquestación de agentes)
- Desarrolladores (integraciones técnicas)
- Cualquier mezcla de lo anterior, siempre que compartas la visión del proyecto

Antes de empezar,  lee el [README](README.md).

---

## La regla de oro: verticaliza, no compliques

La forma correcta de contribuir es **verticalizar**: nuevas skills, agentes, cuadrillas y guías de buenas prácticas que amplíen lo que Nifillos puede hacer para negocios y creadores de contenido.

Nifillos funciona con `npx nifillos init` y listo. Un responsable de equipo, un dueño de negocio o un creador debe poder usarlo sin ser técnico. Queremos mantener esa sencillez.

El framework está pensado para ser **basado en archivos** y con **pocas dependencias**.

**Eso es diseño, no una limitación.**

## Qué sí aceptamos

- **Nuevas skills**: integraciones con plataformas, APIs y servicios (el tipo principal de contribución)
- **Nuevas guías de buenas prácticas**: dominio real (copy, diseño, SEO, email, redes, datos…)
- **Nuevos agentes**: definiciones reutilizables de agentes especializados
- **Plantillas de cuadrillas**: cuadrillas listas para casos de uso que la comunidad pueda importar
- **Corrección de bugs**: arreglar comportamiento roto
- **Rendimiento**: hacer más rápido lo que ya existe
- **Documentación**: README, ejemplos, guías
- **Internacionalización (i18n)**: locales o mejoras en `src/locales/`
- **Tests**: cobertura sobre funcionalidad existente

## Qué no encaja

Antes de programar, pregúntate: **«¿Esto ayuda a un emprendedor a hacer más en menos tiempo, o añade fricción?»**

Nifillos se usa con `npx nifillos init` y poco más. Esa simplicidad es intencional. Las contribuciones que vayan en otra dirección probablemente no se integren, pero podemos hablarlo: abre una [issue](https://github.com/JJRProDigital/nifillos/issues) antes para alinear expectativas.

Ejemplos de lo que **suele** no encajar:

- Sustituir el sistema basado en archivos por bases de datos (SQLite, Postgres…): el filesystem es la fuente de verdad por diseño
- Añadir infraestructura obligatoria (Docker, vectores, servidores extra): queremos cero setup más allá de Node.js
- Reescribir `_nifillos/core/`: mejor extender con skills y agentes
- Crecer mucho el árbol de dependencias: cada dependencia es una barrera
- Funcionalidades pensadas para **desarrollar software**: Nifillos automatiza procesos de negocio y contenido, no sustituye a tu IDE para construir apps

> ¿Tienes una idea que no encaja pero te parece valiosa? Abre una issue y lo comentamos. Las mejores ideas no siempre respetan las reglas.

## Ideas de contribución

¿No sabes por dónde empezar? Algunas ideas que a la comunidad le gustaría ver:

**Skills:**

- `tiktok-publisher` — publicar vídeos en TikTok vía API
- `linkedin-publisher` — publicar posts y artículos en LinkedIn
- `twitter-publisher` — publicar tweets e hilos en X/Twitter
- `youtube-uploader` — subir vídeos a YouTube
- `thumbnail-creator` — miniaturas para YouTube
- `email-sender` — campañas de email (Brevo, Mailchimp, etc.)
- `whatsapp-sender` — mensajes vía WhatsApp Business API
- `spreadsheet-analyzer` — análisis de hojas de cálculo e informes
- `video-clipper` — cortes verticales cortos con subtítulos
- `seo-auditor` — auditoría SEO para blogs y sitios
- `podcast-transcriber` — transcribir y resumir podcasts

**Guías de buenas prácticas:**

- Copy para páginas de ventas
- Planificación de lanzamientos de infoproductos
- Storytelling en redes
- Copy de anuncios (Meta Ads, Google Ads)
- Guiones de podcast
- Presentaciones y pitch decks

**Cuadrillas listas:**

- Producción de contenido para LinkedIn
- Generación de leads por email
- Análisis de métricas en redes
- Materiales de formación

## Primera contribución

¿Nuevo por aquí?

1. Mira el [vídeo de presentación](https://www.youtube.com/watch?v=CL1ppI4qHeU) para captar la visión del proyecto
2. Ejecuta `npx nifillos init` en una carpeta de prueba
3. Explora `skills/` y la estructura de cada `SKILL.md`
4. Busca issues con la etiqueta **`good first issue`**
5. Elige una issue (o una idea de la [lista anterior](#ideas-de-contribución)), comenta que la vas a tomar y adelante

No hace falta ser experto: curiosidad y ganas de aprender son lo importante.

## Cómo contribuir

### Proyectos antiguos (`squads`) y automatización externa

- **`npx nifillos update`** (en la raíz del proyecto usuario) ya ejecuta la migración de rutas y claves heredadas antes de refrescar plantillas.
- **`npx nifillos migrate`** hace solo esa migración (sin copiar el resto del framework desde el paquete).
- Si un usuario tiene **a la vez** `squads/` y `cuadrillas/`, el CLI **no** mezcla contenidos: hay que resolverlo manualmente y dejar una sola carpeta de trabajo (`cuadrillas/`).
- Cualquier **CI, script o documentación** que referencie el layout debe usar: carpeta **`cuadrillas/`**, archivos **`cuadrilla.yaml`** y **`cuadrilla-party.csv`**, y en JSON de estado/dashboard la propiedad **`cuadrilla`** (no `squads` ni `squad`).

### Crear una skill

Las skills son el principal punto de extensión. La mejor forma de contribuir es usar la skill `nifillos-skill-creator`:

```
/nifillos install nifillos-skill-creator
```

Estructura de carpetas:

```
skills/tu-skill/
  SKILL.md          (obligatorio: frontmatter YAML + instrucciones en Markdown)
  scripts/          (opcional)
  references/       (opcional)
  assets/           (opcional)
```

El formato completo está en [`skills/nifillos-skill-creator/references/skill-format.md`](skills/nifillos-skill-creator/references/skill-format.md).

Tipos: `mcp`, `script`, `hybrid`, `prompt`.

Al añadir una skill nueva, actualiza la tabla del catálogo en [`skills/README.md`](skills/README.md).

### Crear una guía de buenas prácticas

Nifillos ya incluye guías (copywriting, carruseles, SEO…), pero hay mucho por cubrir. Usa `nifillos-agent-creator`:

```
/nifillos install nifillos-agent-creator
```

Después de crearla, regístrala en [`_nifillos/core/best-practices/_catalog.yaml`](_nifillos/core/best-practices/_catalog.yaml). Comprueba que no exista ya algo muy similar.

### Crear una plantilla de cuadrilla

1. Crea el cuadrilla con `/nifillos create`
2. Pruébalo al menos 2–3 veces
3. Inclúyelo en la carpeta `cuadrillas/` de tu PR con descripción en `cuadrilla.yaml`

### Correcciones de bugs y rendimiento

1. Haz fork del repositorio
2. Crea una rama (`feat/mi-feature` o `fix/mi-fix`)
3. Aplica los cambios
4. Ejecuta los tests: `node --test`
5. Abre un PR

Para mejoras de rendimiento, incluye benchmarks antes/después en el PR.

### Documentación e i18n

- Los locales están en `src/locales/` (`en`, `es`)
- Si editas el README y hay varias lenguas, mantén la coherencia entre versiones
- Las skills pueden usar `description_es` (además de `description` en inglés)

## Reportar bugs

Abre una [issue](https://github.com/YOUR_ORG/nifillos/issues) con:

- **Descripción clara** del problema
- **Pasos para reproducir**
- **Comportamiento esperado** frente al **actual**
- **Entorno**: SO, versión de Node.js, IDE

## Sugerir funcionalidades

Antes de un PR grande con una feature nueva, abre una [issue](https://github.com/YOUR_ORG/nifillos/issues) para discutirla. Así se evita trabajo duplicado y se alinea con la dirección del proyecto.

Recuerda la [regla de oro](#la-regla-de-oro-verticaliza-no-compliques): prioriza skills, agentes y guías frente a cambiar la arquitectura.

## Configuración de desarrollo

```bash
git clone https://github.com/YOUR_ORG/nifillos.git
cd nifillos
npm install
node --test
```

Requisito: **Node.js 20+**

## Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/lang/es/):

| Prefijo   | Uso |
|-----------|-----|
| `feat:`   | Nueva skill, agente, guía o funcionalidad |
| `fix:`    | Corrección de bug |
| `docs:`   | Documentación |
| `chore:`  | Mantenimiento |
| `refactor:` | Reestructuración sin cambiar comportamiento |
| `perf:`   | Mejora de rendimiento |
| `test:`   | Tests |

Ejemplos:

```
feat: add tiktok-publisher skill
feat: add linkedin copywriting best-practice guide
fix: correct init copy for nested directories
docs: add Spanish translation for apify skill
```

## Pull requests

### Qué hace un buen PR

| Haz | Evita |
|-----|--------|
| Un cambio por PR | Mezclar temas no relacionados |
| Título y descripción claros | Explicaciones vagas o vacías |
| Referenciar issues | Reformatear archivos enteros sin necesidad |
| Commits pequeños y enfocados | Un commit gigante con todo |
| Trabajar en una rama | Commitear directo en `main` |

**Tamaño razonable:** unas 200–400 líneas. Por encima de ~800, divide en varios PRs para facilitar la revisión.

### Descripción del PR

Incluye:

- **Qué** — 1–2 frases sobre el cambio
- **Por qué** — motivación o issue relacionada
- **Cómo probar** — cómo validar el cambio

### Checklist

- [ ] `node --test` pasa
- [ ] Si añades una skill, actualicé `skills/README.md`
- [ ] Si añades una guía de buenas prácticas, actualicé `_catalog.yaml`
- [ ] Incluí ejemplo de uso en la descripción (si aplica)

## ¿Necesitas ayuda?

- Abre una [issue](https://github.com/YOUR_ORG/nifillos/issues) con tu duda

Intentamos responder PRs e issues en un plazo de **5 días laborables**.

## Código de conducta

Sé respetuoso, constructivo y colaborativo. Estamos aquí para construir algo útil entre todos.
