import { create } from "zustand";
import type { CuadrillaInfo, CuadrillaState } from "@/types/state";

interface CuadrillaStore {
  cuadrillas: Map<string, CuadrillaInfo>;
  activeStates: Map<string, CuadrillaState>;
  selectedCuadrilla: string | null;
  isConnected: boolean;

  selectCuadrilla: (name: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSnapshot: (cuadrillas: CuadrillaInfo[], activeStates: Record<string, CuadrillaState>) => void;
  setCuadrillaActive: (code: string, state: CuadrillaState) => void;
  updateCuadrillaState: (code: string, state: CuadrillaState) => void;
  setCuadrillaInactive: (code: string) => void;
}

export const useCuadrillaStore = create<CuadrillaStore>((set) => ({
  cuadrillas: new Map(),
  activeStates: new Map(),
  selectedCuadrilla: null,
  isConnected: false,

  selectCuadrilla: (name) => set({ selectedCuadrilla: name }),

  setConnected: (connected) => set({ isConnected: connected }),

  setSnapshot: (cuadrillas, activeStates) =>
    set({
      cuadrillas: new Map(cuadrillas.map((c) => [c.code, c])),
      activeStates: new Map(Object.entries(activeStates)),
    }),

  setCuadrillaActive: (code, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(code, state),
    })),

  updateCuadrillaState: (code, state) =>
    set((prev) => ({
      activeStates: new Map(prev.activeStates).set(code, state),
    })),

  setCuadrillaInactive: (code) =>
    set((prev) => {
      const next = new Map(prev.activeStates);
      next.delete(code);
      return {
        activeStates: next,
        selectedCuadrilla: prev.selectedCuadrilla === code ? null : prev.selectedCuadrilla,
      };
    }),
}));
