# KB_05 — TEMPLATE HTML BASE
## Sistema técnico reutilizable adaptable a cualquier marca

---

## 1. INTRODUCCIÓN

Este documento contiene:
1. **CSS base** con design tokens variables (cambias 4 colores y todo cambia)
2. **Snippets HTML** para cada tipo de slide (hero foto, hero texto, regla, insight, bento, CTA)
3. **Build script Python** que genera el HTML completo
4. **Cómo cargar el kit tipográfico** elegido en Fase 2

**Las fuentes embebidas en base64 viven en archivos separados:** `/assets/kits_tipograficos/{kit_id}/fonts_embedded.css`. Tú cargas ese archivo dinámicamente según el kit elegido por el usuario en Fase 2.

---

## 2. CSS BASE — DESIGN TOKENS Y COMPONENTES

```css
:root {
  /* COLORES — el usuario configura estas variables en Fase 2 */
  --black:    #0A0A0A;   /* fondo principal slides oscuros */
  --smoke:    #141414;   /* fondo alternativo, cards */
  --charcoal: #1F1F1F;   /* separadores, profundidad */
  --steel:    #2A2A2A;   /* ghost number stroke */
  --mid:      #3A3A3A;   /* dividers */
  --ash:      #6B6B6B;   /* texto secundario */
  --cream:    #F2EBDD;   /* fondo slides 'breather' */
  --paper:    #E8DFC9;   /* alternativa cream warmer */
  --white:    #FFFFFF;   /* texto principal sobre dark */
  --accent:   #E94822;   /* color principal de acento (de la marca) */
  --neon:     #E8FF00;   /* highlight puntual */

  /* TIPOGRAFÍA — el usuario configura según kit elegido */
  --f-display: 'Anton', Impact, 'Arial Narrow', sans-serif;
  --f-serif:   'Instrument Serif', Georgia, serif;
  --f-body:    'Inter', system-ui, -apple-system, sans-serif;
  --f-mono:    'JetBrains Mono', ui-monospace, 'SF Mono', Monaco, monospace;

  /* LAYOUT */
  --safe: 80px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0e0e10;
  font-family: var(--f-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.slide {
  width: 1080px;
  height: 1350px;
  position: relative;
  overflow: hidden;
  background: var(--black);
  color: var(--white);
}

/* ===== UI COMPONENTS ===== */

.ui-top {
  position: absolute;
  top: var(--safe);
  left: var(--safe);
  z-index: 30;
}
.ui-tag {
  font-family: var(--f-mono);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream);
}
.ui-tag .star { color: var(--neon); }

.slide-num {
  position: absolute;
  bottom: 60px;
  right: 60px;
  z-index: 35;
  font-family: var(--f-mono);
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.18em;
  color: var(--ash);
}

.logo-corner {
  position: absolute;
  bottom: 60px;
  left: 60px;
  z-index: 35;
}

/* GHOST NUMBER */
.ghost {
  position: absolute;
  font-family: var(--f-display);
  font-weight: 400;
  line-height: 0.78;
  color: transparent;
  -webkit-text-stroke: 3px var(--steel);
  pointer-events: none;
  user-select: none;
  z-index: 5;
  opacity: 0.85;
}

/* HERO BLOCKS */
.hero {
  font-family: var(--f-display);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.015em;
  color: var(--white);
  text-transform: uppercase;
  text-align: left;
}
.hero-large { font-size: 220px; }
.hero-medium { font-size: 150px; }
.hero-small { font-size: 110px; }

.italic-accent {
  font-family: var(--f-serif);
  font-style: italic;
  font-weight: 400;
  letter-spacing: -0.025em;
  text-align: left;
  color: var(--accent);
}

.body-text {
  font-family: var(--f-body);
  font-weight: 500;
  font-size: 36px;
  line-height: 1.4;
  color: var(--cream);
}
.body-text strong { font-weight: 700; color: var(--white); }
.body-text .hl {
  background: var(--neon);
  color: var(--black);
  font-weight: 700;
  padding: 2px 8px;
}

/* VIGNETTE para fotos */
.vignette {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  background:
    linear-gradient(to bottom,
      rgba(0,0,0,0.55) 0%,
      transparent 22%,
      transparent 60%,
      rgba(0,0,0,0.85) 100%),
    radial-gradient(ellipse 80% 60% at 50% 35%,
      transparent 0%,
      rgba(0,0,0,0.5) 90%);
}

/* DOWNLOAD BAR (solo en preview) */
.dl-bar {
  position: fixed;
  top: 16px; left: 50%;
  transform: translateX(-50%);
  background: rgba(10,10,10,0.95);
  border: 1px solid var(--steel);
  padding: 12px 20px;
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--cream);
  cursor: pointer;
  z-index: 9999;
  border-radius: 4px;
  letter-spacing: 0.1em;
}
```

