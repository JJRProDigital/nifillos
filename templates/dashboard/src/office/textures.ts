import { Texture, CanvasSource } from "pixi.js";
import { COLORS, CharacterColors } from "./palette";

/**
 * Escala interna del pixel art: más muestras → el sprite 48×48 en Pixi (linear) se ve
 * más suave y con siluetas más creíbles.
 */
const ART_SCALE = 3;
const LOGICAL_SIZE = 48;
const CANVAS_SIZE = LOGICAL_SIZE * ART_SCALE;

function hexToRgb(hex: number): [number, number, number] {
  return [(hex >> 16) & 0xff, (hex >> 8) & 0xff, hex & 0xff];
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  return [canvas, ctx];
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: number) {
  const [r, g, b] = hexToRgb(color);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fillRect(x * ART_SCALE, y * ART_SCALE, ART_SCALE, ART_SCALE);
}

function hspan(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number, color: number) {
  for (let x = x1; x <= x2; x++) px(ctx, x, y, color);
}

function vspan(ctx: CanvasRenderingContext2D, x: number, y1: number, y2: number, color: number) {
  for (let y = y1; y <= y2; y++) px(ctx, x, y, color);
}

/** Rubor sutil acorde al tono de piel */
function cheekTone(c: CharacterColors): number {
  if (c.skin === COLORS.skinLight) return 0xe8a090;
  if (c.skin === COLORS.skinMedium) return 0xc88870;
  return 0xa87050;
}

type MouthVariant = "neutral" | "focused" | "smile";

