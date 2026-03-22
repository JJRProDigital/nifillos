import { CELL_W, CELL_H, TILE } from "./palette";

/** Medio ancho del rombo isométrico (2:1) */
export const ISO_HW = CELL_W / 2;
/** Mitad de la altura del rombo (altura total del tile = 2×ISO_HH) */
export const ISO_HH = CELL_H / 4;

const MIN_STAGE_W = 720;
const MIN_STAGE_H = 520;
/** Margen exterior mínimo respecto al borde del canvas */
const STAGE_PAD = 96;
/** Espacio extra para tarjeta de nombre y glow del monitor */
const NAME_OVERFLOW = 56;
/** Separación visual entre el borde inferior de la pared y el borde posterior del suelo (sin STAGE_PAD). */
const FLOOR_WALL_GAP = 4;
/**
 * Banda extra bajo la pared para que el suelo isométrico y los escritorios (y globos nombre ~30px arriba
 * del tile) no invadan el yeso. 42px dejaba la fila trasera casi pegada al zócalo.
 */
const DESK_CLEARANCE_BELOW_WALL = 66;
const WALL_SKEW = 12;
const WALL_PAD = 20;
const FURNITURE_SLACK_X = 48;
const FURNITURE_SLACK_Y = 72;

export type IsoPoint = { x: number; y: number };

/** Vértice superior del rombo de la celda (col, row), 1-based. */
export function isoTopVertex(col: number, row: number, ox: number, oy: number): IsoPoint {
  const c = col - 1;
  const r = row - 1;
  return {
    x: ox + (c - r) * ISO_HW,
    y: oy + (c + r) * ISO_HH,
  };
}

/** Centro del rombo (pie del tile isométrico). */
export function isoCellCenter(col: number, row: number, ox: number, oy: number): IsoPoint {
  const top = isoTopVertex(col, row, ox, oy);
  return { x: top.x, y: top.y + ISO_HH };
}

/**
 * Esquina superior izquierda del bloque 128×128 del escritorio,
 * centrado en el rombo (vista cenital dentro del tile).
 */
export function deskTopLeft(col: number, row: number, ox: number, oy: number): IsoPoint {
  const c = isoCellCenter(col, row, ox, oy);
  return { x: c.x - CELL_W / 2, y: c.y - CELL_H / 2 };
}

export function deskCenter(col: number, row: number, ox: number, oy: number): IsoPoint {
  const tl = deskTopLeft(col, row, ox, oy);
  return { x: tl.x + CELL_W / 2, y: tl.y + CELL_H / 2 };
}

/** Cuadrilátero del suelo que cubre celdas [1..maxCol] × [1..maxRow] (vértices superiores). */
export function isoFloorQuad(
  maxCol: number,
  maxRow: number,
  ox: number,
  oy: number
): [IsoPoint, IsoPoint, IsoPoint, IsoPoint] {
  return [
    isoTopVertex(1, 1, ox, oy),
    isoTopVertex(maxCol, 1, ox, oy),
    isoTopVertex(maxCol, maxRow, ox, oy),
    isoTopVertex(1, maxRow, ox, oy),
  ];
}

function boundsWithDesks(maxCol: number, maxRow: number, ox: number, oy: number) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let col = 1; col <= maxCol; col++) {
    for (let row = 1; row <= maxRow; row++) {
      const d = deskTopLeft(col, row, ox, oy);
      minX = Math.min(minX, d.x);
      minY = Math.min(minY, d.y - NAME_OVERFLOW);
      maxX = Math.max(maxX, d.x + CELL_W);
      maxY = Math.max(maxY, d.y + CELL_H);
    }
  }
  return { minX, minY, maxX, maxY };
}

export type OfficeLayout = {
  gridOx: number;
  gridOy: number;
  floorQuad: [IsoPoint, IsoPoint, IsoPoint, IsoPoint];
  stageW: number;
  /** Altura del canvas (= mundo de la oficina; sin franja vacía superior). */
  stageH: number;
  innerStageH: number;
  wallTop: number;
  floorBBox: { minX: number; minY: number; maxX: number; maxY: number };
};

