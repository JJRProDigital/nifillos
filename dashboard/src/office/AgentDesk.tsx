import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import type { Agent } from "@/types/state";
import type { Graphics as PixiGraphics, TextStyleOptions, Texture } from "pixi.js";
import { COLORS, CELL_W, CELL_H, CHARACTER_VARIANTS } from "./palette";
import { deskTopLeft } from "./officeProjection";
import { drawDeskArea, drawWorkstationBack, drawWorkstationFront, drawScreenGlow, drawDeskAccessories } from "./drawDesk";
import { getCharacterTextures } from "./textures";
import { ensurePixelAgentSheetsLoaded, getPixelAgentTexture } from "./pixelAgentSprites";
import {
  ensurePixelWorkstationLoaded,
  getPixelDeskTexture,
  getPixelPcTexture,
  PIXEL_WS,
} from "./pixelWorkstationSprites";
import { computePixelDeskAccessoryPlacements } from "./pixelDeskAccessories";
import { ensurePixelFurnitureTexturesLoaded, getFurnitureTexture } from "./pixelFurnitureTextures";

extend({ Container, Graphics, Text, Sprite });

export { CELL_W, CELL_H };

/** Altura del globo de nombre: más bajo, más cerca del personaje (antes -30). */
const LABEL_CARD_Y = -16;
const LABEL_COL_NUDGE = 7;
const LABEL_ROW_NUDGE = 5;

interface AgentDeskProps {
  agent: Agent;
  agentIndex: number;
  gridOx: number;
  gridOy: number;
}

/** Pixel vs vector: distinto ancla; tras subir mesa/PC bajamos el avatar ~8px para enseñar el ordenador. */
const CHARACTER_Y_PIXEL = 58;
const CHARACTER_Y_VECTOR = 66;

