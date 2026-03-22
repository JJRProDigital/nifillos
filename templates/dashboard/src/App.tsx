import { useCuadrillaSocket } from "@/hooks/useCuadrillaSocket";
import { CuadrillaSelector } from "@/components/CuadrillaSelector";
import { OfficeScene } from "@/office/OfficeScene";
import { StatusBar } from "@/components/StatusBar";

export function App() {
  useCuadrillaSocket();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: 40,
          minHeight: 40,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-sidebar)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        Nifillos Dashboard
      </header>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minWidth: 0 }}>
        <CuadrillaSelector />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: "auto",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <OfficeScene />
        </div>
      </div>

      {/* Footer */}
      <StatusBar />
    </div>
  );
}