function drawHead(ctx: CanvasRenderingContext2D, c: CharacterColors, mouth: MouthVariant) {
  const cheek = cheekTone(c);

  // --- HAIR (rows 2-7) ---
  hspan(ctx, 16, 30, 2, c.hair);
  hspan(ctx, 15, 31, 3, c.hair);
  hspan(ctx, 14, 32, 4, c.hair);
  hspan(ctx, 14, 32, 5, c.hair);
  // Hair highlights
  px(ctx, 17, 3, c.hairLight);
  px(ctx, 20, 3, c.hairLight);
  px(ctx, 24, 3, c.hairLight);
  px(ctx, 25, 4, c.hairLight);
  px(ctx, 28, 3, c.hairLight);
  px(ctx, 16, 4, c.hairLight);
  px(ctx, 22, 4, c.hairLight);
  px(ctx, 30, 4, c.hairLight);
  // Hair dark edges
  px(ctx, 14, 5, c.hairDark);
  px(ctx, 32, 5, c.hairDark);
  px(ctx, 15, 4, c.hairDark);
  px(ctx, 31, 4, c.hairDark);
  // Sideburns
  px(ctx, 14, 6, c.hair);
  px(ctx, 14, 7, c.hair);
  px(ctx, 32, 6, c.hair);
  px(ctx, 32, 7, c.hair);
  // Brillo de contorno (luz cenital)
  px(ctx, 18, 2, c.hairLight);
  px(ctx, 23, 2, c.hairLight);
  px(ctx, 28, 2, c.hairLight);

  // --- FACE (rows 6-14) ---
  hspan(ctx, 15, 31, 6, c.skin);
  hspan(ctx, 15, 31, 7, c.skin);
  hspan(ctx, 15, 31, 8, c.skin);
  hspan(ctx, 15, 31, 9, c.skin);
  hspan(ctx, 15, 31, 10, c.skin);
  hspan(ctx, 16, 30, 11, c.skin);
  hspan(ctx, 17, 29, 12, c.skin);
  hspan(ctx, 18, 28, 13, c.skin);
  hspan(ctx, 19, 27, 14, c.skin);
  // Oval contour shadows — left edge
  px(ctx, 15, 8, c.skinShadow);
  px(ctx, 15, 9, c.skinShadow);
  px(ctx, 15, 10, c.skinShadow);
  px(ctx, 16, 11, c.skinShadow);
  px(ctx, 17, 12, c.skinShadow);
  px(ctx, 18, 13, c.skinShadow);
  px(ctx, 19, 14, c.skinShadow);
  // Oval contour shadows — right edge
  px(ctx, 31, 8, c.skinShadow);
  px(ctx, 31, 9, c.skinShadow);
  px(ctx, 31, 10, c.skinShadow);
  px(ctx, 30, 11, c.skinShadow);
  px(ctx, 29, 12, c.skinShadow);
  px(ctx, 28, 13, c.skinShadow);
  px(ctx, 27, 14, c.skinShadow);
  // Jaw shadow
  hspan(ctx, 20, 26, 14, c.skinShadow);

  // Rubor pómulos
  px(ctx, 17, 11, cheek);
  px(ctx, 18, 11, cheek);
  px(ctx, 28, 11, cheek);
  px(ctx, 29, 11, cheek);

  // Eyebrows
  hspan(ctx, 17, 20, 7, c.hairDark);
  hspan(ctx, 26, 29, 7, c.hairDark);

  const eyeY = mouth === "focused" ? 10 : 9;
  const sclera = 0xf8f4ee;
  const iris = 0x252018;

  // Párpado superior
  hspan(ctx, 17, 21, eyeY - 1, 0x3a3430);
  hspan(ctx, 25, 29, eyeY - 1, 0x3a3430);

  // Ojos + sombra leve en esclerótica externa + brillo
  px(ctx, 17, eyeY, 0xeee8e0);
  px(ctx, 18, eyeY, sclera);
  px(ctx, 19, eyeY, iris);
  px(ctx, 20, eyeY, iris);
  px(ctx, 21, eyeY, sclera);
  px(ctx, 25, eyeY, sclera);
  px(ctx, 26, eyeY, iris);
  px(ctx, 27, eyeY, iris);
  px(ctx, 28, eyeY, 0xeee8e0);
  px(ctx, 29, eyeY, sclera);
  px(ctx, 20, eyeY - 1, 0xf8fcff);
  px(ctx, 27, eyeY - 1, 0xf8fcff);

  // Nose
  px(ctx, 23, 10, c.skinShadow);
  px(ctx, 23, 11, c.skinShadow);
  px(ctx, 23, 12, c.skinShadow);
  px(ctx, 24, 12, c.skinShadow);
  px(ctx, 22, 13, 0x2a2018);
  px(ctx, 25, 13, 0x2a2018);

  // Mouth
  if (mouth === "smile") {
    px(ctx, 20, 13, 0x2a2018);
    px(ctx, 26, 13, 0x2a2018);
    hspan(ctx, 21, 25, 14, 0x2a2018);
    hspan(ctx, 22, 24, 15, c.skinShadow);
  } else {
    hspan(ctx, 21, 25, 13, 0x2a2018);
    hspan(ctx, 22, 24, 14, c.skinShadow);
  }

  // Ears
  px(ctx, 14, 8, c.skin);
  px(ctx, 14, 9, c.skin);
  px(ctx, 14, 10, c.skinShadow);
  px(ctx, 15, 9, c.skinShadow);
  px(ctx, 32, 8, c.skin);
  px(ctx, 32, 9, c.skin);
  px(ctx, 32, 10, c.skinShadow);
  px(ctx, 31, 9, c.skinShadow);
}

