import { TILE } from "./palette";
import { WHITEBOARD_W, WHITEBOARD_H } from "./drawFurniture";
import type { OfficeLayout } from "./officeProjection";

const ROOM_SIDE_W = TILE;
const DECOR_DESK_GAP = 26;
const DECOR_MIN_STRIP = 22;

export type PixelDecorPlacement = {
  rel: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PLANTS = [
  "PLANT/PLANT.png",
  "PLANT_2/PLANT_2.png",
  "LARGE_PLANT/LARGE_PLANT.png",
  "CACTUS/CACTUS.png",
  "POT/POT.png",
] as const;

function plantForSlot(seed: number): string {
  return PLANTS[Math.abs(seed) % PLANTS.length]!;
}

/**
 * Posiciones de sprites de muebles Pixel Agents, alineadas con la lógica
 * de `drawOfficeRoomVectorDecor` en `officeBackgroundLayers.ts`.
 */
export function computePixelDecorPlacements(
  layout: OfficeLayout,
  stageW: number,
  innerStageH: number,
): PixelDecorPlacement[] {
  const { floorQuad, wallTop, floorBBox: bb } = layout;
  const roomBottomY = innerStageH;
  const out: PixelDecorPlacement[] = [];
  let plantSlot = 0;

  const shelfW = TILE * 2;
  const decorY = 4;
  const shelfInsetRatio = 0.2;
  const leftShelfX = Math.round(stageW * shelfInsetRatio);
  const rightShelfX = Math.round(stageW * (1 - shelfInsetRatio)) - shelfW;

  out.push({ rel: "BOOKSHELF/BOOKSHELF.png", x: leftShelfX, y: decorY, w: 96, h: 48 });
  out.push({ rel: "BOOKSHELF/BOOKSHELF.png", x: rightShelfX, y: decorY, w: 96, h: 48 });

  const boardW = WHITEBOARD_W;
  const clockR = 16;
  const gap = 18;
  const clockDiameter = (clockR + 2) * 2;
  const clusterW = boardW + gap + clockDiameter;
  const bandLeft = leftShelfX + shelfW + 8;
  const bandRight = rightShelfX - 8;
  const clusterLeft = bandLeft + Math.max(0, (bandRight - bandLeft - clusterW) / 2);
  const clockCx = clusterLeft + boardW + gap + clockR + 2;
  const clockCy = decorY + WHITEBOARD_H / 2;

  out.push({ rel: "WHITEBOARD/WHITEBOARD.png", x: clusterLeft - 4, y: decorY - 2, w: 88, h: 88 });
  out.push({ rel: "CLOCK/CLOCK.png", x: clockCx - 18, y: clockCy - 48, w: 36, h: 72 });

  const inset = ROOM_SIDE_W + 6;
  const pxCoord = (x: number) => Math.min(stageW - 40, Math.max(inset, x));
  const py = (y: number) => Math.min(roomBottomY - 44, Math.max(wallTop + 6, y));
  const floorLeft = inset;
  const floorRight = stageW - inset;
  const floorW = Math.max(40, floorRight - floorLeft);
  const decorFloorH = Math.max(40, roomBottomY - wallTop - 8);
  const fx = (t: number) => floorLeft + t * floorW;

  const quadLeft = Math.min(floorQuad[0]!.x, floorQuad[3]!.x);

  const leftXLo = floorLeft + 4;
  const leftXHi = Math.min(bb.minX - DECOR_DESK_GAP, quadLeft - 8);
  const rightXLo = bb.maxX + DECOR_DESK_GAP;
  const rightXHi = floorRight - 8;

  const leftStripW = leftXHi - leftXLo;
  const rightStripW = rightXHi - rightXLo;
  const hasLeftStrip = leftStripW >= DECOR_MIN_STRIP;
  const hasRightStrip = rightStripW >= DECOR_MIN_STRIP;

  const yBand = (t: number) => py(wallTop + 12 + t * Math.max(32, decorFloorH - 24));
  const lerpX = (lo: number, hi: number, t: number) => pxCoord(lo + t * Math.max(8, hi - lo));

  const canPinLeft = bb.minX > floorLeft + 34;

  const pushPlant = (x: number, yy: number) => {
    const rel = plantForSlot(plantSlot++ * 31 + Math.round(x + yy * 2));
    out.push({ rel, x: x - 8, y: yy - 40, w: 40, h: 80 });
  };

  if (hasLeftStrip && hasRightStrip) {
    const xF = lerpX(leftXLo, leftXHi - TILE - 6, 0.15);
    const yF = yBand(0.14);
    out.push({ rel: "DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png", x: xF - 4, y: yF - 8, w: 72, h: 72 });
    pushPlant(lerpX(leftXLo, leftXHi - 30, 0.48), yBand(0.4));
    out.push({ rel: "BIN/BIN.png", x: lerpX(leftXLo, leftXHi - 14, 0.82) - 8, y: yBand(0.76) - 8, w: 40, h: 40 });

    const cx = lerpX(rightXLo, rightXHi - 28, 0.22);
    const cy = yBand(0.32);
    out.push({ rel: "COFFEE/COFFEE.png", x: cx - 8, y: cy - 8, w: 52, h: 52 });

    pushPlant(lerpX(rightXLo + 6, rightXHi - 34, 0.78), yBand(0.66));
  } else if (hasLeftStrip) {
    out.push({
      rel: "DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png",
      x: lerpX(leftXLo, leftXHi - TILE - 4, 0.12) - 4,
      y: yBand(0.16) - 8,
      w: 72,
      h: 72,
    });
    pushPlant(lerpX(leftXLo, leftXHi - 30, 0.45), yBand(0.38));
    out.push({
      rel: "SMALL_TABLE/SMALL_TABLE_FRONT.png",
      x: lerpX(leftXLo, leftXHi - 26, 0.62) - 16,
      y: yBand(0.52) - 16,
      w: 64,
      h: 64,
    });
    out.push({
      rel: "TABLE_FRONT/TABLE_FRONT.png",
      x: lerpX(leftXLo, leftXHi - 40, 0.88) - 48,
      y: yBand(0.62) - 36,
      w: 96,
      h: 64,
    });
    out.push({ rel: "BIN/BIN.png", x: lerpX(leftXLo, leftXHi - 12, 0.86) - 8, y: yBand(0.78) - 8, w: 40, h: 40 });
    if (decorFloorH > 150) {
      const cmx = lerpX(leftXLo, leftXHi - 28, 0.28);
      const cmy = yBand(0.3);
      out.push({ rel: "COFFEE/COFFEE.png", x: cmx - 8, y: cmy - 8, w: 52, h: 52 });
      out.push({ rel: "COFFEE_TABLE/COFFEE_TABLE.png", x: cmx + 28, y: cmy - 6, w: 64, h: 64 });
    }
  } else if (hasRightStrip) {
    if (canPinLeft) {
      pushPlant(pxCoord(floorLeft + 8), yBand(0.18));
      out.push({ rel: "BIN/BIN.png", x: pxCoord(floorLeft + 6) - 8, y: yBand(0.72) - 8, w: 40, h: 40 });
    }
    const cmx = lerpX(rightXLo, rightXHi - 26, 0.32);
    const cmy = yBand(0.34);
    out.push({ rel: "COFFEE/COFFEE.png", x: cmx - 8, y: cmy - 8, w: 52, h: 52 });
    out.push({ rel: "COFFEE_TABLE/COFFEE_TABLE.png", x: cmx + 28, y: cmy - 6, w: 64, h: 64 });
    out.push({
      rel: "TABLE_FRONT/TABLE_FRONT.png",
      x: lerpX(rightXLo + 4, rightXHi - 48, 0.62) - 48,
      y: yBand(0.55) - 36,
      w: 96,
      h: 64,
    });
    out.push({
      rel: "DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png",
      x: lerpX(rightXLo + 4, rightXHi - TILE - 4, 0.78) - 4,
      y: yBand(0.68) - 8,
      w: 72,
      h: 72,
    });
    pushPlant(lerpX(rightXLo + 8, rightXHi - 32, 0.12), yBand(0.22));
  } else {
    const yRow = py(Math.min(roomBottomY - 42, bb.maxY + 40));
    out.push({ rel: "DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png", x: pxCoord(fx(0.05)) - 4, y: yRow - 8, w: 72, h: 72 });
    pushPlant(pxCoord(fx(0.14)), yRow);
    out.push({ rel: "BIN/BIN.png", x: pxCoord(fx(0.24)) - 8, y: yRow - 8, w: 40, h: 40 });
    if (decorFloorH > 130) {
      const cmx = pxCoord(fx(0.4)) - 8;
      out.push({ rel: "COFFEE/COFFEE.png", x: cmx, y: yRow - 8, w: 52, h: 52 });
      out.push({ rel: "COFFEE_TABLE/COFFEE_TABLE.png", x: cmx + 28, y: yRow - 6, w: 64, h: 64 });
    }
    out.push({
      rel: "SMALL_TABLE/SMALL_TABLE_FRONT.png",
      x: pxCoord(fx(0.48)) - 16,
      y: yRow - 16,
      w: 64,
      h: 64,
    });
    out.push({
      rel: "TABLE_FRONT/TABLE_FRONT.png",
      x: pxCoord(fx(0.66)) - 48,
      y: yRow - 36,
      w: 96,
      h: 64,
    });
    pushPlant(pxCoord(fx(0.86)) - 30, yRow);
  }

  return out;
}