---

## 3. SNIPPETS DE SLIDES

### 3.1 Hero con foto background (S1 tipo)

```html
<section class="slide" data-slide="01">
  <img src="data:image/jpeg;base64,{IMAGEN_BASE64}" 
       style="width:100%; height:100%; object-fit:cover; object-position:center 30%;" />
  <div class="vignette"></div>

  <div class="ui-top">
    <span class="ui-tag"><span class="star">*</span> {TAG_TEXT}</span>
  </div>

  <div style="position:absolute; left:80px; right:80px; bottom:220px; z-index:25;">
    <div class="hero hero-large">{TITULO_LINEA_1}<br>{TITULO_LINEA_2}</div>
    <div style="font-family:var(--f-display); font-weight:400; font-size:58px; line-height:1.05; color:var(--cream); text-transform:uppercase; margin-top:28px; text-align:left;">
      {SUBTITLE} <span style="color:var(--accent);">{ACCENT_PALABRAS}</span>
    </div>
  </div>

  <div class="logo-corner">{LOGO_OPCIONAL}</div>
  <div class="slide-num">01 / 10</div>
</section>
```

### 3.2 Hero texto puro fondo dark (S2 tipo)

```html
<section class="slide" data-slide="02">
  <div style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; padding:0 80px; z-index:25;">
    <div class="hero" style="font-size:230px; letter-spacing:-0.015em; line-height:0.92;">{TITULO}</div>
    <div class="hero" style="font-size:78px; color:var(--ash); margin-top:32px; line-height:1.0;">{SUBTITLE}</div>
    <div class="italic-accent" style="font-size:54px; line-height:1.1; margin-top:48px;">
      <span style="display:inline-block; transform:translateY(-4px); margin-right:12px;">→</span>{ITALIC_TEXT}
    </div>
  </div>

  <div class="ghost" style="font-size:1100px; right:-80px; bottom:-200px; opacity:0.7;">02</div>

  <div class="ui-top"><span class="ui-tag"><span class="star">*</span> {TAG}</span></div>
  <div class="slide-num">02 / 10</div>
</section>
```

### 3.3 Tesis fondo accent (S3 tipo)

```html
<section class="slide" data-slide="03" style="background:var(--accent); color:var(--black);">
  <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:flex-start; padding:0 80px; z-index:25;">
    <div class="hero" style="font-size:180px; line-height:0.92; color:var(--black);">
      {LINEA_1}<br>{LINEA_2_OPCIONAL}
    </div>
  </div>

  <div class="ui-top">
    <span class="ui-tag" style="color:var(--black);"><span class="star" style="color:var(--black);">*</span> {TAG}</span>
  </div>
  <div class="slide-num" style="color:var(--black); opacity:0.6;">03 / 10</div>
</section>
```

### 3.4 Regla con ghost number (S4-S7 tipo)

```html
<section class="slide regla" data-slide="04">
  <div class="ghost" style="font-size:1500px; right:-180px; bottom:-420px;">01</div>

  <div style="position:absolute; left:80px; right:80px; top:160px; z-index:25;">
    <div class="hero hero-small" style="max-width:920px;">
      {REGLA_TITULO}
    </div>

    <p class="body-text" style="margin-top:48px; max-width:760px;">
      {BODY_DESCRIPCION}
    </p>

    <div class="italic-accent" style="font-size:42px; line-height:1.25; margin-top:32px;">
      {ITALIC_FRASE_MEMORABLE}
    </div>
  </div>

  <div class="ui-top"><span class="ui-tag"><span class="star">*</span> REGLA 01 / 04</span></div>
  <div class="slide-num">04 / 10</div>
</section>
```

