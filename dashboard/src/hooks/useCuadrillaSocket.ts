import { useEffect, useRef } from "react";
import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import type { WsMessage } from "@/types/state";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

export function useCuadrillaSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);

  const {
    setConnected,
    setSnapshot,
    setCuadrillaActive,
    updateCuadrillaState,
    setCuadrillaInactive,
  } = useCuadrillaStore();

  useEffect(() => {
    let disposed = false;
    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      if (disposed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/__cuadrillas_ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        reconnectDelayRef.current = RECONNECT_BASE_MS;
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data);
          switch (msg.type) {
            case "SNAPSHOT":
              setSnapshot(msg.cuadrillas, msg.activeStates);
              break;
            case "CUADRILLA_ACTIVE":
              setCuadrillaActive(msg.cuadrilla, msg.state);
              break;
            case "CUADRILLA_UPDATE":
              updateCuadrillaState(msg.cuadrilla, msg.state);
              break;
            case "CUADRILLA_INACTIVE":
              setCuadrillaInactive(msg.cuadrilla);
              break;
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!disposed) {
          reconnectTimer = setTimeout(() => {
            reconnectDelayRef.current = Math.min(
              reconnectDelayRef.current * 2,
              RECONNECT_MAX_MS
            );
            connect();
          }, reconnectDelayRef.current);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [setConnected, setSnapshot, setCuadrillaActive, updateCuadrillaState, setCuadrillaInactive]);
}
