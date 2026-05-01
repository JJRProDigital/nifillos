# 🎨 CARRUSEL STUDIO — Skill de Claude

> Director creativo IA que produce carruseles de Instagram publishables, construyendo un sistema visual desde cero adaptado a tu marca.
>
> **Creado por [Ruva IA](https://www.youtube.com/@RuvaIA)** 🎙️

---

## ¿Qué hace este skill?

Convierte a Claude en **CARRUSEL STUDIO**, un director creativo y diseñador senior que te acompaña paso a paso para producir carruseles de Instagram (8-12 slides) **personalizados al estilo único de tu marca** — no genéricos, no plantillas reciclables.

En 60-90 minutos (la primera vez) o 30-45 min (las siguientes), Claude hace:

1. **Descubre tu marca** (5 preguntas + arquetipo)
2. **Construye tu sistema visual** desde cero (uno de 8 kits tipográficos curados + paleta + voz)
3. **Define el carrusel concreto** (tipo, objetivo, framework narrativo)
4. **Escribe el copy slide por slide** validando contigo en cada paso
5. **Genera el HTML standalone** con fuentes embebidas (no depende de internet)
6. **Renderiza 10 PNGs retina 2x** + ZIP listo para subir
7. **Escribe el caption** + hashtags + plan de publicación
8. **Te entrega tu sistema visual guardado** para reutilizar en próximos carruseles

---

## 🚀 Instalación rápida

### Paso 1 — Descarga el archivo `carrusel-studio.skill`

(Lo encuentras en la descripción/comentarios del video de Ruva IA donde se compartió este skill.)

### Paso 2 — Sube el skill a Claude.ai

1. Abre [claude.ai](https://claude.ai)
2. En la sidebar izquierda, busca **Skills** (o ve a **Settings → Capabilities → Skills**)
3. Click en **Upload Skill** (o **+ Add Skill**)
4. Selecciona el archivo `carrusel-studio.skill` que descargaste
5. Confirma la instalación

> ⚠️ **Requiere Plan Pro de Claude o superior** para usar Code Execution (necesario para renderizar los PNGs). Con plan gratuito puedes llegar hasta el HTML y descargarlo a tu navegador.

### Paso 3 — Generar las fuentes que faltan (opcional pero recomendado)

El skill viene con el **kit_08_y2k** ya empacado. Para activar los otros 7 kits tipográficos, una de estas dos opciones:

**Opción A — Pedírselo a Claude (más fácil):**

Inicia una conversación con Claude y escribe:
> *"Tengo el skill carrusel-studio instalado. Por favor genera las fuentes embebidas para todos los kits tipográficos que faltan, ejecutando el script `assets/generate_kit_fonts.py all`."*

Claude correrá el script desde Code Execution y generará los archivos.

**Opción B — Ejecutar el script localmente:**

```bash
# Necesitas Python 3 + requests
pip install requests

# Desde la carpeta del skill descomprimido
python assets/generate_kit_fonts.py all
```

### Paso 4 — Activar el skill

Inicia una nueva conversación en Claude y escribe algo como:

> *"Quiero hacer un carrusel de Instagram para mi marca [nombre], sobre [tema]"*

Claude debería identificarse como **CARRUSEL STUDIO** y empezar a hacerte preguntas sobre tu marca.

Si no se activa automáticamente, fuérzalo:

> *"Usa el skill carrusel-studio para hacerme un carrusel sobre [tema]"*

---

## 📋 Cómo funciona — Resumen del workflow

```
[FASE 0] Bienvenida (1 min)
    ↓
[FASE 1] Descubrimiento de marca — 5 preguntas + arquetipo (10-15 min)  ✓ Validar
    ↓
[FASE 2] Sistema visual — kit tipográfico + paleta (10-15 min)  ✓ Validar
    ↓
[FASE 3] Voz de marca — formalidad + emojis + lista negra (5-10 min)  ✓ Validar
    ↓
[FASE 4] Brief del carrusel — tema + tipo + objetivo (3-5 min)  ✓ Validar
    ↓
[FASE 5] Big Idea — 3 propuestas con ángulos distintos (5 min)  ✓ Validar
    ↓
[FASE 6] Estructura de slides — slide por slide (5 min)  ✓ Validar
    ↓
[FASE 7] Copy definitivo — headlines + body + accents (10-15 min)  ✓ Validar
    ↓
[FASE 8] HTML + render — PNGs retina 2x (10-15 min)
    ↓
[FASE 9] Caption + entrega final + sistema visual guardado (5 min)
```

**Para tu segundo carrusel**, escribe `@reusar [pega tu sistema visual guardado]` y Claude saltará directo a la Fase 4.

---

## 🎨 Los 8 kits tipográficos incluidos

| Kit | Mood | Para qué tipo de marca |
|---|---|---|
| 01 EDITORIAL | Sofisticado, magazine | Premium, fashion, lifestyle, branding studios |
| 02 MODERN CLEAN | Minimalista contemporáneo | SaaS, agencies, profesionales |
| 03 BRUTALIST | Crudo, rebelde | Música, arte underground, streetwear |
| 04 SERIF CLASSIC | Atemporal, literario | Educativas, consultoría intelectual, editorial |
| 05 PLAYFUL | Divertido, alegre | DTC fun, food, wellness alegre |
| 06 CORPORATE TECH | Confiable, técnico | B2B SaaS, fintech, enterprise |
| 07 WARMTH | Cálido, humano | Wellness, terapia, marcas conscientes |
| 08 Y2K NEO-RETRO | Retro-futurista, gen-z | Music, fashion juvenil, gaming |

Claude te recomienda el kit que mejor encaja según el arquetipo de tu marca (Maga, Sabia, Heroína, Cuidadora, Rebelde, Creadora, etc.) y siempre te da 1-2 alternativas para que elijas con criterio.

---

## ⚙️ Atajos de conversación

| Atajo | Qué hace |
|---|---|
| `@reusar [sistema]` | Salta Fases 1-3 y va directo al brief del nuevo carrusel |
| `@brief` | "Aquí va mi brief" |
| `@bigidea A` | Elije la propuesta A de Big Idea |
| `@copy` | Genera el copy completo |
| `@build` | Genera HTML + PNGs |
| `@express` | Modo rápido: combina fases (~30-40 min) |
| `@principiante` | Explica todo bien despacito |
| `@técnico` | Detalle técnico avanzado |
| `@iteración X` | Aplica cambios sobre lo entregado |

---

## 📁 Estructura del skill

```
carrusel-studio/
├── SKILL.md                              ← Instrucciones principales (lo que Claude lee primero)
├── README.md                             ← Este archivo
├── references/                           ← Knowledge base
│   ├── 01-descubrimiento-marca.md        ← 5 preguntas + 12 arquetipos
│   ├── 02-kits-tipograficos.md           ← 8 kits + decision tree
│   ├── 03-voz-y-tono.md                  ← 4 dimensiones + 5 fórmulas de hook + 3 templates de caption
│   ├── 04-frameworks-estructuras.md      ← 6 tipos de carrusel + 6 frameworks narrativos
│   ├── 05-template-html.md               ← CSS base + snippets + build script
│   ├── 06-workflow-operativo.md          ← Manual paso a paso de las 9 fases
│   └── 07-configuracion-tools.md         ← Atajos + casos de uso + troubleshooting
└── assets/
    ├── generate_kit_fonts.py             ← Script para generar fuentes faltantes
    └── kits_tipograficos/
        ├── kit_01_editorial/             ← Generar con script
        ├── kit_02_modern_clean/          ← Generar con script
        ├── kit_03_brutalist/             ← Generar con script
        ├── kit_04_serif_classic/         ← Generar con script
        ├── kit_05_playful/               ← Generar con script
        ├── kit_06_corporate_tech/        ← Generar con script
        ├── kit_07_warmth/                ← Generar con script
        └── kit_08_y2k/
            └── fonts_embedded.css        ← ✅ Ya viene con el skill
```

---

## 🔧 Troubleshooting rápido

| Problema | Solución |
|---|---|
| Claude no activa el skill | Forzarlo: *"Usa el skill carrusel-studio"* |
| HTML pesa <100KB | Le faltó embeber fuentes — verificar que el kit esté generado |
| Falta el archivo de fuentes para un kit | Correr `python assets/generate_kit_fonts.py kit_XX` |
| No tengo Plan Pro | Usa el botón ⬇ del HTML para descargar PNGs desde el navegador |
| Claude propone tipografías raras | Recordarle: *"usa SOLO los 8 kits del skill"* |

Para más, ver `references/07-configuracion-tools.md`.

---

## 🎁 ¿Te gustó? Comparte y suscríbete

Este skill es 100% gratuito y open-source. Si te sirvió:

- ⭐ Comparte el skill con tu comunidad
- 🎙️ Suscríbete al canal **Ruva IA** para más herramientas como esta
- 💬 Cuéntanos qué carruseles produjiste con el skill

---

## 📜 Licencia

Uso libre para creadores, emprendedores y comunidades educativas.

No vender este skill como producto propio. Atribución a Ruva IA al compartir.

---

**Hecho con 🤍 en español por Ruva IA — para que más creadores hispanohablantes hagan IG content de nivel sin contratar diseñador.**
