import type { Graphics as PixiGraphics } from "pixi.js";
import { COLORS } from "./palette";

/** Tablero visto en perspectiva: cara superior ligeramente en trapecio + vetas y brillo. */
function drawDeskTop3d(
  g: PixiGraphics,
  x: number,
  y: number,
  deskLight: number,
  deskBase: number,
  deskDark: number
) {
  const x1 = x + 12;
  const x2 = x + 112;
  const x3 = x + 118;
  const x4 = x + 8;
  const yT = y + 5;
  const yB = y + 43;
  for (let row = 0; row < 10; row++) {
    const t = row / 9;
    const lx = x1 + (x4 - x1) * t;
    const rx = x2 + (x3 - x2) * t;
    const yy = yT + ((yB - yT) * row) / 9;
    const yy2 = yT + ((yB - yT) * (row + 1)) / 9;
    const shade = row % 3 === 0 ? deskLight : row % 3 === 1 ? deskBase : deskDark;
    g.poly([lx, yy, rx, yy, rx, yy2, lx, yy2]);
    g.fill({ color: shade });
  }
  g.poly([x1, yT, x2, yT, x3, yB, x4, yB]);
  g.stroke({ color: deskDark, width: 1, alpha: 0.5 });
  // Veta larga y reflejo suave (luz arriba-izquierda)
  g.moveTo(x1 + 8, yT + 2);
  g.lineTo(x4 + 4, yB - 4);
  g.stroke({ color: deskLight, width: 1, alpha: 0.35 });
  g.moveTo(x2 - 6, yT + 4);
  g.lineTo(x3 - 4, yB - 6);
  g.stroke({ color: 0xffffff, alpha: 0.08, width: 1 });
}

// Cell is 128px wide × 128px tall.
// Y layout (updated for visual upgrade):
//   y-30  name card (overflow above cell)
//   y+0   cell top boundary
//   y+4   desk surface starts
//   y+8   monitor top
//   y+44  desk front edge
//   y+48  keyboard + accessories zone
//   y+56  chair back (behind character)
//   y+58  character sprite (48×48)
//   y+108 chair base / casters
//   y+128 cell bottom

export function drawDeskArea(g: PixiGraphics, x: number, y: number) {
  // Sombra de contacto suelo (elipse fake 3D)
  g.ellipse(x + 64, y + 118, 52, 10);
  g.fill({ color: 0x000000, alpha: 0.07 });
  g.roundRect(x + 8, y + 2, 112, 118, 4);
  g.fill({ color: 0x000000, alpha: 0.03 });

  // Chair back (visible behind character)
  g.rect(x + 38, y + 56, 52, 4);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 39, y + 56, 50, 2);
  g.fill({ color: COLORS.chairBase }); // highlight top

  // Armrests
  g.rect(x + 34, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 35, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });
  g.rect(x + 86, y + 60, 8, 12);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 87, y + 60, 6, 2);
  g.fill({ color: COLORS.chairBase });

  // Seat cushion (volumen)
  g.rect(x + 42, y + 68, 44, 14);
  g.fill({ color: 0x2a2a3a });
  g.rect(x + 44, y + 70, 40, 10);
  g.fill({ color: COLORS.chairSeat });
  g.rect(x + 44, y + 70, 40, 2);
  g.fill({ color: COLORS.extrudeHighlight, alpha: 0.35 });
  g.rect(x + 80, y + 70, 6, 10);
  g.fill({ color: COLORS.extrudeSide, alpha: 0.7 });

  // Center pole
  g.rect(x + 62, y + 108, 4, 4);
  g.fill({ color: COLORS.chairBase });

  // Star base with casters
  const cx = x + 64;
  const cy = y + 114;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const wx = cx + Math.cos(angle) * 16;
    const wy = cy + Math.sin(angle) * 8;
    g.rect(Math.round(wx) - 2, Math.round(wy) - 1, 4, 3);
    g.fill({ color: COLORS.chairBase });
    // Caster wheel
    g.rect(Math.round(wx) - 1, Math.round(wy) + 1, 2, 2);
    g.fill({ color: 0x5a5a6a });
  }
}

