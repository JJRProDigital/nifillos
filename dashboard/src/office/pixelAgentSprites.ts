import { Assets, Rectangle, Texture } from "pixi.js";
import type { AgentStatus } from "@/types/state";

/**
 * Sprites de personaje tomados del proyecto Pixel Agents (MIT), mismas dimensiones que allí:
 * hoja 112×96, 7 columnas × 16px, 3 filas × 32px (down, up, right). Solo usamos fila "down".
 * Crédito personajes base: JIK-A-4 Metro City (ver aviso en NOTICE).
 */
const FRAME_W = 16;
const FRAME_H = 32;
const ROWS = 3;
const COLS = 7;
const CHAR_COUNT = 6;
const DOWN_ROW = 0;

type SheetCache = Texture[][][];

let sheetsCache: SheetCache | null = null;
let loadFailed = false;

export async function ensurePixelAgentSheetsLoaded(): Promise<boolean> {
  if (sheetsCache) return true;
  if (loadFailed) return false;
  try {
    const out: SheetCache = [];
    for (let ci = 0; ci < CHAR_COUNT; ci++) {
      const url = `/pixel-agents/assets/characters/char_${ci}.png`;
      const base = await Assets.load<Texture>(url);
      const rowTex: Texture[][] = [];
      for (let row = 0; row < ROWS; row++) {
        const cols: Texture[] = [];
        for (let col = 0; col < COLS; col++) {
          cols.push(
            new Texture({
              source: base.source,
              frame: new Rectangle(col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H),
            }),
          );
        }
        rowTex.push(cols);
      }
      out.push(rowTex);
    }
    sheetsCache = out;
    return true;
  } catch (e) {
    console.warn(
      "[nifillos dashboard] No se cargaron los PNG de pixel-agents; se usan sprites procedurales.",
      e,
    );
    loadFailed = true;
    return false;
  }
}

/** Textura 16×32; lójica animación alineada con pixel-agents (walk2 idle, frames type/read). */
export function getPixelAgentTexture(
  agentIndex: number,
  status: AgentStatus,
  workFrame: number,
): Texture | undefined {
  if (!sheetsCache) return undefined;
  const char = sheetsCache[agentIndex % CHAR_COUNT];
  const down = char[DOWN_ROW];
  switch (status) {
    case "working":
    case "delivering":
      return down[3 + (workFrame % 2)];
    case "done":
      return down[2];
    case "checkpoint":
      return down[5 + (workFrame % 2)];
    default:
      return down[1];
  }
}
