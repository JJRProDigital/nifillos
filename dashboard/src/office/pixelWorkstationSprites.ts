import { Assets, Texture } from "pixi.js";
import { CELL_W } from "./palette";

/**
 * Muebles Pixel Agents (MIT) — Mesa de trabajo (`TABLE_FRONT`, 48×64 px)
 * y PC con animación "on". Si falla la mesa, fallback a `DESK_FRONT`.
 */
const BASE = "/pixel-agents/assets/furniture";

/**
 * Encaje en celda 128×128 (coords locales del puesto).
 * Mesa ancha (~116px) para que tablero, teclado y accesorios no “salgan” del mueble.
 */
const DESK_W = 116;
const DESK_H = 76;
const DESK_X = Math.round((CELL_W - DESK_W) / 2);
const DESK_Y = 42;

export const PIXEL_WS = {
  desk: { x: DESK_X, y: DESK_Y, w: DESK_W, h: DESK_H },
  pc: { x: Math.round((CELL_W - 48) / 2), y: 30, w: 48, h: 96 },
} as const;

let deskTex: Texture | null = null;
let pcOff: Texture | null = null;
let pcOn: [Texture, Texture, Texture] | null = null;
let wsLoadFailed = false;

function nearest(t: Texture): Texture {
  const src = t.source;
  if (src && "scaleMode" in src) {
    (src as { scaleMode: string }).scaleMode = "nearest";
  }
  return t;
}

async function loadDeskOrTableTexture(): Promise<Texture> {
  try {
    return nearest(await Assets.load<Texture>(`${BASE}/TABLE_FRONT/TABLE_FRONT.png`));
  } catch {
    return nearest(await Assets.load<Texture>(`${BASE}/DESK/DESK_FRONT.png`));
  }
}

export async function ensurePixelWorkstationLoaded(): Promise<boolean> {
  if (deskTex && pcOff && pcOn) return true;
  if (wsLoadFailed) return false;
  try {
    const [d, off, a, b, c] = await Promise.all([
      loadDeskOrTableTexture(),
      Assets.load<Texture>(`${BASE}/PC/PC_FRONT_OFF.png`),
      Assets.load<Texture>(`${BASE}/PC/PC_FRONT_ON_1.png`),
      Assets.load<Texture>(`${BASE}/PC/PC_FRONT_ON_2.png`),
      Assets.load<Texture>(`${BASE}/PC/PC_FRONT_ON_3.png`),
    ]);
    deskTex = d;
    pcOff = nearest(off);
    pcOn = [nearest(a), nearest(b), nearest(c)];
    return true;
  } catch (e) {
    console.warn("[nifillos dashboard] No se cargaron sprites mesa/DESK/PC de pixel-agents.", e);
    wsLoadFailed = true;
    return false;
  }
}

export function getPixelDeskTexture(): Texture | undefined {
  return deskTex ?? undefined;
}

/** Monitor: encendido animado si `active` (working/delivering); si no, apagado. */
export function getPixelPcTexture(active: boolean, onFrame: number): Texture | undefined {
  if (!pcOff || !pcOn) return undefined;
  if (!active) return pcOff;
  return pcOn[((onFrame % 3) + 3) % 3];
}
