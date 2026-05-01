import type { Graphics as PixiGraphics } from "pixi.js";
import { drawIsoFloor, drawPlankFloorRect } from "./drawRoom";
import {
  drawBookshelf,
  drawPlant,
  drawWhiteboard,
  drawRoundWallClock,
  drawCoffeeMachine,
  drawFilingCabinet,
  drawOfficePrinter,
  drawWasteBin,
  WHITEBOARD_W,
  WHITEBOARD_H,
} from "./drawFurniture";
import { COLORS, TILE } from "./palette";
import type { OfficeLayout } from "./officeProjection";

/** Grosor visual de pared lateral; encaja con TILE. */
const ROOM_SIDE_W = TILE;
const DECOR_DESK_GAP = 26;
const DECOR_MIN_STRIP = 22;

/**
 * Suelo, paredes, trama isométrica, viñeta — sin muebles decorativos.
 */
export function drawOfficeRoomBase(
  g: PixiGraphics,
  layout: OfficeLayout,
  stageW: number,
  innerStageH: number
) {
  const { floorQuad, wallTop } = layout;
  const [v0, v1] = floorQuad;

  g.clear();

  const roomBottomY = innerStageH;
  const floorH = roomBottomY - wallTop;

  g.rect(0, 0, stageW, innerStageH);
  g.fill({ color: COLORS.sceneVoid });

  drawPlankFloorRect(g, 0, wallTop, stageW, floorH);

  g.rect(0, 0, ROOM_SIDE_W, roomBottomY);
  g.fill({ color: COLORS.wallTrim });
  g.rect(stageW - ROOM_SIDE_W, 0, ROOM_SIDE_W, roomBottomY);
  g.fill({ color: COLORS.wallTrim });
  g.moveTo(ROOM_SIDE_W, wallTop);
  g.lineTo(ROOM_SIDE_W, roomBottomY);
  g.stroke({ color: 0x000000, alpha: 0.12, width: 2 });
  g.moveTo(stageW - ROOM_SIDE_W, wallTop);
  g.lineTo(stageW - ROOM_SIDE_W, roomBottomY);
  g.stroke({ color: 0x000000, alpha: 0.1, width: 2 });

  g.rect(0, 0, stageW, wallTop);
  g.fill({ color: COLORS.wallFace });
  const bands = 5;
  for (let b = 0; b < bands; b++) {
    const by = (b * wallTop) / bands;
    const bh = wallTop / bands;
    g.rect(0, by, stageW, bh);
    g.fill({ color: 0x000000, alpha: 0.01 + b * 0.014 });
  }
  g.rect(0, 0, stageW, wallTop);
  g.fill({ color: 0xffffff, alpha: 0.04 });
  g.rect(0, 0, stageW, Math.max(2, wallTop * 0.35));
  g.fill({ color: 0xffffff, alpha: 0.05 });

  g.rect(0, wallTop - 3, stageW, 3);
  g.fill({ color: COLORS.wallShadow });

  drawIsoFloor(g, floorQuad);

  g.moveTo(v0.x, v0.y);
  g.lineTo(v1.x, v1.y);
  g.stroke({ color: COLORS.wallShadow, width: 3 });
  g.moveTo(v0.x, v0.y);
  g.lineTo(v1.x, v1.y);
  g.stroke({ color: 0x000000, alpha: 0.1, width: 5 });

  const v = 28;
  g.rect(0, 0, stageW, v);
  g.fill({ color: COLORS.sceneVignette, alpha: 0.2 });
  g.rect(0, innerStageH - v, stageW, v);
  g.fill({ color: COLORS.sceneVignette, alpha: 0.2 });
  g.rect(0, 0, v, innerStageH);
  g.fill({ color: COLORS.sceneVignette, alpha: 0.15 });
  g.rect(stageW - v, 0, v, innerStageH);
  g.fill({ color: COLORS.sceneVignette, alpha: 0.15 });
}

/**
 * Muebles vectoriales (fallback si no hay sprites Pixel Agents).
 */
