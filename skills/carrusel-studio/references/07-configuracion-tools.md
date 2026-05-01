# 07 — CONFIGURACIÓN Y USO DEL SKILL
## Cómo usar el skill CARRUSEL STUDIO + atajos + troubleshooting

---

## 1. CÓMO ACTIVAR EL SKILL

Este skill se activa automáticamente cuando mencionas en tu conversación con Claude cualquiera de estos contextos:

- "Quiero hacer un carrusel de Instagram"
- "Necesito un post de Instagram en formato carrusel"
- "Ayúdame con slides para IG"
- "Quiero diseñar contenido para Instagram"
- Mencionas "Carrusel Studio" directamente

Cuando el skill se activa, Claude se identifica como **CARRUSEL STUDIO** y arranca el flujo desde la Fase 0 (bienvenida).

Si Claude no activa el skill automáticamente, puedes forzarlo escribiendo:
> "Usa el skill carrusel-studio para hacerme un carrusel sobre [tema]"

---

## 2. REQUISITOS TÉCNICOS

| Capacidad | ¿Necesario? | Para qué |
|---|---|---|
| **Plan Pro de Claude (o superior)** | ✅ Recomendado | Para Code Execution (Python + render Playwright) |
| **Artifacts** | ✅ Necesario | Entregar HTML, código, previews |
| **Code Execution / File Creation** | ✅ Necesario | Generar HTML, PNGs, ZIPs |
| **Plan gratuito** | ⚠️ Limitado | Puedes llegar hasta Fase 7 (copy). Sin Code Execution no puedes renderizar PNGs. |

**Si tienes plan gratuito:** Puedes descargar el HTML generado y abrirlo en tu navegador local. El HTML incluye un botón `⬇ DESCARGAR LOS 10 SLIDES` que renderiza los PNGs desde tu propio navegador con html2canvas.

---

## 3. ASSETS INCLUIDOS EN EL SKILL

```
carrusel-studio/
├── SKILL.md                              ← Instrucciones principales
├── references/                           ← Knowledge base (consultada por Claude)
│   ├── 01-descubrimiento-marca.md
│   ├── 02-kits-tipograficos.md
│   ├── 03-voz-y-tono.md
│   ├── 04-frameworks-estructuras.md
│   ├── 05-template-html.md
│   ├── 06-workflow-operativo.md
│   └── 07-configuracion-tools.md
└── assets/
    ├── generate_kit_fonts.py             ← Script para generar fuentes faltantes
    └── kits_tipograficos/
        ├── kit_01_editorial/             ← (vacío — generar con script)
        ├── kit_02_modern_clean/          ← (vacío — generar con script)
        ├── kit_03_brutalist/             ← (vacío — generar con script)
        ├── kit_04_serif_classic/         ← (vacío — generar con script)
        ├── kit_05_playful/               ← (vacío — generar con script)
        ├── kit_06_corporate_tech/        ← (vacío — generar con script)
        ├── kit_07_warmth/                ← (vacío — generar con script)
        └── kit_08_y2k/
            └── fonts_embedded.css        ← ✅ Ya incluido (~175 KB)
```

### Para generar los kits que faltan

El skill viene con el **kit_08_y2k** ya empacado y listo para usar. Los otros 7 kits requieren ejecutar el script una sola vez:

```bash
# Genera todos los kits (recomendado)
python assets/generate_kit_fonts.py all

# O genera solo el que necesitas
python assets/generate_kit_fonts.py kit_01_editorial
```

Esto descarga las fuentes desde Google Fonts y las codifica en base64 inline. Tamaño total tras generar todos: ~2 MB.

**Si no quieres correr el script:** Puedes pedirle a Claude en la conversación: *"Generá las fuentes embebidas para el kit_X usando Google Fonts y descargándolas en base64."* Claude puede hacerlo dentro de Code Execution.

---

## 4. ATAJOS Y SHORTCUTS DE CONVERSACIÓN

Para acelerar el workflow:

| Shortcut | Significado |
|---|---|
| `@reusar [sistema visual]` | "Ya tengo sistema visual, salta a brief del carrusel" |
| `@brief` | "Aquí va mi brief, procesa Fase 4" |
| `@bigidea A` | "Elijo propuesta A de Big Idea" |
| `@estructura` | "Procede a generar la estructura" |
| `@copy` | "Genera el copy completo" |
| `@build` | "Procede a generar HTML + render PNGs" |
| `@caption A` | "Usa template A (personal/vulnerable)" |
| `@express` | "Modo express: combina fases, máximo 30-40 min" |
| `@iteración X` | "Cambios: [describe cambios sobre lo entregado]" |
| `@principiante` | "Soy principiante, explícame todo bien despacito" |
| `@técnico` | "Quiero detalle técnico avanzado" |
| `@mockup` | "Muéstrame visualmente cómo se vería con [opción]" |

---

## 5. CASOS DE USO ESPECIALES

### Caso 1: Primer carrusel de la marca

Usuario nuevo, no tiene sistema visual. Workflow completo (60-90 min):
- Fases 0-9 sin saltos
- Al final, GUARDAR el sistema visual creado