/** Todo lo que pinta el fondo (suelo, paredes laterales, muebles en bordes). */
function sceneScreenExtents(
  quad: readonly [IsoPoint, IsoPoint, IsoPoint, IsoPoint],
  bb: { minX: number; minY: number; maxX: number; maxY: number }
) {
  const [v0, v1, v2, v3] = quad;
  const wallLeft = Math.min(v0.x, v1.x, v2.x, v3.x, bb.minX) - WALL_PAD;
  const wallRight = Math.max(v0.x, v1.x, v2.x, v3.x, bb.maxX) + WALL_PAD;

  let minX = Math.min(
    bb.minX,
    wallLeft,
    v0.x - WALL_SKEW,
    v3.x - WALL_SKEW,
    v0.x,
    v3.x
  );
  let maxX = Math.max(
    bb.maxX,
    wallRight,
    v1.x + WALL_SKEW,
    v2.x + WALL_SKEW,
    v1.x,
    v2.x,
    bb.maxX + FURNITURE_SLACK_X
  );
  let maxY = Math.max(bb.maxY, v2.y, v3.y, bb.maxY + FURNITURE_SLACK_Y);

  return { minX, maxX, maxY };
}

/**
 * Calcula origen de la rejilla para que quepa en el escenario y el suelo quede bajo la pared.
 */
export function computeOfficeLayout(maxCol: number, maxRow: number): OfficeLayout {
  const wallTop = TILE * 2;
  const quadRaw = isoFloorQuad(maxCol, maxRow, 0, 0);

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of quadRaw) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const quadOnlyMinY = minY;
  const deskB = boundsWithDesks(maxCol, maxRow, 0, 0);
  minX = Math.min(minX, deskB.minX);
  minY = Math.min(minY, deskB.minY);
  maxX = Math.max(maxX, deskB.maxX);
  maxY = Math.max(maxY, deskB.maxY);

  let gridOx = STAGE_PAD - minX;
  // Anclar el suelo al borde inferior de la pared usando solo el cuadrilátero del suelo (quadOnlyMinY),
  // no minY de escritorios/etiquetas — mezclarlo con STAGE_PAD abría un hueco enorme entre pared y suelo.
  const gridOy = wallTop + FLOOR_WALL_GAP + DESK_CLEARANCE_BELOW_WALL - quadOnlyMinY;

  let floorQuad = isoFloorQuad(maxCol, maxRow, gridOx, gridOy);
  let bb = boundsWithDesks(maxCol, maxRow, gridOx, gridOy);
  let ext = sceneScreenExtents(floorQuad, bb);

  if (ext.minX < STAGE_PAD) {
    const shift = STAGE_PAD - ext.minX;
    gridOx += shift;
    floorQuad = isoFloorQuad(maxCol, maxRow, gridOx, gridOy);
    bb = boundsWithDesks(maxCol, maxRow, gridOx, gridOy);
    ext = sceneScreenExtents(floorQuad, bb);
  }

  const stageW = Math.max(ext.maxX + STAGE_PAD, MIN_STAGE_W, ext.maxX - ext.minX + STAGE_PAD * 2);
  const innerStageH = Math.max(ext.maxY + STAGE_PAD, MIN_STAGE_H);
  const stageH = innerStageH;

  return {
    gridOx,
    gridOy,
    floorQuad,
    stageW,
    stageH,
    innerStageH,
    wallTop,
    floorBBox: bb,
  };
}

/** Orden pintor: más lejos primero (centro de celda con menor Y dibuja detrás). */
export function isoDeskSortKey(col: number, row: number, gridOx: number, gridOy: number): number {
  const c = isoCellCenter(col, row, gridOx, gridOy);
  return c.y * 2000 + c.x;
}