export function drawOfficeRoomVectorDecor(
  g: PixiGraphics,
  layout: OfficeLayout,
  stageW: number,
  innerStageH: number
) {
  const { floorQuad, wallTop, floorBBox: bb } = layout;

  g.clear();

  const roomBottomY = innerStageH;
  const decorY = 4;
  const shelfW = TILE * 2;
  const shelfInsetRatio = 0.2;
  const leftShelfX = Math.round(stageW * shelfInsetRatio);
  const rightShelfX = Math.round(stageW * (1 - shelfInsetRatio)) - shelfW;
  drawBookshelf(g, leftShelfX, decorY);
  drawBookshelf(g, rightShelfX, decorY);

  const boardW = WHITEBOARD_W;
  const clockR = 16;
  const gap = 18;
  const clockDiameter = (clockR + 2) * 2;
  const clusterW = boardW + gap + clockDiameter;
  const bandLeft = leftShelfX + shelfW + 8;
  const bandRight = rightShelfX - 8;
  const clusterLeft = bandLeft + Math.max(0, (bandRight - bandLeft - clusterW) / 2);
  drawWhiteboard(g, clusterLeft, decorY);
  const clockCx = clusterLeft + boardW + gap + clockR + 2;
  const clockCy = decorY + WHITEBOARD_H / 2;
  drawRoundWallClock(g, clockCx, clockCy, clockR);

  const inset = ROOM_SIDE_W + 6;
  const px = (x: number) => Math.min(stageW - 40, Math.max(inset, x));
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

  const lerpX = (lo: number, hi: number, t: number) => px(lo + t * Math.max(8, hi - lo));

  const canPinLeft = bb.minX > floorLeft + 34;

  if (hasLeftStrip && hasRightStrip) {
    drawFilingCabinet(g, lerpX(leftXLo, leftXHi - TILE - 6, 0.15), yBand(0.14));
    drawPlant(g, lerpX(leftXLo, leftXHi - 30, 0.48), yBand(0.4));
    drawWasteBin(g, lerpX(leftXLo, leftXHi - 14, 0.82), yBand(0.76));
    drawCoffeeMachine(g, lerpX(rightXLo, rightXHi - 28, 0.22), yBand(0.32));
    drawOfficePrinter(g, lerpX(rightXLo + 2, rightXHi - 26, 0.52), yBand(0.5));
    drawPlant(g, lerpX(rightXLo + 6, rightXHi - 34, 0.78), yBand(0.66));
  } else if (hasLeftStrip) {
    drawFilingCabinet(g, lerpX(leftXLo, leftXHi - TILE - 4, 0.12), yBand(0.16));
    drawPlant(g, lerpX(leftXLo, leftXHi - 30, 0.45), yBand(0.38));
    drawOfficePrinter(g, lerpX(leftXLo, leftXHi - 26, 0.62), yBand(0.52));
    drawWasteBin(g, lerpX(leftXLo, leftXHi - 12, 0.86), yBand(0.78));
    if (decorFloorH > 150) drawCoffeeMachine(g, lerpX(leftXLo, leftXHi - 28, 0.28), yBand(0.3));
  } else if (hasRightStrip) {
    if (canPinLeft) {
      drawPlant(g, px(floorLeft + 8), yBand(0.18));
      drawWasteBin(g, px(floorLeft + 6), yBand(0.72));
    }
    drawCoffeeMachine(g, lerpX(rightXLo, rightXHi - 26, 0.32), yBand(0.34));
    drawOfficePrinter(g, lerpX(rightXLo + 2, rightXHi - 24, 0.55), yBand(0.5));
    drawFilingCabinet(g, lerpX(rightXLo + 4, rightXHi - TILE - 4, 0.78), yBand(0.68));
    drawPlant(g, lerpX(rightXLo + 8, rightXHi - 32, 0.12), yBand(0.22));
  } else {
    const yRow = py(Math.min(roomBottomY - 42, bb.maxY + 40));
    drawFilingCabinet(g, px(fx(0.05)), yRow);
    drawPlant(g, px(fx(0.14)), yRow);
    drawWasteBin(g, px(fx(0.24)), yRow);
    if (decorFloorH > 130) drawCoffeeMachine(g, px(fx(0.4)), yRow);
    drawOfficePrinter(g, px(fx(0.54)), yRow);
    drawPlant(g, px(fx(0.86)) - 30, yRow);
  }
}
