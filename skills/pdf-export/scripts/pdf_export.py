#!/usr/bin/env python3
"""
pdf-export — Nifillos skill
- html: render URL or HTML file to PDF (Chromium via Playwright)
- doc: flow document from JSON / stdin / CLI (ReportLab platypus)
- direct: draw PDF from scratch via Canvas — no HTML/URL/txt/doc/pdf as input
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def cmd_html(args: argparse.Namespace) -> int:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "Error: playwright is not installed. Run: pip install playwright && playwright install chromium",
            file=sys.stderr,
        )
        return 1

    out = Path(args.output).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            page = browser.new_page()
            if args.media_print:
                page.emulate_media(media="print")
            if args.url:
                page.goto(args.url, wait_until="networkidle", timeout=args.timeout_ms)
            elif args.html_file:
                path = Path(args.html_file).resolve()
                if not path.is_file():
                    print(f"Error: HTML file not found: {path}", file=sys.stderr)
                    return 1
                page.goto(path.as_uri(), wait_until="load", timeout=args.timeout_ms)
            elif args.html_string is not None:
                page.set_content(args.html_string, wait_until="load", timeout=args.timeout_ms)
            else:
                print("Error: provide --url, --html-file, or --html-string", file=sys.stderr)
                return 1

            page.pdf(
                path=str(out),
                format=args.format,
                print_background=not args.no_background,
                margin={
                    "top": args.margin_top,
                    "right": args.margin_right,
                    "bottom": args.margin_bottom,
                    "left": args.margin_left,
                },
            )
        finally:
            browser.close()

    print(out)
    return 0


def _load_json_file_or_stdin(path_or_dash: str) -> dict:
    if path_or_dash == "-":
        return json.load(sys.stdin)
    raw = Path(path_or_dash).read_text(encoding="utf-8")
    return json.loads(raw)


def cmd_doc(args: argparse.Namespace) -> int:
    try:
        from reportlab.lib.pagesizes import A4, letter
        from reportlab.lib.styles import getSampleStyleSheet
        from reportlab.lib.units import cm
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
    except ImportError:
        print("Error: reportlab is not installed. Run: pip install reportlab", file=sys.stderr)
        return 1

    out = Path(args.output).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    page_size = A4 if args.page.lower() == "a4" else letter

    if args.spec_json is not None:
        spec = json.loads(args.spec_json)
    elif args.json_file:
        spec = _load_json_file_or_stdin(args.json_file)
    elif args.body == "-":
        body_src = sys.stdin.read()
        spec = {
            "title": args.title or "Document",
            "sections": [{"heading": None, "paragraphs": [body_src.strip()]}],
        }
    else:
        spec = {
            "title": args.title or "Document",
            "sections": [{"heading": None, "paragraphs": [args.body or ""]}],
        }

    doc = SimpleDocTemplate(
        str(out),
        pagesize=page_size,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    styles = getSampleStyleSheet()
    story = []

    title = spec.get("title") or "Document"
    story.append(Paragraph(title, styles["Title"]))
    story.append(Spacer(1, 0.5 * cm))

    for section in spec.get("sections", []):
        heading = section.get("heading")
        if heading:
            story.append(Paragraph(str(heading), styles["Heading2"]))
            story.append(Spacer(1, 0.2 * cm))
        for para in section.get("paragraphs", []):
            text = str(para).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(text, styles["Normal"]))
            story.append(Spacer(1, 0.3 * cm))

    doc.build(story)
    print(out)
    return 0


def _page_size(name: str):
    from reportlab.lib.pagesizes import A4, letter

    n = (name or "a4").lower()
    return A4 if n == "a4" else letter


def cmd_direct(args: argparse.Namespace) -> int:
    """Build a PDF with ReportLab Canvas only (no external document sources)."""
    try:
        from reportlab.lib.colors import Color
        from reportlab.pdfgen import canvas
    except ImportError:
        print("Error: reportlab is not installed. Run: pip install reportlab", file=sys.stderr)
        return 1

    out = Path(args.output).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    pagesize = _page_size(args.page)

    if args.spec_json is not None:
        spec = json.loads(args.spec_json)
    elif args.spec_file:
        spec = _load_json_file_or_stdin(args.spec_file)
    else:
        # CLI-only: stacked lines from the bottom margin upward
        lines = args.line or []
        if args.title:
            lines = [args.title, *lines]
        margin_x, margin_y = 72, 72
        leading = float(args.leading)
        y = margin_y + leading * max(0, len(lines) - 1)
        ops = [{"op": "font", "name": "Helvetica", "size": 12}]
        for i, line in enumerate(lines):
            ops.append({"op": "text", "x": margin_x, "y": y - i * leading, "text": line})
        spec = {"page": args.page, "ops": ops}

    ops = spec.get("ops") or []
    c = canvas.Canvas(str(out), pagesize=pagesize)
    width, height = pagesize

    for raw in ops:
        op = raw.get("op") if isinstance(raw, dict) else None
        if not op:
            continue
        if op == "newpage":
            c.showPage()
            continue
        if op == "font":
            c.setFont(str(raw.get("name", "Helvetica")), float(raw.get("size", 12)))
            continue
        if op == "rgb":
            r, g, b = float(raw["r"]), float(raw["g"]), float(raw["b"])
            c.setFillColor(Color(r, g, b))
            c.setStrokeColor(Color(r, g, b))
            continue
        if op == "fill_rgb":
            r, g, b = float(raw["r"]), float(raw["g"]), float(raw["b"])
            c.setFillColor(Color(r, g, b))
            continue
        if op == "stroke_rgb":
            r, g, b = float(raw["r"]), float(raw["g"]), float(raw["b"])
            c.setStrokeColor(Color(r, g, b))
            continue
        if op == "text":
            y = float(raw["y"])
            if raw.get("from_top"):
                y = height - y
            c.drawString(float(raw["x"]), y, str(raw.get("text", "")))
            continue
        if op == "line":
            y1, y2 = float(raw["y1"]), float(raw["y2"])
            if raw.get("from_top"):
                y1, y2 = height - y1, height - y2
            c.line(float(raw["x1"]), y1, float(raw["x2"]), y2)
            continue
        if op == "rect":
            x, y, w, h = float(raw["x"]), float(raw["y"]), float(raw["w"]), float(raw["h"])
            if raw.get("from_top"):
                y = height - y - h
            c.rect(
                x,
                y,
                w,
                h,
                stroke=int(raw.get("stroke", 1)),
                fill=int(raw.get("fill", 0)),
            )
            continue
        if op == "circle":
            x, y, r = float(raw["x"]), float(raw["y"]), float(raw["r"])
            if raw.get("from_top"):
                y = height - y
            c.circle(x, y, r, stroke=int(raw.get("stroke", 1)), fill=int(raw.get("fill", 0)))
            continue

    c.showPage()
    c.save()
    print(out)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Export PDFs from HTML/URL or build via Python/JSON spec.")
    sub = parser.add_subparsers(dest="command", required=True)

    h = sub.add_parser("html", help="Render a web page or HTML file to PDF (Playwright)")
    h.add_argument("--url", help="Absolute http(s) URL to open")
    h.add_argument("--html-file", help="Path to a local .html file")
    h.add_argument("--html-string", help="Raw HTML document string")
    h.add_argument("-o", "--output", required=True, help="Output .pdf path")
    h.add_argument("--format", default="A4", help="Paper format (default A4)")
    h.add_argument("--timeout-ms", type=int, default=60_000)
    h.add_argument("--no-background", action="store_true", help="Omit CSS backgrounds")
    h.add_argument("--media-print", action="store_true", help="Use print CSS media type")
    h.add_argument("--margin-top", default="1cm")
    h.add_argument("--margin-right", default="1cm")
    h.add_argument("--margin-bottom", default="1cm")
    h.add_argument("--margin-left", default="1cm")
    h.set_defaults(func=cmd_html)

    d = sub.add_parser("doc", help="Build a PDF from JSON spec or title/body (ReportLab)")
    d.add_argument("-o", "--output", required=True, help="Output .pdf path")
    d.add_argument("--json-file", help="JSON file, or '-' for stdin")
    d.add_argument(
        "--spec-json",
        help="Inline JSON document spec (no file): {title, sections:[{heading, paragraphs:[]}] }",
    )
    d.add_argument("--title", help="Simple mode: document title")
    d.add_argument("--body", help="Simple mode: body text; use '-' to read body from stdin")
    d.add_argument("--page", default="a4", choices=("a4", "letter"))
    d.set_defaults(func=cmd_doc)

    r = sub.add_parser(
        "direct",
        help="Draw PDF with ReportLab Canvas (pure Python geometry/text; no HTML/URL/txt/doc input)",
    )
    r.add_argument("-o", "--output", required=True, help="Output .pdf path")
    r.add_argument(
        "--spec-json",
        help='Inline JSON: {"page":"a4","ops":[{"op":"text","x":72,"y":720,"text":"Hi"}]}',
    )
    r.add_argument("--spec-file", help="JSON file with ops[], or '-' to read from stdin")
    r.add_argument("--page", default="a4", choices=("a4", "letter"))
    r.add_argument("--title", help="Without --spec-*: single heading line")
    r.add_argument("--line", action="append", help="Without --spec-*: extra lines (repeat flag)")
    r.add_argument("--leading", default="14", help="Line spacing in pt for --line mode (default 14)")
    r.set_defaults(func=cmd_direct)

    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