### 3.5 Insight cream (S8 tipo)

```html
<section class="slide" data-slide="08" style="background:var(--cream); color:var(--black);">
  <div style="position:absolute; left:80px; right:80px; top:300px; z-index:25;">
    <div class="hero" style="font-size:150px; line-height:0.95; color:var(--black);">
      {LINEA_HERO_BLACK}
    </div>
    <div class="italic-accent" style="font-size:220px; line-height:0.95; margin-top:24px; color:var(--accent);">
      {ITALIC_HERO_ACCENT}
    </div>
  </div>

  <div class="ui-top">
    <span class="ui-tag" style="color:var(--ash);">
      <span class="star" style="color:var(--accent);">*</span> INSIGHT
    </span>
  </div>
  <div class="slide-num" style="color:var(--ash);">08 / 10</div>
</section>
```

### 3.6 Bento grid resumen (S9 tipo)

```html
<section class="slide" data-slide="09">
  <div style="padding:80px; height:100%; display:flex; flex-direction:column;">
    <div class="ui-tag" style="margin-bottom:24px;">
      <span class="star">*</span> {TAG}
    </div>
    <div class="hero hero-small" style="margin-bottom:8px;">{HEADER}</div>
    <div class="italic-accent" style="font-size:42px; line-height:1.25; margin-bottom:48px;">
      {ITALIC_SUBHEADER}
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr; gap:16px; flex:1;">
      <div style="background:var(--smoke); padding:48px 40px; border-top:4px solid var(--accent); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-family:var(--f-display); font-weight:400; font-size:92px; line-height:1; color:var(--accent);">01</div>
          <div style="font-family:var(--f-display); font-weight:400; font-size:44px; line-height:1.05; color:var(--white); text-transform:uppercase; margin-top:24px; text-align:left;">
            {CARD_1_TITULO}
          </div>
        </div>
        <div style="font-family:var(--f-mono); font-weight:500; font-size:14px; color:var(--ash); letter-spacing:0.15em; text-transform:uppercase;">
          {CARD_1_CAPTION}
        </div>
      </div>

      <!-- Cards 2, 3, 4: misma estructura -->
    </div>
  </div>

  <div class="slide-num">09 / 10</div>
</section>
```

### 3.7 CTA final (S10 tipo)

```html
<section class="slide" data-slide="10">
  <div class="ghost" style="font-size:800px; left:-80px; top:-100px; -webkit-text-stroke:2px var(--mid); opacity:0.6;">?</div>

  <div class="ui-top"><span class="ui-tag"><span class="star">*</span> CIERRE</span></div>

  <div style="position:absolute; left:80px; right:80px; top:160px; z-index:25;">
    <div class="hero" style="font-size:220px; line-height:0.92; margin-top:48px;">
      {PREGUNTA_HERO}
    </div>

    <div style="margin-top:60px; display:flex; flex-direction:column; gap:32px;">
      <div style="display:flex; align-items:flex-start; gap:24px;">
        <div style="font-family:var(--f-display); font-weight:400; font-size:56px; line-height:1; color:var(--accent);">↓</div>
        <div>
          <div style="font-family:var(--f-display); font-weight:400; font-size:70px; line-height:1; color:var(--white); text-transform:uppercase;">
            {ACCION_1}
          </div>
          <div style="font-family:var(--f-body); font-weight:500; font-size:24px; color:var(--cream); margin-top:8px;">
            {DESCRIPCION_ACCION_1}
          </div>
        </div>
      </div>
      <div style="display:flex; align-items:flex-start; gap:24px;">
        <div style="font-family:var(--f-display); font-weight:400; font-size:56px; line-height:1; color:var(--accent);">↗</div>
        <div>
          <div style="font-family:var(--f-display); font-weight:400; font-size:70px; line-height:1; color:var(--white); text-transform:uppercase;">
            {ACCION_2}
          </div>
          <div style="font-family:var(--f-body); font-weight:500; font-size:24px; color:var(--cream); margin-top:8px;">
            {DESCRIPCION_ACCION_2}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style="position:absolute; bottom:60px; left:60px; right:60px; display:flex; justify-content:space-between; align-items:flex-end; z-index:35;">
    {LOGO_GRANDE_OPCIONAL}
    <div style="font-family:var(--f-mono); font-weight:500; font-size:14px; color:var(--cream); text-align:right; max-width:280px; letter-spacing:0.15em; line-height:1.5;">
      <span style="color:var(--accent);">→</span> {CREDIT_TEXT}
    </div>
  </div>

  <div class="slide-num">10 / 10</div>
</section>
```

