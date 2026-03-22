---
name: pdf-export
description: >
  Generate PDF files from a live URL, a local HTML file, inline HTML, or programmatically
  with ReportLab: flow documents (JSON/CLI/stdin) or direct Canvas drawing (geometry and text)
  with no input file (no .txt/.doc/.pdf as source — only inline JSON or CLI flags). Use for
  web exports, memos, or vector-native PDFs built from scratch in Python.
type: script
version: "1.1.0"
categories: [pdf, export, documents, html, python]
script:
  path: scripts/pdf_export.py
  runtime: python3
  dependencies:
    - playwright>=1.40.0
    - reportlab>=4.0.0
  invoke: >
    python3 {skill_path}/scripts/pdf_export.py html --url "{url}" -o "{output}"
---

# PDF Export

## When to use

- Export a **public or reachable URL** to PDF (reports, articles, landing pages).
- Convert a **local HTML file** (or HTML string) to PDF for archiving or delivery.
- Create a **simple structured PDF** from JSON or title/body without HTML (invoices, memos, outlines).
- Create a **PDF nativo** con el subcomando `direct`: solo ReportLab Canvas (texto, líneas, rectángulos, círculos) usando **`--spec-json`** en la línea de comandos o JSON por **stdin** — sin leer `.html`, `.txt`, `.doc`, `.pdf` ni URL como fuente.

Do not use this skill for highly complex print layouts that need manual InDesign-level tuning; prefer HTML you control, then `html` mode.

## One-time setup (Python)

From the **project root** (after `npx nifillos install pdf-export`):

```bash
pip install -r skills/pdf-export/requirements.txt
playwright install chromium
```

If `python3` is not on PATH on Windows, use `py -3` instead of `python3`.

## Commands

All paths below assume the skill lives at `skills/pdf-export/` in the project.

### 1) URL → PDF

```bash
python3 skills/pdf-export/scripts/pdf_export.py html \
  --url "https://example.com/page" \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/page.pdf"
```

Optional: `--media-print` (print CSS), `--no-background`, `--format Letter`, margins `--margin-top 2cm`, etc.

### 2) Local HTML file → PDF

```bash
python3 skills/pdf-export/scripts/pdf_export.py html \
  --html-file "path/to/document.html" \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/doc.pdf"
```

### 3) Inline HTML string → PDF

```bash
python3 skills/pdf-export/scripts/pdf_export.py html \
  --html-string "<html><body><h1>Hi</h1></body></html>" \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/inline.pdf"
```

For long HTML, write a temp `.html` file and use `--html-file` instead.

### 4) PDF directo (Canvas) — solo argumentos CLI (sin archivos fuente)

Útil cuando el agente o el pipeline tienen el texto en variables, no en disco:

```bash
python3 skills/pdf-export/scripts/pdf_export.py direct \
  --title "Informe rápido" \
  --line "Primera línea" \
  --line "Segunda línea" \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/directo.pdf"
```

### 5) PDF directo (Canvas) — JSON inline (sin archivo)

Todas las coordenadas están en **puntos** PDF; origen abajo-izquierda salvo que uses `"from_top": true` en cada operación.

```bash
python3 skills/pdf-export/scripts/pdf_export.py direct \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/canvas.pdf" \
  --spec-json '{"page":"a4","ops":[{"op":"font","name":"Helvetica-Bold","size":20},{"op":"text","x":72,"y":720,"text":"Título"},{"op":"line","x1":72,"y1":700,"x2":520,"y2":700},{"op":"rect","x":72,"y":200,"w":200,"h":80,"stroke":1,"fill":0}]}'
```

Operaciones soportadas: `newpage`, `font`, `rgb` | `fill_rgb` | `stroke_rgb`, `text`, `line`, `rect`, `circle`. Opcional en cada una: `"from_top": true` para medir `y` desde el borde superior de la página.

### 6) PDF directo — JSON por stdin (sigue sin archivo en disco)

```bash
echo '{"page":"a4","ops":[{"op":"text","x":100,"y":100,"text":"Hola"}]}' | \
  python3 skills/pdf-export/scripts/pdf_export.py direct -o salida.pdf --spec-file -
```

### 7) Programmatic PDF (flujo / platypus) — JSON en archivo

Create `spec.json`:

```json
{
  "title": "Weekly summary",
  "sections": [
    {
      "heading": "Highlights",
      "paragraphs": [
        "First paragraph.",
        "Second paragraph with details."
      ]
    },
    {
      "heading": "Next steps",
      "paragraphs": ["Ship the draft.", "Review metrics."]
    }
  ]
}
```

Run:

```bash
python3 skills/pdf-export/scripts/pdf_export.py doc \
  --json-file "path/to/spec.json" \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/report.pdf"
```

### 8) Programmatic PDF (flujo) — JSON por stdin o inline

```bash
# stdin
cat <<'EOF' | python3 skills/pdf-export/scripts/pdf_export.py doc -o out.pdf --json-file -
{"title":"Doc","sections":[{"paragraphs":["Solo esto."]}]}
EOF
```

```bash
python3 skills/pdf-export/scripts/pdf_export.py doc -o out.pdf \
  --spec-json '{"title":"Doc","sections":[{"paragraphs":["Párrafo."]}]}'
```

### 9) Programmatic PDF — minimal title + body

```bash
python3 skills/pdf-export/scripts/pdf_export.py doc \
  --title "Memo" \
  --body "Plain text content for a single-section PDF." \
  -o "cuadrillas/{cuadrilla}/output/{run_id}/exports/memo.pdf"
```

Use `--page letter` for US Letter instead of A4.

Cuerpo desde stdin (sin `.txt` en disco): `doc ... --body - --title "Asunto"` y escribir el texto por stdin.

## Custom Python beyond JSON

Para lógica arbitraria (tablas complejas, imágenes embebidas, muchas páginas), usa **`reportlab`** en un script propio del proyecto, o amplía las `ops` del modo `direct` en este repo. El modo `doc` es para flujo de párrafos; `direct` es para dibujo vectorial explícito sin pasar por HTML ni por documentos Office.

## Error handling

- **Timeout on URL**: increase `--timeout-ms` or ensure the page is reachable from the runner environment.
- **Auth-only pages**: Playwright has no logged session by default; save HTML locally or inject cookies in a custom script if needed.
- **Missing browsers**: run `playwright install chromium` after `pip install playwright`.

## Security

Only pass `--url` to hosts you trust. Rendering arbitrary user-supplied HTML is fine locally but avoid SSRF in automated pipelines (validate URLs).
