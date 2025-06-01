"use client";

import React from "react";
import { useSound } from "@/context/SoundContext";

export function SoundToggle() {
  const { isSoundEnabled, toggleSound } = useSound();

  const handleToggle = () => {
    // Just toggle sound - the toggle function will handle playing the click sound when enabling
    toggleSound();
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        background: "none",
        border: "none",
        color: isSoundEnabled ? "var(--secondary)" : "#555",
        cursor: "pointer",
        padding: "0.5rem",
        fontSize: "1rem", // Slightly larger for better visibility
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        opacity: isSoundEnabled ? 1 : 0.6, // Dimmer when off for visual feedback
      }}
      title={isSoundEnabled ? "Sound On" : "Sound Off"}
      aria-label={
        isSoundEnabled ? "Disable sound effects" : "Enable sound effects"
      }
    >
      {isSoundEnabled ? "🔊" : "🔇"}
    </button>
  );
}