function drawBody(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  // --- NECK ---
  hspan(ctx, 20, 26, 15, c.skin);
  hspan(ctx, 21, 25, 16, c.skin);
  px(ctx, 20, 15, c.skinShadow);
  px(ctx, 26, 15, c.skinShadow);
  vspan(ctx, 23, 15, 16, c.skinShadow);

  // --- COLLAR ---
  hspan(ctx, 17, 29, 17, COLORS.collarWhite);
  px(ctx, 22, 17, 0xe0e0e0);
  px(ctx, 23, 17, 0xe0e0e0);
  px(ctx, 24, 17, 0xe0e0e0);
  px(ctx, 18, 17, 0xd8d8e0);
  px(ctx, 28, 17, 0xd8d8e0);

  // --- SHIRT ---
  for (let y = 18; y <= 28; y++) {
    for (let i = 13; i <= 33; i++) {
      if (i <= 15) px(ctx, i, y, c.shirtDark);
      else if (i >= 31) px(ctx, i, y, c.shirtDark);
      else if (i >= 22 && i <= 24) px(ctx, i, y, c.shirtLight);
      else px(ctx, i, y, c.shirt);
    }
  }
  // Hombros — brillo
  px(ctx, 18, 18, c.shirtLight);
  px(ctx, 19, 18, c.shirtLight);
  px(ctx, 29, 18, c.shirtLight);
  px(ctx, 30, 18, c.shirtLight);
  // Tapeta + botones
  for (let y = 19; y <= 27; y += 2) px(ctx, 23, y, c.shirtDark);
  px(ctx, 23, 20, 0x2a2a32);
  px(ctx, 23, 23, 0x2a2a32);
  px(ctx, 23, 26, 0x2a2a32);
  // Pliegue bajo pecho
  hspan(ctx, 16, 20, 25, c.shirtDark);
  hspan(ctx, 26, 30, 25, c.shirtDark);

  // --- BELT ---
  hspan(ctx, 13, 33, 29, c.pantsDark);
  px(ctx, 22, 29, COLORS.beltBuckle);
  px(ctx, 23, 29, COLORS.beltBuckle);
  px(ctx, 24, 29, COLORS.beltBuckle);
  px(ctx, 21, 29, 0x1a1a1a);
  px(ctx, 25, 29, 0x1a1a1a);

  // --- PANTS ---
  for (let y = 30; y <= 39; y++) {
    for (let i = 14; i <= 21; i++) px(ctx, i, y, i <= 15 ? c.pantsDark : c.pants);
    for (let i = 25; i <= 32; i++) px(ctx, i, y, i >= 31 ? c.pantsDark : c.pants);
    px(ctx, 21, y, c.pantsDark);
    px(ctx, 25, y, c.pantsDark);
    if (y >= 31 && y <= 38 && y % 2 === 0) {
      px(ctx, 23, y, c.pantsDark);
      px(ctx, 24, y, c.pantsDark);
    }
  }

  // --- SHOES ---
  for (let i = 13; i <= 22; i++) {
    px(ctx, i, 40, c.shoe);
    px(ctx, i, 41, c.shoe);
  }
  for (let i = 13; i <= 22; i++) px(ctx, i, 42, i <= 14 ? c.shoeLight : c.shoe);
  hspan(ctx, 13, 22, 43, c.shoeLight);
  hspan(ctx, 14, 21, 41, 0x1a1814);
  for (let i = 24; i <= 33; i++) {
    px(ctx, i, 40, c.shoe);
    px(ctx, i, 41, c.shoe);
  }
  for (let i = 24; i <= 33; i++) px(ctx, i, 42, i >= 32 ? c.shoeLight : c.shoe);
  hspan(ctx, 24, 33, 43, c.shoeLight);
  hspan(ctx, 25, 32, 41, 0x1a1814);
}

function drawCharacterIdle(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawHead(ctx, c, "neutral");
  drawBody(ctx, c);

  for (let y = 18; y <= 22; y++) {
    px(ctx, 10, y, c.shirtDark);
    px(ctx, 11, y, c.shirt);
    px(ctx, 12, y, c.shirt);
  }
  for (let y = 23; y <= 27; y++) {
    px(ctx, 9, y, c.skinShadow);
    px(ctx, 10, y, c.skin);
    px(ctx, 11, y, c.skin);
  }
  px(ctx, 8, 28, c.skin);
  px(ctx, 9, 28, c.skin);
  px(ctx, 10, 28, c.skin);
  px(ctx, 11, 28, c.skin);
  px(ctx, 7, 27, c.skin);
  px(ctx, 8, 29, c.skinShadow);
  px(ctx, 9, 29, c.skinShadow);
  px(ctx, 10, 29, c.skin);

  for (let y = 18; y <= 22; y++) {
    px(ctx, 34, y, c.shirt);
    px(ctx, 35, y, c.shirt);
    px(ctx, 36, y, c.shirtDark);
  }
  for (let y = 23; y <= 27; y++) {
    px(ctx, 35, y, c.skin);
    px(ctx, 36, y, c.skin);
    px(ctx, 37, y, c.skinShadow);
  }
  px(ctx, 35, 28, c.skin);
  px(ctx, 36, 28, c.skin);
  px(ctx, 37, 28, c.skin);
  px(ctx, 38, 28, c.skin);
  px(ctx, 39, 27, c.skin);
  px(ctx, 36, 29, c.skin);
  px(ctx, 37, 29, c.skinShadow);
  px(ctx, 38, 29, c.skinShadow);
}

function drawWorkingFaceFatigue(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  px(ctx, 17, 11, c.skinShadow);
  px(ctx, 18, 11, c.skinShadow);
  px(ctx, 28, 11, c.skinShadow);
  px(ctx, 29, 11, c.skinShadow);
}

