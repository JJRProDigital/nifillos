import { useCallback, useEffect, useRef, useState } from "react";
import { extend } from "@pixi/react";
import { Container, Graphics, Text, Sprite } from "pixi.js";
import type { Agent } from "@/types/state";
import type { Graphics as PixiGraphics, TextStyleOptions, Texture } from "pixi.js";
import { COLORS, CELL_W, CELL_H, CHARACTER_VARIANTS } from "./palette";
import { deskTopLeft } from "./officeProjection";
import { drawDeskArea, drawWorkstationBack, drawWorkstationFront, drawScreenGlow, drawDeskAccessories } from "./drawDesk";
import { getCharacterTextures } from "./textures";

extend({ Container, Graphics, Text, Sprite });

export { CELL_W, CELL_H };

/** Altura fija del globo respecto al tile (misma para todos; el escalonado por fila bajaba las tarjetas y tapaban el monitor). */
const LABEL_CARD_Y = -30;
const LABEL_COL_NUDGE = 7;
const LABEL_ROW_NUDGE = 5;

interface AgentDeskProps {
  agent: Agent;
  agentIndex: number;
  gridOx: number;
  gridOy: number;
}

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

  useEffect(() => {
    if (agent.status !== "working") {
      setFrame(0);
      return;
    }
    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % 2;
      setFrame(frameRef.current);
    }, 250);
    return () => clearInterval(interval);
  }, [agent.status]);

  const variant = CHARACTER_VARIANTS[agentIndex % CHARACTER_VARIANTS.length];
  const textures = getCharacterTextures(agentIndex, variant);

  let currentTexture: Texture;
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

  const drawStationBack = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawDeskArea(g, 0, 0);
      drawWorkstationBack(g, 0, 0);
      if (agent.status === "working" || agent.status === "delivering") {
        drawScreenGlow(g, 0, 0);
      }
    },
    [agent.status]
  );

  const drawStationFront = useCallback(
    (g: PixiGraphics) => {
      g.clear();
      drawWorkstationFront(g, 0, 0);
      drawDeskAccessories(g, 0, 0, agentIndex);
    },
    [agentIndex]
  );

  const drawCharacterShadow = useCallback((g: PixiGraphics) => {
    g.clear();
    g.ellipse(64, 103, 22, 7);
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
      {/* Layer 1: chair + monitor (behind character) */}
      <pixiGraphics draw={drawStationBack} />

      {/* Layer 2: sombra bajo el personaje */}
      <pixiGraphics draw={drawCharacterShadow} />

      {/* Layer 3: character sprite (pixel art hi-res + filtro lineal en 48×48) */}
      <pixiSprite texture={currentTexture} x={40} y={58} width={48} height={48} />

      {/* Layer 4: desk surface + keyboard + accessories (in front of character) */}
      <pixiGraphics draw={drawStationFront} />

      {/* Layer 5: name card (floating above cell) */}
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