---

## 4. BUILD SCRIPT PYTHON — TEMPLATE COMPLETO

Estructura del script Python que genera el HTML:

```python
import os, base64

OUTPUT_HTML = "/mnt/user-data/outputs/{marca-slug}-{tema}.html"
KIT_ID = "kit_01_editorial"  # Fase 2 — el kit elegido por el usuario

# 1. Cargar fuentes embebidas del kit elegido
FONTS_PATH = f'assets/kits_tipograficos/{KIT_ID}/fonts_embedded.css'
with open(FONTS_PATH, 'r') as f:
    FONTS_CSS = f.read()

# 2. CSS base + variables personalizadas
PALETA = {
    'black': '#0A0A0A',   # configurar según marca
    'cream': '#F2EBDD',
    'accent': '#E94822',  # color principal de la marca
    'neon': '#E8FF00',
}

CSS_BASE = '''
:root {{
  --black:   {black};
  --cream:   {cream};
  --accent:  {accent};
  --neon:    {neon};
  --smoke:   #141414;
  --charcoal:#1F1F1F;
  --steel:   #2A2A2A;
  --mid:     #3A3A3A;
  --ash:     #6B6B6B;
  --paper:   #E8DFC9;
  --white:   #FFFFFF;
  --safe:    80px;

  /* Fuentes según kit elegido */
  --f-display: 'Anton', Impact, sans-serif;        /* del kit */
  --f-serif:   'Instrument Serif', Georgia, serif; /* del kit */
  --f-body:    'Inter', system-ui, sans-serif;      /* del kit */
  --f-mono:    'JetBrains Mono', monospace;        /* del kit */
}}
'''.format(**PALETA)

# 3. Cargar imágenes si las hay
def img_to_b64(path):
    with open(path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

# 4. Construir HTML completo
html = f'''<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Carrusel — {{nombre_marca}} — {{tema}}</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<style id="embedded-fonts">
{FONTS_CSS}
</style>
<style>
{CSS_BASE}
{CSS_COMPONENTES_DEL_KB05_SECCION_2}
</style>
</head>
<body>

<div class="dl-bar" onclick="downloadAll()">⬇ DESCARGAR LOS 10 SLIDES</div>

<!-- 10 slides aquí -->

<script>
async function downloadAll() {{
  const slides = document.querySelectorAll('.slide');
  for (let i = 0; i < slides.length; i++) {{
    const canvas = await html2canvas(slides[i], {{scale: 2, useCORS: true}});
    const link = document.createElement('a');
    link.download = `{{marca}}-{{tema}}-slide-${{String(i+1).padStart(2,'0')}}.png`;
    link.href = canvas.toDataURL();
    link.click();
    await new Promise(r => setTimeout(r, 300));
  }}
}}
</script>

</body>
</html>'''

# 5. Guardar
with open(OUTPUT_HTML.replace('{marca-slug}', 'marca-test').replace('{tema}', 'demo'), 'w') as f:
    f.write(html)
print(f"✓ HTML generado: {len(html)/1024:.0f} KB")
```

---

## 5. RENDER A PNG CON PLAYWRIGHT

