# KB_06 — WORKFLOW OPERATIVO
## Manual paso a paso de las 9 fases — De brief a publicación

---

## 1. ESTIMACIÓN DE TIEMPO POR FASE

| Fase | Nombre | Primera vez | Carruseles siguientes |
|---|---|---|---|
| 0 | Bienvenida | 1 min | — |
| 1 | Descubrimiento de marca | 10-15 min | — (saltar con @reusar) |
| 2 | Sistema visual | 10-15 min | — (saltar con @reusar) |
| 3 | Voz de marca | 5-10 min | — (saltar con @reusar) |
| 4 | Brief del carrusel | 5 min | 5 min |
| 5 | Big Idea | 5 min | 5 min |
| 6 | Estructura | 5 min | 5 min |
| 7 | Copy | 10-15 min | 10-15 min |
| 8 | HTML + Render | 10-15 min | 10-15 min |
| 9 | Caption + Entrega | 5 min | 5 min |
| **TOTAL** | | **60-90 min** | **35-45 min** |

**La primera vez es más larga porque construyes el sistema visual desde cero. Después se reutiliza.**

---

## 2. FASE 0 — BIENVENIDA

Solo en la primera conversación con un usuario nuevo. Salúdalo y explica el flujo. NO pidas brief en este momento — déjalo respirar.

---

## 3. FASE 1 — DESCUBRIMIENTO DE MARCA [✓ VALIDAR]

Consulta KB_01_DESCUBRIMIENTO_DE_MARCA.md para el detalle completo.

### Inputs requeridos

Las 5 preguntas obligatorias + 2-3 de profundización según contexto.

### Reglas críticas

- ✅ Pregunta en bloques de 1-2, no las 5 de golpe
- ✅ Insiste cuando las respuestas son vagas
- ✅ Identifica el arquetipo dominante
- ✅ Presenta el PERFIL DE MARCA antes de avanzar

### Output esperado

PERFIL DE MARCA validado por el usuario.

### Si el usuario es muy principiante

Pregúntale si quiere un mini-tutorial de 3 conceptos (qué es jerarquía, paleta, voz) antes de empezar. Toma 5 min extra pero le ayuda mucho.

---

## 4. FASE 2 — SISTEMA VISUAL [✓ VALIDAR]

Consulta KB_02_KITS_TIPOGRAFICOS.md.

### Proceso

1. Identificar kit recomendado según arquetipo (decision tree de KB_02)
2. Presentar tu recomendación + 1-2 alternativas
3. Si el usuario duda, ofrecer renderizar mockup visual
4. Confirmar paleta (puede ser la del kit o ajustada según marca)
5. Confirmar si hay fotos

### Output esperado

```
SISTEMA VISUAL DE [MARCA]:
Kit: [kit_id]
Familias: [display, body, mono]
Paleta:
  --black: [hex]
  --cream: [hex]
  --accent: [hex]
  --neon: [hex]
Estilo de fotografía: [descripción]
```

### Errores comunes

- ❌ Recomendar el kit que TÚ usas en vez del que la marca necesita
- ❌ No mostrar alternativas (el usuario debe elegir con criterio)
- ❌ Asumir que el usuario sabe diferencias técnicas entre fuentes

---

## 5. FASE 3 — VOZ DE MARCA [✓ VALIDAR]

Consulta KB_03_VOZ_Y_TONO_PERSONALIZADO.md.

### Proceso

Pregunta 4 dimensiones (formalidad, regionalismo, emojis, lista negra). Aplica las técnicas de extracción si el usuario no sabe articular su voz.

### Output esperado

```
VOZ DE [MARCA]:
- Formalidad: [tuteo / vos / usted]
- Regionalismo: [permitido / neutral / X]
- Emojis: [frecuencia + tipo]
- Palabras prohibidas: [lista]
- Vocabulario clave: [palabras propias]
```

### Errores comunes

- ❌ Imponer el tono Ruva (tuteo mexicano cálido) cuando la marca es de coaching ejecutivo formal
- ❌ Saltarse esta fase pensando que "voz se nota en el copy" — no, debe ser explícita

---

## 6. FASE 4 — BRIEF DEL CARRUSEL [✓ VALIDAR]

Inputs requeridos:

| Campo | Pregunta | Si falta |
|---|---|---|
| Tema | "¿De qué quieres hablar en este carrusel?" | Insistir |
| Tipo | "¿Es educativo, case study, lista, storytelling, contrarian o anuncio?" | Mostrar los 6 con 1 ejemplo cada uno |
| Objetivo | "¿Saves, shares, comentarios, leads?" | Default: saves + shares |
| Lead magnet | "¿Lead magnet en comentarios?" | Si sí: pedir palabra clave + qué se entrega |
| Imágenes | "¿Hay fotos o solo tipográfico?" | Default: solo tipográfico |

### Output esperado

```
BRIEF VALIDADO:
- Tema: [tema]
- Tipo: [tipo]
- Objetivo: [objetivo]
- Lead magnet: [sí/no - palabra clave]
- Imágenes: [sí/no - cuáles]
```

---

## 7. FASE 5 — BIG IDEA [✓ VALIDAR]

### Proceso

Genera 3 propuestas distintas (segura, punzante, lateral). Cada una con:

```
PROPUESTA [A/B/C]
Titular potencial: "[texto del slide 1]"
Por qué funciona: [insight estratégico en 1 línea]
Mejor para: [tipo de audiencia]
```

### Validación

Usuario elige A, B o C. O dice "mezcla A y B" o "dame otra opción". Itera máximo 2 veces.

### Errores comunes

- ❌ Las 3 propuestas son variaciones del mismo ángulo
- ❌ No explicar el "por qué funciona" de cada una

---

## 8. FASE 6 — ESTRUCTURA DE SLIDES [✓ VALIDAR]

Consulta KB_04_FRAMEWORKS_Y_ESTRUCTURAS.md para elegir framework + estructura.

### Output esperado

```
ESTRUCTURA — [N] SLIDES (Framework: [X])

S01 - HERO       | [tipo visual] | Mensaje: [1 línea]
S02 - RE-HOOK    | [tipo visual] | Mensaje: [1 línea]
...
S(N) - CTA       | [tipo visual] | Mensaje: [1 línea]
```

### Reglas

- Total slides: 7-12 según tipo
- Variación visual: al menos 1 slide cream o accent
- S1 y S(N) son los más críticos

### Validación

Usuario valida estructura. Itera máximo 2 veces.

---

## 9. FASE 7 — COPY DEFINITIVO [✓ VALIDAR]

### Proceso

Escribe copy slide por slide:

```
## SLIDE 01 — HERO

Tag: * GUÍA · X

Hero principal:
"[Título línea 1]
[Título línea 2]"

Subtitle:
"[Subtitle texto] [palabras en accent]"

(notas técnicas si aplica)
```

### Reglas

- Aplica TODAS las reglas de KB_03 (palabras prohibidas, voz, tono)
- Usa las 5 fórmulas de hook de KB_03
- Cada slide con longitud apropiada
- Italic accents solo en frases memorables (1-3 oraciones)

### Validación

Usuario valida copy completo. Cambios menores se aplican inmediato.

### Errores comunes

- ❌ Usar palabras de la lista negra DEL USUARIO (verificar antes de entregar)
- ❌ Hero S1 demasiado largo (>12 palabras)
- ❌ Body sin la formalidad correcta (usteo vs tuteo)
- ❌ CTA genérico

---

## 10. FASE 8 — HTML + RENDER

### Proceso técnico

```
1. Construir HTML usando KB_05:
   - Cargar fuentes embebidas del kit elegido (kits_tipograficos/{kit_id}/fonts_embedded.css)
   - CSS base con design tokens según paleta del usuario
   - 10 secciones <section class="slide" data-slide="NN">
   - Botón .dl-bar para descarga preview

2. Si hay imágenes, convertir a base64 e inyectar inline

3. Guardar en /mnt/user-data/outputs/{marca-slug}-{tema}.html

4. Renderizar con Playwright:
   - viewport: 1080x1350
   - device_scale_factor: 2 (retina)
   - wait: document.fonts.ready + 2500ms
   - Hide .dl-bar antes de capture
   - Export como PNG por slide

5. Crear ZIP de los 10 PNGs

6. Generar montage 2x5 para validación visual
```

### Output esperado

```
✅ ENTREGABLES GENERADOS:

1. HTML standalone:
   /mnt/user-data/outputs/{marca}-{tema}.html ({tamaño} KB)

2. 10 PNGs retina:
   /mnt/user-data/outputs/slides/{marca}-{tema}-slide-NN.png

3. ZIP:
   /mnt/user-data/outputs/{marca}-{tema}-10-slides.zip

4. Montage preview:
   /mnt/user-data/outputs/preview-montage.png
```

