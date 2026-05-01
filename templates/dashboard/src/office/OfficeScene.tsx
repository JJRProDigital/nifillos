import { Application, extend } from "@pixi/react";
import { Container, Graphics } from "pixi.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import { AgentDesk } from "./AgentDesk";
import { HandoffEnvelope } from "./HandoffEnvelope";
import { agentsForOfficeDisplay } from "@/lib/normalizeState";
import { assignSpreadDesks, layoutExtentsForAgentCount } from "./spreadLayout";
import { COLORS } from "./palette";
import { computeOfficeLayout, isoDeskSortKey } from "./officeProjection";
import type { Graphics as PixiGraphics } from "pixi.js";
import { drawOfficeRoomBase, drawOfficeRoomVectorDecor } from "./officeBackgroundLayers";
import { OfficeDecorSprites } from "./OfficeDecorSprites";
import { ensurePixelFurnitureTexturesLoaded } from "./pixelFurnitureTextures";

extend({ Container, Graphics });

export function OfficeScene() {
  const state = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.activeStates.get(s.selectedCuadrilla) : undefined
  );
  const cuadrillaInfo = useCuadrillaStore((s) =>
    s.selectedCuadrilla ? s.cuadrillas.get(s.selectedCuadrilla) : undefined
  );

  const agentsStableOrder = useMemo(() => {
    if (!state) return [];
    const resolved = agentsForOfficeDisplay(state, cuadrillaInfo);
    return [...resolved].sort((a, b) => a.id.localeCompare(b.id));
  }, [state, cuadrillaInfo]);

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

  const [furnitureTexturesReady, setFurnitureTexturesReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    ensurePixelFurnitureTexturesLoaded().then((ok) => {
      if (!cancelled && ok) setFurnitureTexturesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const drawRoomBase = useCallback(
    (g: PixiGraphics) => {
      drawOfficeRoomBase(g, layout, stageW, innerStageH);
    },
    [layout, stageW, innerStageH]
  );

  const drawVectorDecor = useCallback(
    (g: PixiGraphics) => {
      drawOfficeRoomVectorDecor(g, layout, stageW, innerStageH);
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
          <pixiGraphics draw={drawRoomBase} />
          {furnitureTexturesReady ? (
            <OfficeDecorSprites layout={layout} stageW={stageW} innerStageH={innerStageH} />
          ) : (
            <pixiGraphics draw={drawVectorDecor} />
          )}
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
              const from = agentsStableOrder.find((a) => a.id === state.handoff!.from);
              const to = agentsStableOrder.find((a) => a.id === state.handoff!.to);
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
