import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import { CuadrillaCard } from "./CuadrillaCard";

export function CuadrillaSelector() {
  const cuadrillas = useCuadrillaStore((s) => s.cuadrillas);
  const activeStates = useCuadrillaStore((s) => s.activeStates);
  const selectedCuadrilla = useCuadrillaStore((s) => s.selectedCuadrilla);
  const selectCuadrilla = useCuadrillaStore((s) => s.selectCuadrilla);

  const list = Array.from(cuadrillas.values()).sort((a, b) => {
    const aActive = activeStates.has(a.code) ? 0 : 1;
    const bActive = activeStates.has(b.code) ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return a.name.localeCompare(b.name);
  });

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100%",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 12px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "var(--text-secondary)",
        }}
      >
        Cuadrillas
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {list.length === 0 && (
          <div style={{ padding: "16px 12px", color: "var(--text-secondary)", fontSize: 12 }}>
            No hay cuadrillas
          </div>
        )}
        {list.map((c) => (
          <CuadrillaCard
            key={c.code}
            cuadrilla={c}
            state={activeStates.get(c.code)}
            isSelected={selectedCuadrilla === c.code}
            onSelect={() => selectCuadrilla(c.code)}
          />
        ))}
      </div>
    </aside>
  );
}