export function drawWorkstationBack(g: PixiGraphics, x: number, y: number) {
  const deskLight = COLORS.deskGrainLight,
    deskBase = COLORS.deskTop,
    deskDark = COLORS.deskGrainDark;

  // Grosor del tablero: cara derecha + inferior (luz arriba-izquierda)
  g.poly([x + 118, y + 5, x + 124, y + 7, x + 124, y + 44, x + 118, y + 43]);
  g.fill({ color: COLORS.extrudeSide });
  g.poly([x + 8, y + 43, x + 118, y + 43, x + 124, y + 44, x + 14, y + 47]);
  g.fill({ color: COLORS.extrudeBottom });
  // Cara izquierda del tablero (más sombreada)
  g.poly([x + 8, y + 5, x + 12, y + 6, x + 12, y + 43, x + 8, y + 43]);
  g.fill({ color: COLORS.deskShadow, alpha: 0.85 });

  drawDeskTop3d(g, x, y, deskLight, deskBase, deskDark);

  // Hueco / rebaje frontal del tablero (cantos redondeados visuales)
  g.rect(x + 18, y + 42, 92, 2);
  g.fill({ color: 0x000000, alpha: 0.06 });

  // Monitor — profundidad posterior
  g.rect(x + 92, y + 10, 5, 26);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 36, y + 36, 58, 4);
  g.fill({ color: COLORS.extrudeBottom });
  // Bisagra/soporte trasero fino
  g.rect(x + 60, y + 36, 8, 3);
  g.fill({ color: 0x1a1c22 });

  g.roundRect(x + 34, y + 8, 60, 30, 2);
  g.fill({ color: 0x12141a });
  g.roundRect(x + 35, y + 9, 58, 28, 1);
  g.fill({ color: COLORS.monitorFrame });
  // Bisel interior oscuro
  g.roundRect(x + 36, y + 10, 56, 26, 1);
  g.fill({ color: 0x181c24 });
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreen });
  for (let i = 0; i < 5; i++) {
    g.rect(x + 39, y + 13 + i * 4, 25 + ((i * 7) % 20), 1);
    g.fill({ color: COLORS.monitorScreenOn, alpha: 0.2 });
  }
  g.rect(x + 37, y + 11, 54, 2);
  g.fill({ color: 0xffffff, alpha: 0.14 });
  g.rect(x + 37, y + 12, 22, 1);
  g.fill({ color: 0xffffff, alpha: 0.22 });
  g.rect(x + 63, y + 9, 2, 1);
  g.fill({ color: 0x222222 });
  // LED de encendido
  g.rect(x + 38, y + 33, 3, 2);
  g.fill({ color: 0x2a8a4a });
  g.rect(x + 38, y + 33, 1, 1);
  g.fill({ color: 0x6ae0a0, alpha: 0.5 });
  g.rect(x + 37, y + 35, 54, 3);
  g.fill({ color: COLORS.monitorFrame });
  g.rect(x + 37, y + 35, 54, 1);
  g.fill({ color: 0x3a424c, alpha: 0.6 });

  // Columna del soporte + base en T (perspectiva)
  g.rect(x + 60, y + 38, 8, 6);
  g.fill({ color: 0x2a2e36 });
  g.rect(x + 61, y + 39, 6, 4);
  g.fill({ color: COLORS.extrudeHighlight, alpha: 0.25 });
  g.roundRect(x + 48, y + 43, 32, 5, 2);
  g.fill({ color: 0x3a3e48 });
  g.poly([x + 78, y + 45, x + 82, y + 45, x + 82, y + 49, x + 78, y + 48]);
  g.fill({ color: COLORS.extrudeDeep });
  g.roundRect(x + 50, y + 44, 28, 2, 1);
  g.fill({ color: 0x5a5e68 });
  g.roundRect(x + 54, y + 45, 20, 1, 0.5);
  g.fill({ color: 0x8a9098, alpha: 0.35 });

  // Cable del monitor al tablero
  g.moveTo(x + 64, y + 38);
  g.bezierCurveTo(x + 58, y + 42, x + 52, y + 44, x + 48, y + 46);
  g.stroke({ color: 0x1a1a1e, width: 1.5, alpha: 0.85 });
  g.moveTo(x + 64, y + 38);
  g.bezierCurveTo(x + 58, y + 42, x + 52, y + 44, x + 48, y + 46);
  g.stroke({ color: 0x3a3a44, width: 0.6, alpha: 0.4 });
}

