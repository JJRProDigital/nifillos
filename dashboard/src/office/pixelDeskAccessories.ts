/**
 * Accesorios de mesa con sprites Pixel Agents (sustituyen taza/planta/post-its vectoriales).
 */

import { PIXEL_WS } from "./pixelWorkstationSprites";

const POOL_SIZE = 6;

/** Centros en mesa ancha (coinciden con zonas laterales del tile). */
const LEFT_CENTER_X = 28;
const RIGHT_CENTER_X = 100;

function accessoryDefForPoolIndex(
  poolIndex: number,
  agentIndex: number,
): { rel: string; w: number; h: number } {
  switch (poolIndex) {
    case 0:
      /* Sin café en mesa (sustituye taza/máquina). */
      return { rel: "POT/POT.png", w: 26, h: 26 };
    case 1: {
      const plants = [
        "PLANT/PLANT.png",
        "PLANT_2/PLANT_2.png",
        "CACTUS/CACTUS.png",
        "POT/POT.png",
        "LARGE_PLANT/LARGE_PLANT.png",
      ] as const;
      const rel = plants[agentIndex % plants.length]!;
      return rel === "LARGE_PLANT/LARGE_PLANT.png"
        ? { rel, w: 30, h: 44 }
        : { rel, w: 26, h: 36 };
    }
    case 2:
      return {
        rel:
          agentIndex % 2 === 0
            ? "SMALL_PAINTING/SMALL_PAINTING.png"
            : "SMALL_PAINTING_2/SMALL_PAINTING_2.png",
        w: 22,
        h: 44,
      };
    case 3:
      /* Sin mini estantería en el tablero; papel bajo tipo “documentos”. */
      return { rel: "SMALL_PAINTING/SMALL_PAINTING.png", w: 30, h: 22 };
    case 4:
      if (agentIndex % 2 === 0) {
        return { rel: "SMALL_PAINTING_2/SMALL_PAINTING_2.png", w: 22, h: 44 };
      }
      return { rel: "BIN/BIN.png", w: 28, h: 28 };
    case 5:
      return { rel: "BIN/BIN.png", w: 28, h: 28 };
    default:
      return { rel: "POT/POT.png", w: 26, h: 26 };
  }
}

function defKey(d: { rel: string; w: number; h: number }): string {
  return d.rel;
}

export type PixelDeskAccessoryPlacement = {
  rel: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Misma lógica de sorteo que `drawDeskAccessories` (2 ranuras si los índices difieren).
 * Altura de apoyo ligada al rectángulo de la mesa pixel (`PIXEL_WS.desk`).
 */
export function computePixelDeskAccessoryPlacements(agentIndex: number): PixelDeskAccessoryPlacement[] {
  const seed = agentIndex * 7 + 3;
  let idx1 = seed % POOL_SIZE;
  let idx2 = (seed + 2) % POOL_SIZE;

  let d2 = accessoryDefForPoolIndex(idx2, agentIndex);
  const d1 = accessoryDefForPoolIndex(idx1, agentIndex);
  if (idx2 !== idx1 && defKey(d2) === defKey(d1)) {
    for (let k = 0; k < POOL_SIZE; k++) {
      idx2 = (idx2 + 1) % POOL_SIZE;
      if (idx2 === idx1) continue;
      d2 = accessoryDefForPoolIndex(idx2, agentIndex);
      if (defKey(d2) !== defKey(d1)) break;
    }
  }

  const { y: deskY, h: deskH } = PIXEL_WS.desk;
  /** ~superficie del tablón dentro del sprite (coherente con TABLE_FRONT). */
  const surfaceBottom = deskY + Math.round(deskH * 0.36) + 10;

  const out: PixelDeskAccessoryPlacement[] = [];

  const pushCenter = (centerX: number, poolIdx: number) => {
    const d = accessoryDefForPoolIndex(poolIdx, agentIndex);
    out.push({
      rel: d.rel,
      x: Math.round(centerX - d.w / 2),
      y: Math.round(surfaceBottom - d.h),
      w: d.w,
      h: d.h,
    });
  };

  pushCenter(LEFT_CENTER_X, idx1);
  if (idx2 !== idx1) {
    pushCenter(RIGHT_CENTER_X, idx2);
  }

  return out;
}
