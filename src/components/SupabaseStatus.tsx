import { useState, useEffect } from "react";
import { isSupabaseConfigured } from "@/utils/supabase";
import { useTheme } from "@/context/ThemeContext";

export function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const { mode } = useTheme();
  const isDark = mode === "dark";

  useEffect(() => {
    const checkSupabase = () => {
      setIsConfigured(isSupabaseConfigured());
    };

    checkSupabase();

    // Re-check status every 30 seconds in case of environment changes
    const interval = setInterval(checkSupabase, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isConfigured === null) {
    return null; // Loading state
  }

  // Colors based on connection status and theme
  const statusColors = {
    connected: {
      bg: isDark ? "var(--retro-dark-blue)" : "var(--retro-dark-blue)",
      border: isDark ? "var(--retro-green)" : "var(--retro-green)",
      text: isDark ? "var(--retro-lime)" : "var(--retro-green)",
      dot: "var(--retro-lime)",
    },
    local: {
      bg: isDark ? "var(--retro-dark-blue)" : "var(--retro-dark-blue)",
      border: isDark ? "var(--retro-orange)" : "var(--retro-orange)",
      text: isDark ? "var(--retro-yellow)" : "var(--retro-orange)",
      dot: "var(--retro-yellow)",
    },
  };

  const colors = isConfigured ? statusColors.connected : statusColors.local;

  return (
    <div
      className="pixel-border"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "26px",
        backgroundColor: colors.bg,
        borderWidth: "2px",
        borderColor: colors.border,
        cursor: "pointer",
        position: "relative",
        boxShadow: "2px 2px 0 rgba(0, 0, 0, 0.5)",
      }}
      title={isConfigured ? "Database connected" : "Using local storage"}
    >
      <span
        style={{
          color: colors.text,
          fontSize: "0.65rem",
          fontFamily: "var(--pixel-font)",
          textTransform: "uppercase",
        }}
      >
        {isConfigured ? "DB" : "LOC"}
      </span>

      <div
        style={{
          position: "absolute",
          top: "4px",
          right: "4px",
          width: "4px",
          height: "4px",
          backgroundColor: colors.dot,
          animation: "blink 2s infinite",
        }}
      />

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
