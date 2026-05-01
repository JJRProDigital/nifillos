# KB_02 — KITS TIPOGRÁFICOS
## 8 sistemas tipográficos pre-curados para distintos tipos de marca

---

## 1. POR QUÉ KITS PRE-CURADOS

Elegir tipografías es lo MÁS difícil para usuarios intermedios. Hay 1500+ Google Fonts y mezclarlas mal arruina cualquier diseño. Por eso curamos 8 kits que SÍ funcionan juntos.

Cada kit tiene:
- **Display** (títulos hero) — la fuente "estrella" que da personalidad
- **Body** (texto cuerpo) — la fuente legible para descripciones
- **Mono** (UI/datos) — la fuente técnica para detalles editoriales

Las 3 fuentes de cada kit ya están **probadas como pareja**. No las mezcles entre kits sin razón muy clara.

---

## 2. DECISION TREE — QUÉ KIT ELEGIR

Para cada marca, sigue este árbol según el arquetipo identificado en KB_01:

| Si el arquetipo es... | Kit recomendado | Alternativa |
|---|---|---|
| Sabia | KIT_04 SERIF CLASSIC | KIT_01 EDITORIAL |
| Amante | KIT_01 EDITORIAL | KIT_04 SERIF CLASSIC |
| Maga | KIT_01 EDITORIAL | KIT_08 Y2K |
| Heroína | KIT_03 BRUTALIST | KIT_02 MODERN CLEAN |
| Forajida | KIT_03 BRUTALIST | KIT_08 Y2K |
| Exploradora | KIT_03 BRUTALIST | KIT_02 MODERN CLEAN |
| Gobernante | KIT_06 CORPORATE TECH | KIT_04 SERIF CLASSIC |
| Inocente | KIT_07 WARMTH | KIT_02 MODERN CLEAN |
| Cuidadora | KIT_07 WARMTH | KIT_05 PLAYFUL |
| Cómplice | KIT_05 PLAYFUL | KIT_07 WARMTH |
| Bromista | KIT_05 PLAYFUL | KIT_08 Y2K |
| Creadora | KIT_05 PLAYFUL | KIT_01 EDITORIAL |

Cuando recomiendes un kit, di: "Por tu arquetipo X, te recomiendo el KIT [N] [NOMBRE] porque [1 línea de por qué]. Como alternativa, KIT [M] [NOMBRE] también te quedaría."

---

## 3. KIT 01 EDITORIAL — EDITORIAL

**Filosofía:** Sofisticado. Para marcas premium, fashion, lifestyle, branding studios.

**Mood/sensación:** Elegante, refinado, magazine-style

**Marcas que se sienten así:** Vogue, Standards Manual, Order, Gentlewoman

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Anton** | display | 400 normal |
| **Instrument Serif** | serif-italic | 400 italic |
| **Inter** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **JetBrains Mono** | mono | 500 normal, 600 normal |

### Paleta sugerida

```css
:root {
  --black: #0A0A0A;
  --cream: #F2EBDD;
  --accent: #E94822;
  --neon: #E8FF00;
}
```

### Cuándo usar este kit
- Marcas premium o de luxo
- Branding studios y agencias creativas
- Lifestyle, fashion, hospitalidad
- Cuando quieres feel 'magazine de moda'

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_01_editorial/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Anton', sans-serif;
  --f-serif: 'Instrument Serif', serif;
  --f-body: 'Inter', system-ui, sans-serif;
  --f-mono: 'JetBrains Mono', monospace;
}
```

---

## 4. KIT 02 MODERN CLEAN — MODERN CLEAN

**Filosofía:** Minimalista contemporáneo. Para marcas SaaS, agencies, profesionales.

**Mood/sensación:** Limpio, neutral, profesional sin ser corporativo

**Marcas que se sienten así:** Linear, Notion, Vercel, Stripe

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Space Grotesk** | display | 500 normal, 600 normal, 700 normal |
| **Inter** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **IBM Plex Mono** | mono | 400 normal, 500 normal |

### Paleta sugerida

```css
:root {
  --black: #111111;
  --cream: #F5F5F0;
  --accent: #5B5BFF;
  --neon: #C5FF45;
}
```

### Cuándo usar este kit
- SaaS, productos digitales, tech
- Agencias y consultoras modernas
- Marcas profesionales sin querer ser corporativas
- Cuando la limpieza visual importa más que la personalidad

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_02_modern_clean/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Space Grotesk', sans-serif;
  --f-body: 'Inter', system-ui, sans-serif;
  --f-mono: 'IBM Plex Mono', monospace;
}
```

---