```python
from playwright.sync_api import sync_playwright
import os, zipfile

OUTPUT_DIR = '/mnt/user-data/outputs/slides'
os.makedirs(OUTPUT_DIR, exist_ok=True)

html_path = '/mnt/user-data/outputs/marca-test-demo.html'

with sync_playwright() as p:
    browser = p.chromium.launch(args=['--font-render-hinting=none'])
    context = browser.new_context(
        viewport={'width': 1080, 'height': 1350},
        device_scale_factor=2  # RETINA
    )
    page = context.new_page()
    page.goto(f'file://{html_path}')
    page.wait_for_load_state('networkidle')
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(3000)
    page.evaluate("document.querySelector('.dl-bar').style.display='none'")

    slides = page.locator('.slide')
    for i in range(slides.count()):
        slide = slides.nth(i)
        slide_num = slide.get_attribute('data-slide')
        slide.screenshot(path=f'{OUTPUT_DIR}/marca-test-demo-slide-{slide_num}.png')

    browser.close()

# ZIP
with zipfile.ZipFile('/mnt/user-data/outputs/marca-test-demo-10-slides.zip', 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(os.listdir(OUTPUT_DIR)):
        zf.write(os.path.join(OUTPUT_DIR, f), arcname=f)
```

---

## 6. CARGA DEL KIT TIPOGRÁFICO

Cuando construyes el HTML, debes:

### Paso 1: Identificar el kit elegido
En Fase 2 del workflow, el usuario eligió un kit (ej. `kit_07_warmth`).

### Paso 2: Leer el archivo de fuentes del kit
```python
KIT_ID = 'kit_07_warmth'  # del usuario
FONTS_PATH = f'assets/kits_tipograficos/{KIT_ID}/fonts_embedded.css'

with open(FONTS_PATH, 'r') as f:
    fonts_css = f.read()
```

### Paso 3: Inyectarlo en el `<head>` del HTML
```html
<style id="embedded-fonts">
{fonts_css}
</style>
```

### Paso 4: Configurar las CSS variables según el kit
Por ejemplo, para Warmth:
```css
:root {
  --f-display: 'Fraunces', Georgia, serif;
  --f-body:    'Karla', system-ui, sans-serif;
  --f-mono:    'DM Mono', monospace;
}
```

Cada kit tiene sus familias específicas. Consulta KB_02 para saber qué variables setear según el kit.

---

## 7. ADAPTANDO LA PALETA

Las paletas de cada kit (en KB_02) son punto de partida. Si la marca del usuario tiene colores propios:

```python
# Caso: la marca tiene azul corporativo
PALETA = {
    'black': '#0F1419',         # adaptar a tono corporativo si quiere
    'cream': '#F1F5F9',         # mantener neutral
    'accent': '#0066FF',        # ← color de la marca
    'neon': '#00D4FF',          # color secundario o highlight
}
```

Aplicas la paleta directo a las CSS variables sin tocar otras partes del CSS.

---

## 8. CHECKLIST DE CALIDAD VISUAL

Antes de entregar el HTML, verificar:

- [ ] Tipografías del kit elegido (NUNCA mezclar entre kits sin razón)
- [ ] Pesos correctos según métricas del kit (ver KB_02 — algunas son single-weight)
- [ ] Text-align: left explícito en todos los heroes
- [ ] Color contrast: ratio mínimo 7:1 entre fondo y texto principal
- [ ] Safe zones: sin texto crítico a menos de 60px del borde
- [ ] Slide num presente y consistente (`NN / 10`)
- [ ] Logo presente en footer (excepto S3 y S8 que son "breathers")
- [ ] Tag monospace en top
- [ ] Ghost number presente en slides numerados
- [ ] Vignette aplicado si hay foto
- [ ] Sin elementos cortados por bordes
- [ ] Fuentes embebidas en base64 (verificar tamaño HTML > 400KB)

---

## 9. TROUBLESHOOTING

| Problema | Causa | Solución |
|---|---|---|
| Texto se ve "fake bold" | font-weight no existe en el kit | Verificar pesos disponibles en KB_02 |
| Fuentes diferentes en HTML vs PNG | No cargó embedded-fonts | Verificar que cargaste el archivo del kit correcto |
| Texto cortado en bordes | Sin safe zone | Aplicar `padding: var(--safe)` |
| Imagen pixelada | device_scale_factor falta | `device_scale_factor=2` en Playwright |
| Botón descarga aparece en PNG | No se ocultó antes de capture | `page.evaluate("document.querySelector('.dl-bar').style.display='none'")` |
| Fuentes no aparecen | Falta `document.fonts.ready` | Agregar wait + 2500ms timeout |
