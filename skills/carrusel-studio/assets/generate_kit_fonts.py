#!/usr/bin/env python3
"""
generate_kit_fonts.py — Genera fonts_embedded.css para los kits tipográficos
desde Google Fonts, codificando las fuentes en base64 inline.

Esto te permite usar el kit elegido sin depender de una conexión a internet
en el HTML final del carrusel.

USO:
    python generate_kit_fonts.py kit_01
    python generate_kit_fonts.py all          # Genera todos los kits
    python generate_kit_fonts.py --list       # Lista los kits disponibles

REQUISITOS:
    pip install requests
"""

import os
import sys
import base64
import requests
from pathlib import Path

# ============================================================================
# DEFINICIÓN DE LOS 8 KITS TIPOGRÁFICOS DE CARRUSEL STUDIO
# Cada kit lista las familias y los pesos requeridos.
# ============================================================================

KITS = {
    "kit_01_editorial": {
        "name": "EDITORIAL",
        "fonts": [
            ("Anton", [400]),
            ("Instrument Serif", [(400, "italic")]),
            ("Inter", [400, 500, 600, 700]),
            ("JetBrains Mono", [500, 600]),
        ],
    },
    "kit_02_modern_clean": {
        "name": "MODERN CLEAN",
        "fonts": [
            ("Space Grotesk", [500, 600, 700]),
            ("Inter", [400, 500, 600, 700]),
            ("IBM Plex Mono", [400, 500]),
        ],
    },
    "kit_03_brutalist": {
        "name": "BRUTALIST",
        "fonts": [
            ("Archivo", [400, 500, 600, 800, 900]),
            ("Space Mono", [400, 700]),
        ],
    },
    "kit_04_serif_classic": {
        "name": "SERIF CLASSIC",
        "fonts": [
            ("Playfair Display", [400, 700, 900]),
            ("EB Garamond", [400, 500, 600, 700]),
            ("Courier Prime", [400, 700]),
        ],
    },
    "kit_05_playful": {
        "name": "PLAYFUL",
        "fonts": [
            ("Syne", [500, 600, 700, 800]),
            ("Manrope", [400, 500, 600, 700]),
            ("DM Mono", [400, 500]),
        ],
    },
    "kit_06_corporate_tech": {
        "name": "CORPORATE TECH",
        "fonts": [
            ("Red Hat Display", [400, 500, 600, 700, 900]),
            ("Red Hat Mono", [400, 500]),
        ],
    },
    "kit_07_warmth": {
        "name": "WARMTH",
        "fonts": [
            ("Fraunces", [400, 600, 700, 900]),
            ("Karla", [400, 500, 600, 700]),
            ("DM Mono", [400, 500]),
        ],
    },
    "kit_08_y2k": {
        "name": "Y2K NEO-RETRO",
        "fonts": [
            ("Major Mono Display", [400]),
            ("Work Sans", [400, 500, 600, 700]),
            ("Space Mono", [400, 700]),
        ],
        "note": "Este kit ya viene incluido en el skill por defecto.",
    },
}

OUTPUT_BASE = Path(__file__).parent / "kits_tipograficos"

# Headers para Google Fonts API (necesario para que devuelva woff2)
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    )
}


def fetch_font_css(family: str, weights: list) -> str:
    """Descarga el CSS de Google Fonts para una familia y sus pesos."""
    weight_strs = []
    for w in weights:
        if isinstance(w, tuple):
            weight, style = w
            if style == "italic":
                weight_strs.append(f"ital,wght@1,{weight}")
            else:
                weight_strs.append(f"wght@{weight}")
        else:
            weight_strs.append(f"wght@{w}")

    family_url = family.replace(" ", "+")
    url = f"https://fonts.googleapis.com/css2?family={family_url}:" + ";".join(weight_strs) + "&display=swap"

    print(f"  • Descargando {family} (pesos: {weights})...")
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return r.text


def fetch_woff2_as_base64(url: str) -> str:
    """Descarga un archivo .woff2 y lo codifica en base64."""
    r = requests.get(url, timeout=30)
    r.raise_for_status()
    return base64.b64encode(r.content).decode("ascii")


def embed_woff2_in_css(css: str) -> str:
    """Toma el CSS de Google Fonts y reemplaza los URLs por data: base64."""
    import re

    pattern = r"url\((https?://[^)]+\.woff2)\)"

    def replace_url(match):
        url = match.group(1)
        try:
            b64 = fetch_woff2_as_base64(url)
            return f"url(data:font/woff2;base64,{b64})"
        except Exception as e:
            print(f"    ⚠️  Error descargando {url}: {e}")
            return match.group(0)

    return re.sub(pattern, replace_url, css)


def generate_kit(kit_id: str):
    """Genera el archivo fonts_embedded.css para un kit específico."""
    if kit_id not in KITS:
        print(f"❌ Kit desconocido: {kit_id}")
        print(f"   Disponibles: {', '.join(KITS.keys())}")
        return False

    kit = KITS[kit_id]
    output_dir = OUTPUT_BASE / kit_id
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / "fonts_embedded.css"

    if output_file.exists():
        size_kb = output_file.stat().st_size / 1024
        if size_kb > 50:
            print(f"⏩ {kit_id} ({kit['name']}) ya existe ({size_kb:.0f} KB). Saltando.")
            return True

    print(f"\n🎨 Generando kit: {kit_id} — {kit['name']}")

    all_css = []
    for family, weights in kit["fonts"]:
        try:
            css = fetch_font_css(family, weights)
            css_embedded = embed_woff2_in_css(css)
            all_css.append(f"/* === {family} === */\n{css_embedded}")
        except Exception as e:
            print(f"  ❌ Error con {family}: {e}")
            return False

    final_css = "\n\n".join(all_css)
    output_file.write_text(final_css, encoding="utf-8")

    size_kb = output_file.stat().st_size / 1024
    print(f"✅ Generado: {output_file.relative_to(Path(__file__).parent)} ({size_kb:.0f} KB)")
    return True


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    arg = sys.argv[1]

    if arg == "--list":
        print("\n📚 Kits tipográficos disponibles:\n")
        for kid, k in KITS.items():
            note = f"  ({k.get('note', '')})" if k.get("note") else ""
            print(f"  • {kid:25s} — {k['name']}{note}")
        print()
        return

    if arg == "all":
        print("🚀 Generando TODOS los kits tipográficos...")
        for kit_id in KITS.keys():
            generate_kit(kit_id)
        print("\n✨ Listo. Todos los kits generados en kits_tipograficos/")
        return

    # Permitir abreviaturas: kit_01 → kit_01_editorial
    if arg.startswith("kit_") and len(arg) <= 6:
        matches = [k for k in KITS.keys() if k.startswith(arg)]
        if len(matches) == 1:
            arg = matches[0]
        elif len(matches) > 1:
            print(f"❌ Ambiguo: {matches}")
            sys.exit(1)

    generate_kit(arg)


if __name__ == "__main__":
    main()
