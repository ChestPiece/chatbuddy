"use client";

import StatusIndicator from "./StatusIndicator";
import { APP_INFO } from "@/utils/constants";

interface StatusBarProps {
  isLoading?: boolean;
  title?: string;
  version?: string;
  className?: string;
}

export default function StatusBar({
  isLoading = false,
  title = APP_INFO.NAME,
  version = APP_INFO.VERSION,
  className = "",
}: StatusBarProps) {
  return (
    <div
      className={`status-bar ${className}`}
      style={{
        height: "20px",
        backgroundColor: "#1e3a8a",
        borderBottom: "2px solid #000",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 10px",
        fontSize: "10px",
        color: "white",
        fontFamily: "'Press Start 2P', cursive",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <StatusIndicator
          status={isLoading ? "error" : "active"}
          size="sm"
          pulse={true}
        />
        <span>{title}</span>
      </div>
      <div>VER {version}</div>
    </div>
  );
}