export function drawWorkstationFront(g: PixiGraphics, x: number, y: number) {
  g.rect(x + 116, y + 48, 4, 8);
  g.fill({ color: COLORS.extrudeSide });
  g.rect(x + 10, y + 48, 108, 6);
  g.fill({ color: COLORS.deskEdge });
  g.rect(x + 10, y + 48, 108, 2);
  g.fill({ color: COLORS.deskGrainLight, alpha: 0.45 });
  g.rect(x + 10, y + 53, 108, 2);
  g.fill({ color: COLORS.deskShadow, alpha: 0.38 });
  g.rect(x + 12, y + 55, 104, 2);
  g.fill({ color: 0x000000, alpha: 0.14 });
  // Cantos del frente del tablero
  g.rect(x + 10, y + 48, 2, 6);
  g.fill({ color: COLORS.deskShadow, alpha: 0.5 });
  g.rect(x + 116, y + 48, 2, 6);
  g.fill({ color: COLORS.deskGrainLight, alpha: 0.25 });

  // Patas metálicas delanteras (marco tipo escritorio bench)
  const leg = 0x4a5058;
  const legHi = 0x6a7078;
  g.roundRect(x + 14, y + 52, 7, 7, 1);
  g.fill({ color: leg });
  g.rect(x + 15, y + 53, 5, 1);
  g.fill({ color: legHi, alpha: 0.4 });
  g.roundRect(x + 107, y + 52, 7, 7, 1);
  g.fill({ color: leg });
  g.rect(x + 108, y + 53, 5, 1);
  g.fill({ color: legHi, alpha: 0.4 });
  // Panel modestia bajo teclado (sutil)
  g.rect(x + 28, y + 52, 72, 5);
  g.fill({ color: 0x2a2830, alpha: 0.35 });
  g.rect(x + 30, y + 53, 68, 1);
  g.fill({ color: 0x000000, alpha: 0.15 });

  g.roundRect(x + 40, y + 48, 36, 8, 1);
  g.fill({ color: COLORS.keyboard });
  g.rect(x + 74, y + 49, 3, 6);
  g.fill({ color: COLORS.extrudeDeep });
  g.rect(x + 41, y + 48, 34, 1);
  g.fill({ color: COLORS.extrudeHighlight, alpha: 0.25 });
  // Individual keys (3 rows × 8 keys + spacebar)
  for (let row = 0; row < 3; row++) {
    for (let key = 0; key < 8; key++) {
      g.rect(x + 42 + key * 4, y + 49 + row * 2, 3, 1);
      g.fill({ color: 0x5a5a5a });
    }
  }
  // Spacebar
  g.rect(x + 50, y + 55, 12, 1);
  g.fill({ color: 0x5a5a5a });

  // Mousepad
  g.rect(x + 80, y + 46, 16, 18);
  g.fill({ color: 0x2a2a3a });
  g.roundRect(x + 83, y + 48, 10, 13, 3);
  g.fill({ color: COLORS.keyboard });
  g.rect(x + 91, y + 50, 2, 10);
  g.fill({ color: COLORS.extrudeDeep });
  // Mouse buttons (top)
  g.rect(x + 84, y + 48, 8, 2);
  g.fill({ color: 0x4a4a52 });
  // Scroll wheel
  g.rect(x + 87, y + 48, 2, 3);
  g.fill({ color: 0x5a5a62 });
  // Left shadow edge
  g.rect(x + 83, y + 48, 1, 13);
  g.fill({ color: 0x2a2a32 });
}

export function drawScreenGlow(g: PixiGraphics, x: number, y: number) {
  // Active monitor screen
  g.roundRect(x + 37, y + 11, 54, 24, 1);
  g.fill({ color: COLORS.monitorScreenOn });
  // Ambient glow
  g.roundRect(x + 31, y + 7, 66, 32, 3);
  g.fill({ color: COLORS.monitorScreenOn, alpha: 0.06 });
}

