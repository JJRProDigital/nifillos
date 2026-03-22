import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS, TILE } from "./palette";

export function drawBookshelf(g: PixiGraphics, x: number, y: number) {
  const w = TILE * 2;
  const h = TILE * 1.5;

  g.rect(x + w, y + 2, 4, h - 3);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x, y + h, w + 3, 3);
  g.fill({ color: COLORS.extrudeBottom });

  g.rect(x, y, w, h);
  g.fill({ color: COLORS.bookshelfWood });
  g.rect(x, y, w, 2);
  g.fill({ color: COLORS.deskGrainLight, alpha: 0.25 });
  g.stroke({ color: COLORS.deskShadow, width: 1 });

  for (let row = 0; row < 3; row++) {
    const sy = y + 4 + row * (h / 3);
    g.rect(x + 2, sy + (h / 3) - 3, w - 4, 2);
    g.fill({ color: COLORS.deskShadow });
    const bookColors = [0xcc4444, 0x4466aa, 0x44aa44, 0xaaaa44, 0x8844aa, 0xaa6644];
    for (let b = 0; b < 5; b++) {
      const bx = x + 4 + b * 11;
      const bw = 8 + (b % 2) * 2;
      const bh = (h / 3) - 6;
      g.rect(bx, sy, bw, bh);
      g.fill({ color: bookColors[(row * 5 + b) % bookColors.length] });
    }
  }
}

export function drawPlant(g: PixiGraphics, x: number, y: number) {
  g.roundRect(x + 5, y + 31, 22, 5, 2);
  g.fill({ color: 0x000000, alpha: 0.14 });
  g.roundRect(x + 24, y + 19, 5, 12, 2);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 6, y + 30, 22, 4);
  g.fill({ color: COLORS.extrudeBottom });

  g.roundRect(x + 6, y + 18, 20, 14, 3);
  g.fill({ color: COLORS.plantPot });
  g.roundRect(x + 4, y + 16, 24, 4, 2);
  g.fill({ color: COLORS.plantPot });
  g.rect(x + 6, y + 18, 20, 2);
  g.fill({ color: 0xffffff, alpha: 0.12 });

  // Lush leaves (overlapping circles)
  const leaves: [number, number, number, number][] = [
    [16, 10, 8, COLORS.plantGreen],
    [10, 6, 6, COLORS.plantGreen],
    [22, 6, 6, COLORS.plantGreen],
    [13, 2, 5, COLORS.plantDark],
    [19, 3, 5, COLORS.plantDark],
    [16, 0, 4, COLORS.plantGreen],
  ];
  for (const [lx, ly, r, color] of leaves) {
    g.circle(x + lx, y + ly, r);
    g.fill({ color });
  }
}

/** Reloj pequeño (legacy); preferir `drawRoundWallClock` en la pared. */
export function drawClock(g: PixiGraphics, x: number, y: number) {
  drawRoundWallClock(g, x + 12, y + 12, 11);
}

/**
 * Reloj redondo de pared, centrado en (cx, cy), contraste alto sobre yeso.
 */
export function drawRoundWallClock(g: PixiGraphics, cx: number, cy: number, radius: number) {
  const r = radius;
  // Sombra en la pared
  g.circle(cx + 2, cy + 2, r + 1);
  g.fill({ color: 0x000000, alpha: 0.2 });
  // Marco exterior oscuro
  g.circle(cx, cy, r + 2);
  g.fill({ color: 0x3a3530 });
  g.circle(cx, cy, r + 1);
  g.fill({ color: 0x5c564e });
  // Cara clara
  g.circle(cx, cy, r);
  g.fill({ color: 0xfffdf8 });
  g.circle(cx - r * 0.35, cy - r * 0.35, r * 0.25);
  g.fill({ color: 0xffffff, alpha: 0.35 });

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const tickLen = i % 3 === 0 ? 3.2 : 1.6;
    const r1 = r - 2;
    const r2 = r - 2 - tickLen;
    g.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    g.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    g.stroke({ color: 0x2a2824, width: i % 3 === 0 ? 1.5 : 1 });
  }

  // Centro
  g.circle(cx, cy, 2.2);
  g.fill({ color: 0x2a2824 });
  // Manecillas
  g.moveTo(cx, cy);
  g.lineTo(cx, cy - r * 0.55);
  g.stroke({ color: 0x1a1814, width: 2 });
  g.moveTo(cx, cy);
  g.lineTo(cx + r * 0.42, cy + r * 0.08);
  g.stroke({ color: 0x1a1814, width: 1.5 });
}

/** Tamaño dibujado de la pizarra (para alinear reloj y librerías en `OfficeScene`). */
export const WHITEBOARD_W = 76;
export const WHITEBOARD_H = 48;