## 5. KIT 03 BRUTALIST — BRUTALIST

**Filosofía:** Crudo, rebelde. Para marcas alternativas, música, diseño underground.

**Mood/sensación:** Industrial, anti-establishment, raw

**Marcas que se sienten así:** KANYE merch, Berghain, brutalist websites

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Archivo** | display | 800 normal, 900 normal |
| **Archivo** | body | 400 normal, 500 normal, 600 normal |
| **Space Mono** | mono | 400 normal, 700 normal |

### Paleta sugerida

```css
:root {
  --black: #000000;
  --cream: #EFEFEF;
  --accent: #FF3B00;
  --neon: #00FF00;
}
```

### Cuándo usar este kit
- Marcas alternativas, música, arte underground
- Productos juveniles disruptivos
- Cuando querés impactar y romper convenciones
- Streetwear, gaming alternativo, eventos contracultura

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_03_brutalist/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Archivo', sans-serif;
  --f-body: 'Archivo', system-ui, sans-serif;
  --f-mono: 'Space Mono', monospace;
}
```

---

## 6. KIT 04 SERIF CLASSIC — SERIF CLASSIC

**Filosofía:** Atemporal, literario. Para marcas educativas, libros, consultoría intelectual.

**Mood/sensación:** Sofisticado-clásico, libro de tapa dura, autoridad

**Marcas que se sienten así:** NY Times, Harvard, The Atlantic, editorial publishing

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Playfair Display** | display | 400 normal, 700 normal, 900 normal |
| **EB Garamond** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **Courier Prime** | mono | 400 normal, 700 normal |

### Paleta sugerida

```css
:root {
  --black: #1A1411;
  --cream: #F5EFE3;
  --accent: #8B1A1A;
  --neon: #D4A82B;
}
```

### Cuándo usar este kit
- Marcas educativas y editoriales
- Consultoría intelectual, academia
- Marcas con autoridad histórica o intelectual
- Cuando querés feel 'libro de tapa dura' o 'NY Times'

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_04_serif_classic/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Playfair Display', sans-serif;
  --f-body: 'EB Garamond', system-ui, sans-serif;
  --f-mono: 'Courier Prime', monospace;
}
```

---

## 7. KIT 05 PLAYFUL — PLAYFUL

**Filosofía:** Divertido, alegre. Para creadores, food, niños, marcas DTC fun.

**Mood/sensación:** Amigable, accesible, con personalidad

**Marcas que se sienten así:** Glossier, Liquid Death, Oatly, Aesop

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Syne** | display | 500 normal, 600 normal, 700 normal, 800 normal |
| **Manrope** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **DM Mono** | mono | 400 normal, 500 normal |

### Paleta sugerida

```css
:root {
  --black: #1F1A2E;
  --cream: #FFF4E0;
  --accent: #FF6B9D;
  --neon: #FFE45E;
}
```

### Cuándo usar este kit
- Productos para jóvenes adultos (25-40)
- Marcas DTC con personalidad
- Food, wellness alegre, productos digitales fun
- Cuando querés diversión sin perder profesionalismo

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_05_playful/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Syne', sans-serif;
  --f-body: 'Manrope', system-ui, sans-serif;
  --f-mono: 'DM Mono', monospace;
}
```

---

## 8. KIT 06 CORPORATE TECH — CORPORATE TECH

**Filosofía:** Confiable, técnico. Para fintech, B2B SaaS, consultoras tech.

**Mood/sensación:** Confiable, sólido, técnicamente competente

**Marcas que se sienten así:** IBM, Salesforce, Rippling, modern enterprise

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Red Hat Display** | display | 500 normal, 600 normal, 700 normal, 900 normal |
| **Red Hat Display** | body | 400 normal, 500 normal |
| **Red Hat Mono** | mono | 400 normal, 500 normal |

### Paleta sugerida

```css
:root {
  --black: #0F1419;
  --cream: #F1F5F9;
  --accent: #0066FF;
  --neon: #00D4FF;
}
```

### Cuándo usar este kit
- B2B SaaS, fintech, enterprise software
- Consultoras tech, integradores
- Marcas que necesitan transmitir solidez técnica
- Cuando la confianza vale más que la diferenciación

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_06_corporate_tech/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Red Hat Display', sans-serif;
  --f-body: 'Red Hat Display', system-ui, sans-serif;
  --f-mono: 'Red Hat Mono', monospace;
}
```

---

## 9. KIT 07 WARMTH — WARMTH

**Filosofía:** Cálido, humano. Para wellness, terapia, marcas conscientes.

**Mood/sensación:** Acogedor, terroso, calmante

