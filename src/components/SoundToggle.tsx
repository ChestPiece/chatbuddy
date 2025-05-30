"use client";

import React from "react";
import { useSound } from "@/context/SoundContext";

export function SoundToggle() {
  const { isSoundEnabled, toggleSound, playSound } = useSound();

  const handleToggle = () => {
    playSound("/click.mp3", 0.2);
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
        fontSize: "0.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.2s ease",
      }}
      title={isSoundEnabled ? "Sound On" : "Sound Off"}
    >
      {isSoundEnabled ? "🔊" : "🔇"}
    </button>
  );
}
