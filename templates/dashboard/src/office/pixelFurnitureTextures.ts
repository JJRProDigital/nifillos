import { Assets, Texture } from "pixi.js";

const BASE = "/pixel-agents/assets/furniture";

/** Todas las texturas de muebles usadas en la oficina (+ conjunto completo del paquete Pixel Agents). */
export const FURNITURE_TEXTURE_REL_PATHS = [
  "BIN/BIN.png",
  "BOOKSHELF/BOOKSHELF.png",
  "CACTUS/CACTUS.png",
  "CLOCK/CLOCK.png",
  "COFFEE/COFFEE.png",
  "COFFEE_TABLE/COFFEE_TABLE.png",
  "CUSHIONED_BENCH/CUSHIONED_BENCH.png",
  "CUSHIONED_CHAIR/CUSHIONED_CHAIR_BACK.png",
  "CUSHIONED_CHAIR/CUSHIONED_CHAIR_FRONT.png",
  "CUSHIONED_CHAIR/CUSHIONED_CHAIR_SIDE.png",
  "DESK/DESK_FRONT.png",
  "DESK/DESK_SIDE.png",
  "DOUBLE_BOOKSHELF/DOUBLE_BOOKSHELF.png",
  "HANGING_PLANT/HANGING_PLANT.png",
  "LARGE_PAINTING/LARGE_PAINTING.png",
  "LARGE_PLANT/LARGE_PLANT.png",
  "PC/PC_BACK.png",
  "PC/PC_FRONT_OFF.png",
  "PC/PC_FRONT_ON_1.png",
  "PC/PC_FRONT_ON_2.png",
  "PC/PC_FRONT_ON_3.png",
  "PC/PC_SIDE.png",
  "PLANT/PLANT.png",
  "PLANT_2/PLANT_2.png",
  "POT/POT.png",
  "SMALL_PAINTING/SMALL_PAINTING.png",
  "SMALL_PAINTING_2/SMALL_PAINTING_2.png",
  "SMALL_TABLE/SMALL_TABLE_FRONT.png",
  "SMALL_TABLE/SMALL_TABLE_SIDE.png",
  "SOFA/SOFA_BACK.png",
  "SOFA/SOFA_FRONT.png",
  "SOFA/SOFA_SIDE.png",
  "TABLE_FRONT/TABLE_FRONT.png",
  "WHITEBOARD/WHITEBOARD.png",
  "WOODEN_BENCH/WOODEN_BENCH.png",
  "WOODEN_CHAIR/WOODEN_CHAIR_BACK.png",
  "WOODEN_CHAIR/WOODEN_CHAIR_FRONT.png",
  "WOODEN_CHAIR/WOODEN_CHAIR_SIDE.png",
] as const;

const cache = new Map<string, Texture>();
let failed = false;

function nearest(t: Texture): Texture {
  const src = t.source;
  if (src && "scaleMode" in src) {
    (src as { scaleMode: string }).scaleMode = "nearest";
  }
  return t;
}

export async function ensurePixelFurnitureTexturesLoaded(): Promise<boolean> {
  if (cache.size >= FURNITURE_TEXTURE_REL_PATHS.length) return true;
  if (failed) return false;
  try {
    await Promise.all(
      FURNITURE_TEXTURE_REL_PATHS.map(async (rel) => {
        const url = `${BASE}/${rel}`;
        const tex = nearest(await Assets.load<Texture>(url));
        cache.set(rel, tex);
      }),
    );
    return true;
  } catch (e) {
    console.warn("[nifillos dashboard] Falló la carga de muebles pixel-agents.", e);
    failed = true;
    return false;
  }
}

export function getFurnitureTexture(rel: string): Texture | undefined {
  return cache.get(rel);
}