function drawCharacterWorking(ctx: CanvasRenderingContext2D, c: CharacterColors, frame: 0 | 1) {
  drawHead(ctx, c, "focused");
  drawWorkingFaceFatigue(ctx, c);
  drawBody(ctx, c);

  if (frame === 0) {
    for (let y = 18; y <= 20; y++) {
      px(ctx, 10, y, c.shirtDark);
      px(ctx, 11, y, c.shirt);
      px(ctx, 12, y, c.shirt);
    }
    for (let y = 21; y <= 24; y++) {
      px(ctx, 9, y, c.skinShadow);
      px(ctx, 10, y, c.skin);
      px(ctx, 11, y, c.skin);
    }
    px(ctx, 10, 25, c.skin);
    px(ctx, 11, 25, c.skin);
    px(ctx, 12, 25, c.skin);
    px(ctx, 13, 25, c.skin);
    px(ctx, 9, 24, c.skin);
    for (let y = 18; y <= 20; y++) {
      px(ctx, 34, y, c.shirt);
      px(ctx, 35, y, c.shirt);
      px(ctx, 36, y, c.shirtDark);
    }
    for (let y = 21; y <= 24; y++) {
      px(ctx, 35, y, c.skin);
      px(ctx, 36, y, c.skin);
      px(ctx, 37, y, c.skinShadow);
    }
    px(ctx, 33, 25, c.skin);
    px(ctx, 34, 25, c.skin);
    px(ctx, 35, 25, c.skin);
    px(ctx, 36, 25, c.skin);
    px(ctx, 37, 24, c.skin);
  } else {
    for (let y = 18; y <= 20; y++) {
      px(ctx, 10, y, c.shirtDark);
      px(ctx, 11, y, c.shirt);
      px(ctx, 12, y, c.shirt);
    }
    for (let y = 21; y <= 23; y++) {
      px(ctx, 9, y, c.skinShadow);
      px(ctx, 10, y, c.skin);
      px(ctx, 11, y, c.skin);
    }
    px(ctx, 10, 24, c.skin);
    px(ctx, 11, 24, c.skin);
    px(ctx, 12, 24, c.skin);
    px(ctx, 13, 24, c.skin);
    px(ctx, 9, 23, c.skin);
    for (let y = 18; y <= 20; y++) {
      px(ctx, 34, y, c.shirt);
      px(ctx, 35, y, c.shirt);
      px(ctx, 36, y, c.shirtDark);
    }
    for (let y = 21; y <= 23; y++) {
      px(ctx, 35, y, c.skin);
      px(ctx, 36, y, c.skin);
      px(ctx, 37, y, c.skinShadow);
    }
    px(ctx, 33, 24, c.skin);
    px(ctx, 34, 24, c.skin);
    px(ctx, 35, 24, c.skin);
    px(ctx, 36, 24, c.skin);
    px(ctx, 37, 23, c.skin);
  }
}

function drawCharacterDone(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawHead(ctx, c, "smile");
  drawBody(ctx, c);

  px(ctx, 10, 18, c.shirtDark);
  px(ctx, 11, 18, c.shirt);
  px(ctx, 12, 18, c.shirt);
  px(ctx, 10, 17, c.shirt);
  px(ctx, 11, 17, c.shirt);
  px(ctx, 9, 16, c.skin);
  px(ctx, 10, 16, c.skin);
  px(ctx, 10, 15, c.skinShadow);
  px(ctx, 8, 14, c.skin);
  px(ctx, 9, 14, c.skin);
  px(ctx, 9, 13, c.skinShadow);
  px(ctx, 7, 12, c.skin);
  px(ctx, 8, 12, c.skin);
  px(ctx, 6, 10, c.skin);
  px(ctx, 7, 10, c.skin);
  px(ctx, 7, 11, c.skin);
  px(ctx, 5, 8, c.skin);
  px(ctx, 6, 8, c.skin);
  px(ctx, 6, 9, c.skin);
  px(ctx, 4, 7, c.skin);
  px(ctx, 5, 7, c.skin);

  px(ctx, 34, 18, c.shirt);
  px(ctx, 35, 18, c.shirt);
  px(ctx, 36, 18, c.shirtDark);
  px(ctx, 35, 17, c.shirt);
  px(ctx, 36, 17, c.shirt);
  px(ctx, 36, 16, c.skin);
  px(ctx, 37, 16, c.skin);
  px(ctx, 36, 15, c.skinShadow);
  px(ctx, 37, 14, c.skin);
  px(ctx, 38, 14, c.skin);
  px(ctx, 37, 13, c.skinShadow);
  px(ctx, 38, 12, c.skin);
  px(ctx, 39, 12, c.skin);
  px(ctx, 39, 10, c.skin);
  px(ctx, 40, 10, c.skin);
  px(ctx, 39, 11, c.skin);
  px(ctx, 40, 8, c.skin);
  px(ctx, 41, 8, c.skin);
  px(ctx, 40, 9, c.skin);
  px(ctx, 42, 7, c.skin);
  px(ctx, 43, 7, c.skin);
}