export function AgentDesk({ agent, agentIndex, gridOx, gridOy }: AgentDeskProps) {
  const { x, y } = deskTopLeft(agent.desk.col, agent.desk.row, gridOx, gridOy);
  const cardW = 24 + 16 + agent.name.length * 7 + 12;
  const cardH = 22;
  const { col, row } = agent.desk;
  const cardX =
    (CELL_W - cardW) / 2 + (col - 1) * LABEL_COL_NUDGE - (row - 1) * LABEL_ROW_NUDGE;
  const cardY = LABEL_CARD_Y;
  const textY = cardY + 3;

  const [frame, setFrame] = useState(0);
  const frameRef = useRef<number>(0);
  const [pixelSheetsReady, setPixelSheetsReady] = useState(false);
  const [pixelWsReady, setPixelWsReady] = useState(false);
  const [pixelFurnitureReady, setPixelFurnitureReady] = useState(false);
  const [pcOnFrame, setPcOnFrame] = useState(0);
  const pcOnRef = useRef(0);

  const monitorActive = agent.status === "working" || agent.status === "delivering";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [chars, ws, furn] = await Promise.all([
        ensurePixelAgentSheetsLoaded(),
        ensurePixelWorkstationLoaded(),
        ensurePixelFurnitureTexturesLoaded(),
      ]);
      if (!cancelled) {
        setPixelSheetsReady(chars);
        setPixelWsReady(ws);
        setPixelFurnitureReady(furn);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (agent.status !== "working" && agent.status !== "delivering" && agent.status !== "checkpoint") {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 2;
      setFrame(frameRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [agent.status]);

  useEffect(() => {
    if (!monitorActive) {
      pcOnRef.current = 0;
      setPcOnFrame(0);
      return;
    }
    const interval = setInterval(() => {
      pcOnRef.current = (pcOnRef.current + 1) % 3;
      setPcOnFrame(pcOnRef.current);
    }, 380);
    return () => clearInterval(interval);
  }, [monitorActive]);

  const variant = CHARACTER_VARIANTS[agentIndex % CHARACTER_VARIANTS.length];
  const textures = getCharacterTextures(agentIndex, variant);

  const pixelTex = pixelSheetsReady ? getPixelAgentTexture(agentIndex, agent.status, frame) : undefined;

  let currentTexture: Texture;
  if (pixelTex) {
    currentTexture = pixelTex;
  } else {
    switch (agent.status) {
      case "working":
      case "delivering":
        currentTexture = textures.working[frame % 2];
        break;
      case "done":
        currentTexture = textures.done;
        break;
      case "checkpoint":
        currentTexture = textures.checkpoint;
        break;
      default:
        currentTexture = textures.idle;
    }
  }

  const drawStationBack = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawDeskArea(g, 0, 0);
      if (!pixelWsReady) {
        drawWorkstationBack(g, 0, 0);
        if (monitorActive) {
          drawScreenGlow(g, 0, 0);
        }
      }
    },
    [pixelWsReady, monitorActive]
  );

  const pixelAccessoryPlacements = useMemo(
    () => computePixelDeskAccessoryPlacements(agentIndex),
    [agentIndex],
  );

  const drawStationFront = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      if (!pixelWsReady) {
        drawWorkstationFront(g, 0, 0);
      }
      const usePixelProps = pixelWsReady && pixelFurnitureReady;
      if (!usePixelProps) {
        drawDeskAccessories(g, 0, 0, agentIndex, pixelWsReady ? 26 : 0);
      }
    },
    [agentIndex, pixelFurnitureReady, pixelWsReady],
  );

  const usePixelChar = !!pixelTex;

  const deskTex = pixelWsReady ? getPixelDeskTexture() : undefined;
  const pcTex = pixelWsReady ? getPixelPcTexture(monitorActive, pcOnFrame) : undefined;

  const drawCharacterShadow = useCallback((g: PixiGraphics) => {
    g.clear();
    g.ellipse(64, 111, 22, 7);
    g.fill({ color: 0x1a1410, alpha: 0.32 });
  }, []);

  const drawNameCard = useCallback(
    (g: PixiGraphics) => {
      g.clear();

      const r = 9;

      // Shadow
      g.roundRect(cardX + 2, cardY + 3, cardW, cardH, r);
      g.fill({ color: 0x000000, alpha: 0.38 });

      // Card background
      g.roundRect(cardX, cardY, cardW, cardH, r);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.96 });
      g.roundRect(cardX, cardY, cardW, cardH, r);
      g.stroke({ color: COLORS.nameCardBorder, width: 1, alpha: 0.55 });

      // Pointer triangle (PixiJS 8 — use poly() for closed shapes)
      const triX = cardX + cardW / 2;
      g.poly([triX - 5, cardY + cardH, triX, cardY + cardH + 6, triX + 5, cardY + cardH]);
      g.fill({ color: COLORS.nameCardBg, alpha: 0.96 });
      g.poly([triX - 5, cardY + cardH, triX, cardY + cardH + 6, triX + 5, cardY + cardH]);
      g.stroke({ color: COLORS.nameCardBorder, width: 1, alpha: 0.45 });

      // Status dot
      const dotColor = agent.status === "working" ? COLORS.statusWorking
        : agent.status === "done" ? COLORS.statusDone
        : agent.status === "checkpoint" ? COLORS.statusCheckpoint
        : COLORS.statusIdle;
      const dotX = cardX + cardW - 14;
      const dotY = cardY + cardH / 2 - 0.5;
      // Glow (for active states)
      if (agent.status === "working" || agent.status === "done" || agent.status === "checkpoint") {
        g.circle(dotX, dotY, 5);
        g.fill({ color: dotColor, alpha: 0.25 });
      }
      g.circle(dotX, dotY, 3.5);
      g.fill({ color: dotColor });
    },
    [agent.name, agent.status, cardW, cardX, cardY]
  );

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={drawStationBack} />
      {deskTex ? (
        <pixiSprite
          texture={deskTex}
          x={PIXEL_WS.desk.x}
          y={PIXEL_WS.desk.y}
          width={PIXEL_WS.desk.w}
          height={PIXEL_WS.desk.h}
        />
      ) : null}
      {pcTex ? (
        <pixiSprite
          texture={pcTex}
          x={PIXEL_WS.pc.x}
          y={PIXEL_WS.pc.y}
          width={PIXEL_WS.pc.w}
          height={PIXEL_WS.pc.h}
        />
      ) : null}

      <pixiGraphics draw={drawCharacterShadow} />

      <pixiSprite
        texture={currentTexture}
        x={usePixelChar ? 44 : 40}
        y={usePixelChar ? CHARACTER_Y_PIXEL : CHARACTER_Y_VECTOR}
        width={usePixelChar ? 40 : 48}
        height={usePixelChar ? 80 : 48}
      />

      {pixelWsReady && pixelFurnitureReady
        ? pixelAccessoryPlacements.map((p, i) => {
            const tex = getFurnitureTexture(p.rel);
            if (!tex) return null;
            return (
              <pixiSprite
                key={`${agent.id}-acc-${i}-${p.rel}`}
                texture={tex}
                x={p.x}
                y={p.y}
                width={p.w}
                height={p.h}
              />
            );
          })
        : null}

      <pixiGraphics draw={drawStationFront} />

      <pixiGraphics draw={drawNameCard} />
      <pixiText
        text={agent.icon || "🤖"}
        style={{ fontSize: 11 } as TextStyleOptions}
        x={cardX + 6}
        y={textY}
      />
      <pixiText
        text={agent.name}
        style={{
          fontSize: 11,
          fill: COLORS.nameCardText,
          fontFamily: "-apple-system, 'Segoe UI', sans-serif",
          fontWeight: "600",
        } as TextStyleOptions}
        x={cardX + 24}
        y={textY}
      />
    </pixiContainer>
  );
}
