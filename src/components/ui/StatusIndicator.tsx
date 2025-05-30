"use client";

interface StatusIndicatorProps {
  status: "active" | "inactive" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export default function StatusIndicator({
  status = "active",
  size = "md",
  pulse = true,
  className = "",
}: StatusIndicatorProps) {
  // Status colors
  const getStatusColor = () => {
    switch (status) {
      case "active":
        return "#10b981"; // green
      case "inactive":
        return "#6b7280"; // gray
      case "warning":
        return "#f59e0b"; // yellow
      case "error":
        return "#ef4444"; // red
      default:
        return "#10b981";
    }
  };

  // Size dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case "sm":
        return "6px";
      case "md":
        return "8px";
      case "lg":
        return "10px";
      default:
        return "8px";
    }
  };

  const color = getStatusColor();
  const dimensions = getSizeDimensions();

  return (
    <div
      className={className}
      style={{
        width: dimensions,
        height: dimensions,
        backgroundColor: color,
        borderRadius: "50%",
        boxShadow: `0 0 5px ${color}`,
        animation: pulse ? "status-pulse 2s infinite" : "none",
      }}
    >
      <style jsx>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; box-shadow: 0 0 10px ${color}; }
        }
      `}</style>
    </div>
  );
} 