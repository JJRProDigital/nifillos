import fs from "node:fs";

export type Unsubscribe = () => void;

/** Minimal pub/sub for cuadrillas/ changes, shared by SSE endpoints. */
export class MetricsEventBus {
  private listeners = new Set<() => void>();

  subscribe(listener: () => void): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emitChange(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        /* a broken subscriber must not break the rest */
      }
    }
  }

  get subscriberCount(): number {
    return this.listeners.size;
  }
}

/**
 * Watch cuadrillas/ recursively (used by the standalone server; the Vite plugin
 * reuses chokidar instead). Emits debounced change events. Never throws:
 * clients fall back to polling when watching is unavailable.
 */
export function watchCuadrillasDir(
  cuadrillasDir: string,
  bus: MetricsEventBus,
): fs.FSWatcher | null {
  try {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const watcher = fs.watch(cuadrillasDir, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => bus.emitChange(), 400);
    });
    watcher.on("error", () => {
      /* keep going: clients fall back to polling */
    });
    return watcher;
  } catch {
    return null;
  }
}