// === Desk Accessories ===
// Each agent gets 2-3 accessories deterministically selected by agentIndex.

function drawCoffeeMug(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y + 2, 8, 8);
  g.fill({ color: COLORS.mugBody });
  g.rect(x, y + 2, 8, 2);
  g.fill({ color: COLORS.mugRim });
  g.rect(x + 8, y + 4, 3, 4);
  g.fill({ color: COLORS.mugHandle });
  // Steam wisps
  g.rect(x + 2, y, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.35 });
  g.rect(x + 4, y - 1, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.25 });
  g.rect(x + 3, y - 2, 1, 1);
  g.fill({ color: 0xffffff, alpha: 0.15 });
}

function drawMiniPlant(g: PixiGraphics, x: number, y: number) {
  g.rect(x + 1, y + 8, 8, 6);
  g.fill({ color: COLORS.plantPot });
  g.rect(x, y + 6, 10, 3);
  g.fill({ color: COLORS.plantPot });
  g.circle(x + 5, y + 4, 3);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 3, y + 2, 2);
  g.fill({ color: COLORS.plantDark });
  g.circle(x + 7, y + 2, 2);
  g.fill({ color: COLORS.plantGreen });
  g.circle(x + 5, y + 1, 2);
  g.fill({ color: COLORS.plantDark });
}

function drawPostIts(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y, 7, 7);
  g.fill({ color: COLORS.postItPink });
  g.rect(x + 3, y + 2, 8, 8);
  g.fill({ color: COLORS.postItYellow });
  g.rect(x + 3, y + 2, 8, 2);
  g.fill({ color: 0xeedd44 });
  g.rect(x + 4, y + 5, 5, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
  g.rect(x + 4, y + 7, 4, 1);
  g.fill({ color: 0x000000, alpha: 0.12 });
}

function drawBookStack(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y + 4, 10, 3);
  g.fill({ color: COLORS.bookRed });
  g.rect(x, y + 2, 10, 3);
  g.fill({ color: COLORS.bookBlue });
  g.rect(x + 1, y, 8, 3);
  g.fill({ color: COLORS.bookGreen });
  // Spine lines
  g.rect(x, y + 4, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
  g.rect(x, y + 2, 1, 3);
  g.fill({ color: 0x000000, alpha: 0.15 });
}

function drawPhotoFrame(g: PixiGraphics, x: number, y: number) {
  g.rect(x, y, 8, 10);
  g.fill({ color: COLORS.photoFrame });
  g.rect(x + 1, y + 1, 6, 8);
  g.fill({ color: 0x88aacc }); // photo tint
}

function drawWaterBottle(g: PixiGraphics, x: number, y: number) {
  g.rect(x + 1, y, 4, 2);
  g.fill({ color: COLORS.waterCap });
  g.rect(x, y + 2, 6, 10);
  g.fill({ color: COLORS.waterBottle });
  g.rect(x + 1, y + 3, 4, 4);
  g.fill({ color: 0xaaddee, alpha: 0.5 }); // water level
}

const ACCESSORY_POOL = [
  drawCoffeeMug, drawMiniPlant, drawPostIts,
  drawBookStack, drawPhotoFrame, drawWaterBottle,
];

// Left zone: x+14..x+32, right zone: x+96..x+114
const LEFT_SLOT = { dx: 14, dy: 38 };
const RIGHT_SLOT = { dx: 100, dy: 38 };

export function drawDeskAccessories(
  g: PixiGraphics,
  x: number,
  y: number,
  agentIndex: number,
  /** Desplazamiento Y extra cuando el tablero pixel ocupa más bajo que el escritorio vectorial. */
  extraY = 0,
) {
  const seed = agentIndex * 7 + 3; // deterministic pseudo-random
  const idx1 = seed % ACCESSORY_POOL.length;
  const idx2 = (seed + 2) % ACCESSORY_POOL.length;

  ACCESSORY_POOL[idx1](g, x + LEFT_SLOT.dx, y + LEFT_SLOT.dy + extraY);
  if (idx2 !== idx1) {
    ACCESSORY_POOL[idx2](g, x + RIGHT_SLOT.dx, y + RIGHT_SLOT.dy + extraY);
  }
}