export function drawWhiteboard(g: PixiGraphics, x: number, y: number) {
  const W = WHITEBOARD_W;
  const H = WHITEBOARD_H;
  const innerW = W - 6;
  const innerH = H - 10;

  g.rect(x + W, y + 4, 5, innerH + 2);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 4, y + H - 2, W - 2, 5);
  g.fill({ color: COLORS.extrudeBottom });

  g.roundRect(x, y, W, H, 2);
  g.fill({ color: COLORS.whiteboardFrame });
  g.rect(x + 2, y + 2, W - 4, 3);
  g.fill({ color: 0xffffff, alpha: 0.15 });

  g.rect(x + 3, y + 3, innerW, innerH);
  g.fill({ color: COLORS.whiteboardBg });

  g.moveTo(x + 10, y + 12);
  g.lineTo(x + 32, y + 20);
  g.stroke({ color: 0x4a78b0, width: 1.5 });

  g.moveTo(x + 14, y + 28);
  g.lineTo(x + 48, y + 16);
  g.stroke({ color: 0xa84848, width: 1.5 });

  g.moveTo(x + 38, y + 28);
  g.lineTo(x + 64, y + 34);
  g.stroke({ color: 0x4a8a4a, width: 1.5 });

  g.rect(x + 6, y + H - 6, innerW - 6, 3);
  g.fill({ color: COLORS.whiteboardFrame });
}

export function drawCoffeeMachine(g: PixiGraphics, x: number, y: number) {
  g.roundRect(x + 5, y + 27, 20, 5, 2);
  g.fill({ color: 0x000000, alpha: 0.12 });
  g.rect(x + 24, y + 5, 5, 22);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 8, y + 26, 18, 4);
  g.fill({ color: COLORS.extrudeBottom });
  g.roundRect(x + 6, y + 4, 20, 24, 2);
  g.fill({ color: COLORS.coffeeMachine });
  g.rect(x + 8, y + 5, 16, 3);
  g.fill({ color: 0xffffff, alpha: 0.1 });
  g.stroke({ color: 0x2a2a2a, width: 1 });
  g.rect(x + 8, y + 6, 16, 8);
  g.fill({ color: 0x3a3a3a });
  g.circle(x + 12, y + 10, 2);
  g.fill({ color: 0x44ff44 });
  g.rect(x + 10, y + 18, 12, 8);
  g.fill({ color: 0x2a2a2a });
  g.rect(x + 12, y + 20, 8, 6);
  g.fill({ color: 0xeeeeee });
}

export function drawFilingCabinet(g: PixiGraphics, x: number, y: number) {
  const w = TILE;
  const h = TILE * 1.5;

  g.roundRect(x + 0, y + h + 1, w + 4, 5, 2);
  g.fill({ color: 0x000000, alpha: 0.14 });

  g.rect(x + w - 1, y + 3, 5, h - 4);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 2, y + h - 1, w + 2, 4);
  g.fill({ color: COLORS.extrudeBottom });

  g.roundRect(x, y, w, h, 2);
  g.fill({ color: 0x6a6a7a });
  g.rect(x + 2, y + 2, w - 4, 3);
  g.fill({ color: 0xffffff, alpha: 0.08 });
  g.stroke({ color: 0x4a4a5a, width: 1 });

  for (let d = 0; d < 3; d++) {
    const dy = y + 4 + d * 14;
    g.roundRect(x + 3, dy, w - 6, 12, 1);
    g.fill({ color: 0x5a5a6a });
    g.roundRect(x + 12, dy + 4, 8, 3, 1);
    g.fill({ color: 0x8a8a9a });
  }
}

/** Impresora de oficina compacta (misma escala aprox. que cafetera). */
export function drawOfficePrinter(g: PixiGraphics, x: number, y: number) {
  g.roundRect(x + 4, y + 25, 20, 4, 2);
  g.fill({ color: 0x000000, alpha: 0.12 });
  g.rect(x + 22, y + 4, 4, 18);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 6, y + 22, 18, 3);
  g.fill({ color: COLORS.extrudeBottom });
  g.roundRect(x + 4, y + 2, 20, 22, 2);
  g.fill({ color: 0xe8e8ec });
  g.stroke({ color: 0x9a9aa4, width: 1 });
  g.rect(x + 6, y + 4, 16, 8);
  g.fill({ color: 0xffffff });
  g.rect(x + 8, y + 6, 12, 4);
  g.fill({ color: 0xd0d4dc });
  g.rect(x + 6, y + 14, 16, 6);
  g.fill({ color: 0x4a4a52 });
  g.rect(x + 8, y + 15, 12, 2);
  g.fill({ color: 0x88aacc });
  g.rect(x + 10, y + 20, 8, 2);
  g.fill({ color: 0x2a2a30 });
}

/** Papelera baja; poco intrusiva junto a pared. */
export function drawWasteBin(g: PixiGraphics, x: number, y: number) {
  g.roundRect(x + 2, y + 19, 16, 4, 2);
  g.fill({ color: 0x000000, alpha: 0.13 });
  g.rect(x + 16, y + 6, 3, 14);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 4, y + 18, 14, 3);
  g.fill({ color: COLORS.extrudeBottom });
  g.roundRect(x + 3, y + 4, 14, 16, 2);
  g.fill({ color: 0x5a5c62 });
  g.stroke({ color: 0x3a3c42, width: 1 });
  g.rect(x + 4, y + 5, 12, 2);
  g.fill({ color: 0x7a7c84 });
}