/** Revisión / pausa: postura relajada + identificación colgante */
function drawCharacterCheckpoint(ctx: CanvasRenderingContext2D, c: CharacterColors) {
  drawHead(ctx, c, "neutral");
  drawBody(ctx, c);

  for (let y = 18; y <= 22; y++) {
    px(ctx, 10, y, c.shirtDark);
    px(ctx, 11, y, c.shirt);
    px(ctx, 12, y, c.shirt);
  }
  for (let y = 23; y <= 26; y++) {
    px(ctx, 9, y, c.skinShadow);
    px(ctx, 10, y, c.skin);
    px(ctx, 11, y, c.skin);
  }
  px(ctx, 10, 27, c.skin);
  px(ctx, 11, 27, c.skin);
  px(ctx, 12, 27, c.skin);

  for (let y = 18; y <= 22; y++) {
    px(ctx, 34, y, c.shirt);
    px(ctx, 35, y, c.shirt);
    px(ctx, 36, y, c.shirtDark);
  }
  for (let y = 23; y <= 27; y++) {
    px(ctx, 35, y, c.skin);
    px(ctx, 36, y, c.skin);
    px(ctx, 37, y, c.skinShadow);
  }
  px(ctx, 35, 28, c.skin);
  px(ctx, 36, 28, c.skin);
  px(ctx, 37, 28, c.skin);
  px(ctx, 38, 28, c.skin);
  px(ctx, 36, 29, c.skin);
  px(ctx, 37, 29, c.skinShadow);
  px(ctx, 38, 29, c.skinShadow);

  // Cinta + clip
  vspan(ctx, 23, 18, 26, 0x4a5568);
  px(ctx, 22, 18, 0x5a6578);
  px(ctx, 24, 18, 0x5a6578);
  // Placa
  hspan(ctx, 19, 27, 22, 0x2a3038);
  for (let yy = 23; yy <= 27; yy++) hspan(ctx, 20, 26, yy, 0xf2eee4);
  hspan(ctx, 19, 27, 28, 0x2a3038);
  px(ctx, 21, 24, COLORS.statusCheckpoint);
  px(ctx, 22, 25, COLORS.statusCheckpoint);
  px(ctx, 23, 24, COLORS.statusCheckpoint);
  px(ctx, 24, 25, COLORS.statusCheckpoint);
  px(ctx, 25, 24, COLORS.statusCheckpoint);
}

export interface CharacterTextures {
  idle: Texture;
  working: [Texture, Texture];
  done: Texture;
  checkpoint: Texture;
}

export function generateCharacterTextures(colors: CharacterColors): CharacterTextures {
  function makeFrame(drawFn: (ctx: CanvasRenderingContext2D) => void): Texture {
    const [canvas, ctx] = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    drawFn(ctx);
    return new Texture({
      source: new CanvasSource({
        resource: canvas,
        scaleMode: "linear",
      }),
    });
  }

  return {
    idle: makeFrame((ctx) => drawCharacterIdle(ctx, colors)),
    working: [
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 0)),
      makeFrame((ctx) => drawCharacterWorking(ctx, colors, 1)),
    ],
    done: makeFrame((ctx) => drawCharacterDone(ctx, colors)),
    checkpoint: makeFrame((ctx) => drawCharacterCheckpoint(ctx, colors)),
  };
}

/** Incluye versión de arte para invalidar caché al cambiar generador */
const TEX_GEN = 2;
const textureCache = new Map<number, CharacterTextures>();

export function getCharacterTextures(agentIndex: number, colors: CharacterColors): CharacterTextures {
  const key = agentIndex + TEX_GEN * 4096;
  if (!textureCache.has(key)) {
    textureCache.set(key, generateCharacterTextures(colors));
  }
  return textureCache.get(key)!;
}
