import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useMemo } from "react";
import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import { AgentDesk } from "./AgentDesk";
import { HandoffEnvelope } from "./HandoffEnvelope";
import { findAgent } from "@/lib/normalizeState";
import { assignSpreadDesks, layoutExtentsForAgentCount } from "./spreadLayout";
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
import { computeOfficeLayout, isoDeskSortKey, type OfficeLayout } from "./officeProjection";
import type { Graphics as PixiGraphics } from "pixi.js";

extend({ Container, Graphics });

/** Grosor visual de pared lateral; encaja con TILE. */
const ROOM_SIDE_W = TILE;

/**
 * Hueco respecto al bbox de escritorios (ancla ≈ esquina sup.-izq. del sprite; ~24–32px de ancho útil).
 * Valores mayores hacían imposible el pasillo izquierdo con 1–2 agentes → todo acababa a la derecha.
 */
const DECOR_DESK_GAP = 26;
/** Ancho mínimo del pasillo para repartir varios muebles en ese lado. */
const DECOR_MIN_STRIP = 22;

function drawOfficeBackground(g: PixiGraphics, layout: OfficeLayout, stageW: number, innerStageH: number) {
  const { floorQuad, wallTop, floorBBox: bb } = layout;
  const [v0, v1] = floorQuad;

  g.clear();

  // Suelo hasta el borde inferior del canvas (la habitación llena el escenario)
  const roomBottomY = innerStageH;
  const floorH = roomBottomY - wallTop;

  g.rect(0, 0, stageW, innerStageH);
  g.fill({ color: COLORS.sceneVoid });

  // Suelo a todo el ancho del escenario (cubre el vacío en la zona de trabajo)
  drawPlankFloorRect(g, 0, wallTop, stageW, floorH);

  // Paredes laterales (toda la altura útil)
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

  // Pared trasera a todo el ancho
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

  // Zócalo continuo bajo la pared
  g.rect(0, wallTop - 3, stageW, 3);
  g.fill({ color: COLORS.wallShadow });

  drawIsoFloor(g, floorQuad);

  g.moveTo(v0.x, v0.y);
  g.lineTo(v1.x, v1.y);
  g.stroke({ color: COLORS.wallShadow, width: 3 });
  g.moveTo(v0.x, v0.y);
  g.lineTo(v1.x, v1.y);
  g.stroke({ color: 0x000000, alpha: 0.1, width: 5 });

  const shelfW = TILE * 2;
  const decorY = 4;
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

  const quadLeft = Math.min(v0.x, floorQuad[3]!.x);

  const leftXLo = floorLeft + 4;
  /** Pasillo izquierdo: hasta el borde del trabajo; el rombo isométrico deja suelo a la izquierda del vértice. */
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

  // Vigneta suave solo en el borde exterior del canvas
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

export function OfficeScene() {
  const state = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.activeStates.get(s.selectedCuadrilla) : undefined
  );
  const cuadrillaInfo = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.cuadrillas.get(s.selectedCuadrilla) : undefined
  );

  const agentsStableOrder = useMemo(
    () => (state?.agents ? [...state.agents].sort((a, b) => a.id.localeCompare(b.id)) : []),
    [state?.agents]
  );

  const spreadAgents = useMemo(() => assignSpreadDesks(agentsStableOrder), [agentsStableOrder]);

  const layout = useMemo(() => {
    const { maxCol, maxRow } = layoutExtentsForAgentCount(spreadAgents.length);
    return computeOfficeLayout(maxCol, maxRow);
  }, [spreadAgents.length]);

  const sortedAgents = useMemo(() => {
    return [...spreadAgents].sort(
      (a, b) =>
        isoDeskSortKey(a.desk.col, a.desk.row, layout.gridOx, layout.gridOy) -
        isoDeskSortKey(b.desk.col, b.desk.row, layout.gridOx, layout.gridOy)
    );
  }, [spreadAgents, layout]);

  const stageW = layout.stageW;
  const stageH = layout.stageH;
  const innerStageH = layout.innerStageH;

  const drawBackground = useCallback(
    (g: PixiGraphics) => {
      drawOfficeBackground(g, layout, stageW, innerStageH);
    },
    [layout, stageW, innerStageH]
  );

  if (!state) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {cuadrillaInfo ? (
          <>
            <span style={{ fontSize: 40 }}>{cuadrillaInfo.icon}</span>
            <span style={{ fontSize: 16 }}>{cuadrillaInfo.name}</span>
            <span style={{ fontSize: 12 }}>{cuadrillaInfo.description}</span>
            <span style={{ fontSize: 11, marginTop: 8 }}>Sin ejecución</span>
          </>
        ) : (
          <span>Selecciona una cuadrilla</span>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        flex: "0 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "content-box",
      }}
    >
      <Application width={stageW} height={stageH} backgroundColor={COLORS.sceneVoid}>
        <pixiContainer>
          <pixiGraphics draw={drawBackground} />
          {sortedAgents.map((agent) => {
            const agentIndex = Math.max(0, spreadAgents.findIndex((a) => a.id === agent.id));
            return (
              <AgentDesk
                key={agent.id}
                agent={agent}
                agentIndex={agentIndex}
                gridOx={layout.gridOx}
                gridOy={layout.gridOy}
              />
            );
          })}
          {state.handoff &&
            (() => {
              const from = findAgent(state, state.handoff!.from);
              const to = findAgent(state, state.handoff!.to);
              if (!from || !to) return null;
              const fromSp = spreadAgents.find((a) => a.id === from.id) ?? from;
              const toSp = spreadAgents.find((a) => a.id === to.id) ?? to;
              return (
                <HandoffEnvelope
                  handoff={state.handoff!}
                  fromAgent={fromSp}
                  toAgent={toSp}
                  gridOx={layout.gridOx}
                  gridOy={layout.gridOy}
                />
              );
            })()}
        </pixiContainer>
      </Application>
    </div>
  );
}
