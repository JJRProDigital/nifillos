import { useMemo } from "react";
import { extend } from "@pixi/react";
import { Sprite } from "pixi.js";
import type { OfficeLayout } from "./officeProjection";
import { computePixelDecorPlacements, type PixelDecorPlacement } from "./officeDecorLayout";
import { getFurnitureTexture } from "./pixelFurnitureTextures";

extend({ Sprite });

export function OfficeDecorSprites({
  layout,
  stageW,
  innerStageH,
}: {
  layout: OfficeLayout;
  stageW: number;
  innerStageH: number;
}) {
  const placements = useMemo(
    () => computePixelDecorPlacements(layout, stageW, innerStageH),
    [layout, stageW, innerStageH],
  );

  return (
    <>
      {placements.map((p: PixelDecorPlacement, i: number) => {
        const tex = getFurnitureTexture(p.rel);
        if (!tex) return null;
        return (
          <pixiSprite
            key={`${p.rel}-${i}-${Math.round(p.x)}-${Math.round(p.y)}`}
            texture={tex}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
          />
        );
      })}
    </>
  );
}
