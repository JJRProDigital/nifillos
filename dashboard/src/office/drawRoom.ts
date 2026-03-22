import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS, TILE } from "./palette";
import type { IsoPoint } from "./officeProjection";

/** Suelo isométrico (paralelogramo) con tablas siguiendo la profundidad. */
export function drawIsoFloor(g: PixiGraphics, quad: readonly [IsoPoint, IsoPoint, IsoPoint, IsoPoint]) {
  const [v0, v1, v2, v3] = quad;

  // Sombra proyectada bajo el perímetro (ancla el suelo al espacio)
  g.poly([
    v0.x + 3,
    v0.y + 4,
    v1.x - 2,
    v1.y + 4,
    v2.x - 2,
    v2.y + 6,
    v3.x + 3,
    v3.y + 6,
  ]);
  g.fill({ color: 0x000000, alpha: 0.22 });

  g.poly([v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y]);
  g.fill({ color: COLORS.woodBase });

  const bands = 16;
  for (let i = 1; i < bands; i++) {
    const t = i / bands;
    const ax = v3.x + (v2.x - v3.x) * t;
    const ay = v3.y + (v2.y - v3.y) * t;
    const bx = v0.x + (v1.x - v0.x) * t;
    const by = v0.y + (v1.y - v0.y) * t;
    g.moveTo(ax, ay);
    g.lineTo(bx, by);
    g.stroke({ color: COLORS.woodGap, alpha: 0.28 + (i % 3) * 0.06, width: 1.25 });
  }

  // Líneas de perspectiva más marcadas (profundidad)
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const mx = v0.x + (v1.x - v0.x) * t;
    const my = v0.y + (v1.y - v0.y) * t;
    const nx = v3.x + (v2.x - v3.x) * t;
    const ny = v3.y + (v2.y - v3.y) * t;
    g.moveTo(mx, my);
    g.lineTo(nx, ny);
    g.stroke({ color: 0x000000, alpha: 0.07, width: 5 });
  }

  g.poly([v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y]);
  g.stroke({ color: COLORS.woodDark, alpha: 0.85, width: 2 });

  g.poly([v0.x, v0.y, v1.x, v1.y, v2.x, v2.y, v3.x, v3.y]);
  g.stroke({ color: COLORS.woodHighlight, alpha: 0.2, width: 1 });
}

/** Suelo rectangular que llena el escenario (debajo del rombo isométrico detallado). */
export function drawPlankFloorRect(
  g: PixiGraphics,
  x: number,
  y: number,
  w: number,
  h: number
) {
  if (w <= 0 || h <= 0) return;
  g.rect(x, y, w, h);
  g.fill({ color: COLORS.woodBase });
  const plank = 16;
  for (let py = y + plank; py < y + h; py += plank) {
    g.rect(x, py, w, 1);
    g.fill({ color: COLORS.woodGap, alpha: 0.22 });
  }
  g.rect(x, y, w, h);
  g.stroke({ color: COLORS.woodDark, alpha: 0.45, width: 1 });
}

export function drawFloor(g: PixiGraphics, w: number, h: number, offsetX: number, offsetY: number) {
  // Base wood fill
  g.rect(offsetX, offsetY, w, h);
  g.fill({ color: COLORS.woodBase });

  const plankH = 12;
  const plankW = 64;
  const shades = [COLORS.woodLight, COLORS.woodBase, COLORS.woodDark];
  const maxRow = Math.max(1, Math.ceil(h / plankH) - 1);

  for (let row = 0; row <= Math.ceil(h / plankH); row++) {
    const py = offsetY + row * plankH;
    if (py >= offsetY + h) break;

    const rowH = Math.min(plankH - 1, offsetY + h - py);
    if (rowH <= 0) continue;

    const shade = shades[row % 3];
    const jOffset = (row % 2) * (plankW / 2);

    // Plank row fill
    g.rect(offsetX, py, w, rowH);
    g.fill({ color: shade });

    // Brillo sutil en el borde superior de cada tabla
    if (rowH >= 2) {
      g.rect(offsetX, py, w, 1);
      g.fill({ color: COLORS.woodHighlight, alpha: 0.12 });
    }

    // Horizontal gap between plank rows
    if (row > 0) {
      g.rect(offsetX, py, w, 1);
      g.fill({ color: COLORS.woodGap, alpha: 0.35 });
    }

    // Vertical joints (staggered)
    for (let jx = jOffset; jx < w; jx += plankW) {
      if (jx > 0) {
        g.rect(offsetX + jx, py, 1, rowH);
        g.fill({ color: COLORS.woodGap, alpha: 0.25 });
      }
    }

    // Profundidad fake: más cerca del fondo (fila pequeña) = más sombra hacia la pared
    const depth = maxRow > 0 ? 1 - row / maxRow : 0;
    g.rect(offsetX, py, w, rowH);
    g.fill({ color: 0x000000, alpha: 0.028 + depth * 0.055 });
  }

  // Subtle tile grid overlay (Gather.town style)
  for (let row = 1; row < Math.ceil(h / TILE); row++) {
    g.rect(offsetX, offsetY + row * TILE, w, 1);
    g.fill({ color: COLORS.woodGap, alpha: 0.08 });
  }
  for (let col = 1; col < Math.ceil(w / TILE); col++) {
    g.rect(offsetX + col * TILE, offsetY, 1, h);
    g.fill({ color: COLORS.woodGap, alpha: 0.08 });
  }
}