### Validación

Antes de pasar a Fase 9, usuario ve montage y aprueba. Cambios visuales menores se aplican y re-renderiza. Cambios mayores vuelven a Fase 6 o 7.

### Errores comunes

- ❌ Olvidar embeber las fuentes (HTML pesa <100KB → no funcionará offline)
- ❌ Usar pesos que no existen en el kit (genera fake bold)
- ❌ No ocultar .dl-bar antes de capture
- ❌ device_scale_factor: 1 (PNGs salen pixelados)

---

## 11. FASE 9 — CAPTION + ENTREGA FINAL [✓ VALIDAR]

### Proceso

1. Identificar template de caption (KB_03 sección 5):
   - A — Personal/vulnerable
   - B — Contrarian/autoridad
   - C — Educativo/método

2. Adaptar template a la voz del usuario (KB_03 sección 6)

3. Si hay lead magnet, integrar bloque

4. Validar contra checklist:
   - [ ] Hook en primeras 6 palabras
   - [ ] Sin palabras prohibidas DEL USUARIO
   - [ ] Doble salto entre bloques
   - [ ] Lead magnet con palabra clave clara (si aplica)
   - [ ] Pregunta final específica
   - [ ] 5 hashtags nicho

5. Entregar paquete final + GUARDAR el sistema visual:

```
📦 PAQUETE DE PUBLICACIÓN — [MARCA] CARRUSEL [N]

1. Imágenes: ZIP con 10 PNGs (orden 01 a 10)
2. Caption: [bloque copiable]
3. Hashtags: [lista]
4. Configuración:
   - Hora ideal: [martes-jueves 9-11 AM o 7-9 PM tu zona]
   - Comentarios: activados
5. Plan respuesta primeras 24h: [si hay lead magnet]

---

💾 SISTEMA VISUAL DE [MARCA] — GUARDA ESTO PARA REUTILIZAR:

Kit tipográfico: [kit_id]
Paleta:
  --black: [hex]
  --cream: [hex]
  --accent: [hex]
  --neon: [hex]
Voz: [resumen]
Lista negra: [palabras]

La próxima vez que quieras un carrusel, inicia con: "@reusar [pega aquí este sistema]"
```

---

## 12. CHECKLIST DE CALIDAD FINAL

Antes de declarar el carrusel terminado:

### Calidad visual
- [ ] Tipografías del kit elegido sin pesos sintéticos
- [ ] Text-align: left en todos los hero blocks
- [ ] Slide nums correctos
- [ ] Logo presente en footer (si el usuario tiene)
- [ ] Vignette en slides con foto
- [ ] Ghost numbers en slides numerados
- [ ] Paleta consistente

### Calidad copy
- [ ] Sin palabras de lista negra DEL USUARIO
- [ ] Hook detiene scroll
- [ ] Voz consistente con KB_03 del usuario
- [ ] CTA específico

### Calidad técnica
- [ ] HTML > 400KB (fuentes embebidas)
- [ ] PNGs retina 2x (2160x2700)
- [ ] ZIP de los 10 PNGs
- [ ] Caption con estructura validada
- [ ] Sistema visual GUARDADO para reutilización

---

## 13. MODO @REUSAR (carruseles 2 en adelante)

Cuando el usuario ya hizo este Project antes:

```
Usuario: "@reusar [pega sistema visual guardado de la sesión anterior]"
```

Tú:
1. Cargas las decisiones (kit, paleta, voz)
2. Saltas Fases 1-3
3. Vas directo a Fase 4 (brief del nuevo carrusel)

Esto reduce tiempo de 60-90 min a 35-45 min.

---

## 14. INDICADORES DE QUE EL SISTEMA FUNCIONA

Después de 3-5 carruseles del mismo usuario, deberías ver:

- ✅ Tiempo bajando: de 90 min a 40 min consistentemente
- ✅ Usuario reconoce su propio estilo en los carruseles
- ✅ Engagement creciente en sus posts
- ✅ El sistema visual guardado es estable (no cambia mucho)

Si el usuario quiere cambiar el sistema visual a fondo, vuelve a Fase 1 — está evolucionando su marca.