### Caso 2: Carrusel 2 en adelante

Usuario ya tiene sistema visual. Workflow rápido (35-45 min):
- `@reusar` con el sistema guardado
- Saltar a Fase 4
- Ejecutar Fases 4-9

### Caso 3: Cambiar paleta para un carrusel especial

Usuario quiere variar paleta para un post específico (ej. lanzamiento, fecha especial):
- Comenzar con `@reusar` del sistema base
- En Fase 6, especificar variación de paleta
- El sistema base no cambia, solo este carrusel usa variante

### Caso 4: Producir 5 carruseles del mes

Usuario quiere planear contenido del mes:
1. Hacer Fases 1-3 una vez (sistema visual base)
2. Para cada uno de los 5 temas, solo Fases 4-5 (brief + Big Idea)
3. Validar las 5 Big Ideas juntas
4. Producir uno completo, validar
5. Producir los otros 4 en serie

### Caso 5: Re-skinar carrusel viejo

Usuario tiene un carrusel exitoso y quiere re-publicarlo con nueva paleta:
- Saltar Fases 1-7 (mismo copy, misma estructura)
- Solo cambiar Fase 6 (decisión de paleta nueva)
- Re-build (Fase 8) con nuevas CSS variables
- Re-publicar con nuevo caption (Fase 9)

---

## 6. LÍMITES DEL SKILL

### Lo que SÍ hace

- ✅ Producir carruseles end-to-end del brief al PNG
- ✅ Construir sistema visual desde cero según marca
- ✅ Variar estructura según tipo de carrusel
- ✅ Adaptar paletas y fuentes según marca
- ✅ Embeber fuentes para HTML offline
- ✅ Generar caption + plan de publicación
- ✅ Guardar el sistema visual para reutilización

### Lo que NO hace

- ❌ Reels o video corto
- ❌ Imágenes IA fotorrealistas
- ❌ Diseño de logos
- ❌ Estrategia de marketing completa
- ❌ Subir directo a Instagram (manual)
- ❌ Trackear métricas automáticamente
- ❌ Programar publicaciones

### Si necesitas algo fuera del scope

Pídele a Claude que use otro skill o haga la tarea directamente sin este skill. Este skill debe enfocarse en lo que hace bien.

---

## 7. TROUBLESHOOTING

| Síntoma | Causa probable | Solución |
|---|---|---|
| Claude propone tipografías de fuera de los 8 kits | No leyó `02-kits-tipograficos.md` | Recordar: "usa SOLO los 8 kits del skill" |
| Caption usa palabras prohibidas | No leyó la lista negra del usuario | Recordar: "valida contra MI lista negra" |
| Claude impone tono mexicano cuando mi marca no es mexicana | Voice por default mal aplicado | En Fase 3, especifica claramente tu regionalismo |
| HTML pesa <100KB | No embebió fuentes del kit | Verifica que cargaste el `fonts_embedded.css` correcto |
| Slides con tipografía fallback | Olvidó `document.fonts.ready` | Verificar script Python (timeout +2500ms) |
| Claude salta fases de descubrimiento | Modo @express implícito | Pedir explícitamente fase a fase |
| El kit elegido no encaja con mi marca | Recomendación incorrecta | Volver a Fase 1, especificar más adjetivos |
| "No encuentro el archivo de fuentes para kit_X" | El kit no está generado todavía | Correr `python assets/generate_kit_fonts.py kit_X` |

---

## 8. EVOLUCIÓN DEL SKILL

Este skill es un sistema vivo. Cada carrusel publicado mejora tu uso del sistema.

**Reglas de iteración del usuario:**

1. Si una palabra/frase no funcionó → agregar a tu lista negra
2. Si un kit no encaja → probar el alternativo de KB_02
3. Si un framework funcionó muy bien → usarlo más seguido
4. Si tu marca evoluciona → actualizar el sistema visual

**No iteres en:**

- Sistema técnico core (HTML structure, fuentes embebidas, snippets)
- Workflow de 9 fases (es lo que garantiza calidad)
- Reglas de copy (lista negra general, hooks, etc.)

Estos son los cimientos. Cambiarlos rompe el sistema.

---

## 9. PRÓXIMOS PASOS DESPUÉS DE INSTALAR

1. **Test con tu marca real** — produce tu primer carrusel siguiendo el workflow completo
2. **Guarda tu sistema visual** — al final de la Fase 9
3. **Programa la publicación** — usa Meta Business Suite o tu herramienta preferida
4. **Mide resultados** — anota saves, shares, comments después de 24h y 7 días
5. **Itera** — el segundo carrusel será 50% más rápido

Si después de 5 carruseles los resultados no escalan, revisa primero: hooks (KB_03) y estructuras (KB_04).

---

## 10. CRÉDITOS

Este skill es una creación de **Ruva IA** — comunidad enfocada en aplicar Inteligencia Artificial para creadores y emprendedores hispanohablantes.

🎙️ Canal: **Ruva IA**

Si te sirve este skill, compártelo con tu comunidad y déjanos saber qué carruseles produjiste.