**Marcas que se sienten así:** Bookshop.org, slow living, wellness brands

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Fraunces** | display | 400 normal, 600 normal, 700 normal, 900 normal |
| **Karla** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **DM Mono** | mono | 400 normal, 500 normal |

### Paleta sugerida

```css
:root {
  --black: #2A1F18;
  --cream: #F5EAD7;
  --accent: #C77D2C;
  --neon: #9CB071;
}
```

### Cuándo usar este kit
- Wellness, terapia, coaching, marcas conscientes
- Productos artesanales y slow living
- Marcas femeninas cálidas (sin caer en cliché 'femenino')
- Cuando querés generar calma y cercanía

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_07_warmth/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Fraunces', sans-serif;
  --f-body: 'Karla', system-ui, sans-serif;
  --f-mono: 'DM Mono', monospace;
}
```

---

## 10. KIT 08 Y2K — Y2K NEO-RETRO

**Filosofía:** Nostálgico, hyper-modern. Para marcas creativas, music, fashion juvenil.

**Mood/sensación:** Retro-futurista, glitchy, gen-z

**Marcas que se sienten así:** Studio FX Brasil, Frank Ocean Blonded, gaming aesthetics

### Fuentes del kit

| Familia | Rol | Pesos disponibles |
|---|---|---|
| **Major Mono Display** | display | 400 normal |
| **Work Sans** | body | 400 normal, 500 normal, 600 normal, 700 normal |
| **Space Mono** | mono | 400 normal, 700 normal |

### Paleta sugerida

```css
:root {
  --black: #0D0D1A;
  --cream: #F0E8FF;
  --accent: #FF00AA;
  --neon: #00FFAA;
}
```

### Cuándo usar este kit
- Marcas creativas, music, fashion juvenil
- Productos digitales con audiencia gen-z
- Eventos, festivales, gaming
- Cuando querés feel retro-futurista nostálgico

### Cómo se usa técnicamente

El archivo `fonts_embedded.css` de este kit ya está pre-empacado en `assets/kits_tipograficos/kit_08_y2k/fonts_embedded.css`.

Para usarlo:
1. Abre ese archivo y copia TODO el contenido
2. Pégalo dentro de un `<style id="embedded-fonts">...</style>` al inicio del `<head>` del HTML
3. En tu CSS, define las variables:

```css
:root {
  --f-display: 'Major Mono Display', sans-serif;
  --f-body: 'Work Sans', system-ui, sans-serif;
  --f-mono: 'Space Mono', monospace;
}
```

---

## 11. CÓMO ADAPTAR LA PALETA

Las paletas sugeridas son punto de partida. Adáptalas según la marca real del usuario:

### Si el usuario ya tiene colores de marca:
1. Reemplaza el `--accent` por el color principal de la marca
2. Mantén `--black` y `--cream` similares (son funcionales, no de marca)
3. Ajusta `--neon` solo si el usuario tiene un color secundario de marca

### Si el usuario quiere "más cálido":
- Black: agregar tono café (ej. `#1A1411` en lugar de `#0A0A0A`)
- Cream: más amarillento (ej. `#F5EAD7` en lugar de `#F2EBDD`)

### Si el usuario quiere "más frío":
- Black: agregar tono azul (ej. `#0A0F1A`)
- Cream: más blanco neutro (ej. `#F5F5F0`)

### Si el usuario quiere "más femenino":
- Accent: rosa, coral, malva
- Considerar paleta con menos contraste extremo

### Si el usuario quiere "más serio":
- Reducir saturación de accent
- Usar burgundy en lugar de rojo
- Verde forest en lugar de verde lima

### REGLA: NUNCA crees una paleta sin propuesta visual

Antes de aplicar, muestra:
```
PALETA AJUSTADA:
- Fondo principal: [hex] [color visible: ⬛]
- Fondo breather: [hex] [color visible: 🟦]
- Acento: [hex] [color visible: 🟧]
- Highlight: [hex] [color visible: 🟨]

¿Te late o ajusto algún color?
```

---

## 12. NO MEZCLAR KITS

**Excepción válida:** Solo si el usuario tiene una razón clara, ej. "quiero el body del Editorial pero el display del Brutalist".

**Por qué casi siempre es mala idea:**
Las fuentes de cada kit fueron elegidas como pareja por sus métricas (x-height, weight, contraste). Mezclar entre kits sin criterio puede romper la armonía visual.

**Si el usuario insiste:**
Adviértelo (1 línea: "ojo, esta mezcla puede no funcionar visualmente"), hazlo, y muéstrale el preview antes de comprometerse.
