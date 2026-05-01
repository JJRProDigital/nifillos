# Nifillos — catálogo de skills (empaquetadas)

Las skills empaquetadas viven en la carpeta `skills/` de este paquete y se copian al proyecto con `npx nifillos init` o `npx nifillos install <id>`.

## Instalación

```bash
npx nifillos install <skill-name>
```

También puedes instalar desde una carpeta local (debe contener `SKILL.md`; el nombre de la carpeta es el id de la skill):

```bash
npx nifillos install ./mi-skill-local
```

O desde un repositorio Git (un solo skill en la raíz o en un único subdirectorio con `SKILL.md`):

```bash
npx nifillos install https://github.com/org/repo.git
```

Los metadatos de skills instaladas solo en el proyecto (sin copia en el paquete) se leen desde `skills/<id>/SKILL.md` al listar con `npx nifillos skills`.

## Skills disponibles en este paquete

| Skill | Type | Description | Env Vars | Install |
|-------|------|-------------|----------|---------|
| [apify](./apify/) | mcp | Web scraping and automation platform. | `APIFY_TOKEN` | `npx nifillos install apify` |
| [canva](./canva/) | mcp | Create, search, autofill, and export designs from Canva. | _(OAuth)_ | `npx nifillos install canva` |
| [instagram-publisher](./instagram-publisher/) | script | Publish Instagram carousel posts via Graph API. | `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID` | `npx nifillos install instagram-publisher` |
| [blotato](./blotato/) | mcp | Publish and schedule posts across social platforms. | `BLOTATO_API_KEY` | `npx nifillos install blotato` |
| [image-fetcher](./image-fetcher/) | hybrid | Acquire visual assets via search, screenshots, files. | _(none)_ | `npx nifillos install image-fetcher` |
| [image-creator](./image-creator/) | mcp | Render HTML/CSS to PNG via Playwright. | _(none)_ | `npx nifillos install image-creator` |
| [image-generator](./image-generator/) | script | Generate AI images via Openrouter. | `OPENROUTER_API_KEY` | `npx nifillos install image-generator` |
| [pdf-export](./pdf-export/) | script | PDF desde URL/HTML (Playwright); flujo o Canvas directo sin archivo fuente (.txt/.doc). | _(none)_ | `npx nifillos install pdf-export` |
| [nifillos-skill-creator](./nifillos-skill-creator/) | prompt | Crea nuevas skills (formato SKILL.md). | _(none)_ | `npx nifillos install nifillos-skill-creator` |
| [nifillos-agent-creator](./nifillos-agent-creator/) | prompt | Crea guías de best practices / agentes. | _(none)_ | `npx nifillos install nifillos-agent-creator` |
| [market-audit](./market-audit/) | prompt | Auditoría de marketing integral (`/market audit <url>`); informe MARKETING-AUDIT.md. | _(none)_ | `npx nifillos install market-audit` |
| [market-social](./market-social/) | prompt | Calendario y contenido social 30 días (`/market social <topic/url>`); SOCIAL-CALENDAR.md. | _(none)_ | `npx nifillos install market-social` |
| [market-landing](./market-landing/) | prompt | Análisis CRO de landing (`/market landing <url>` / `/market cro <url>`). | _(none)_ | `npx nifillos install market-landing` |

## Tipos de skill

- **mcp** — Integración con servidor MCP
- **script** — Scripts locales
- **hybrid** — MCP + scripts
- **prompt** — Solo instrucciones en Markdown

## Añadir una skill al paquete npm

1. Carpeta bajo `skills/<id>/` con `SKILL.md` (frontmatter YAML válido).
2. Actualiza la tabla de este README.
3. Publica una nueva versión del paquete `nifillos`.

## Estructura de directorio

Ver `skills/nifillos-skill-creator/references/skill-format.md` para el formato completo de `SKILL.md`.
