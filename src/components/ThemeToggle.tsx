"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const { playSound } = useSound();
  const isDark = mode === "dark";

  const handleToggle = () => {
    playSound("/click.mp3", 0.2);
    toggleMode();
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: "none",
        border: "none",
        color: "var(--text)",
        cursor: "pointer",
        padding: "0.5rem",
        fontSize: "0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.2s ease",
      }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
