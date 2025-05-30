"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";
import { ColorTheme } from "@/context/ThemeContext";

export function ThemeSelector() {
  const { colorTheme, setColorTheme, mode } = useTheme();
  const { playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = mode === "dark";

  // Create a more reliable click handler
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    try {
      playSound("/click.mp3", 0.1);
    } catch {
      console.log("Error playing sound");
    }
    console.log("Theme button clicked, dropdown state:", !isOpen);
  };

  // Handle theme selection
  const handleThemeChange = (themeId: ColorTheme) => {
    setColorTheme(themeId);
    setIsOpen(false);
    console.log("Theme selected:", themeId);
    try {
      playSound("/click.mp3", 0.1);
    } catch {
      console.log("Error playing sound");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: "70px", right: "20px" };

    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: `${rect.bottom + 10}px`,
      right: `${window.innerWidth - rect.right + 10}px`,
    };
  };

  return (
    <div
      className="theme-selector-container"
      style={{ position: "relative", zIndex: 10000 }}
    >
      {/* Theme Button */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        type="button"
        className="retro-btn theme-selector-button"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "32px",
          borderRadius: "0",
          backgroundColor: isDark ? "var(--retro-purple)" : "var(--retro-teal)",
          border: "3px solid #000",
          boxShadow: "3px 3px 0 #000, inset 0 0 6px rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          position: "relative",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: "2px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ff71ce",
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{
              backgroundColor: "#01ffc3",
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{
              backgroundColor: "#01ffea",
              width: "100%",
              height: "100%",
            }}
          />
          <div
            style={{
              backgroundColor: "#00f9ff",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </button>

      {/* Theme Dropdown - Rendered in a portal to avoid positioning issues */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="pixel-box theme-dropdown"
          style={{
            position: "fixed",
            ...getDropdownPosition(),
            width: "220px",
            backgroundColor: "var(--tv-screen)",
            border: "4px solid var(--tv-border)",
            borderRadius: "6px",
            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.5)",
            padding: "1rem",
            zIndex: 10001,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="scanlines" style={{ opacity: 0.1 }}></div>
          <div className="tv-static" style={{ opacity: 0.05 }}></div>

          <div
            style={{
              fontSize: "0.7rem",
              marginBottom: "0.8rem",
              color: "var(--terminal-text-highlight)",
              fontFamily: "var(--pixel-font)",
              letterSpacing: "1px",
              textAlign: "center",
              textShadow: "var(--text-shadow)",
            }}
          >
            SELECT THEME
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
            }}
          >
            {[
              {
                id: "default",
                name: "Default",
                description: "Classic blue retro style",
                color: isDark ? "#1e2266" : "#1a2e59",
              },
              {
                id: "cyberpunk",
                name: "Cyberpunk",
                description: "Neon city vibes",
                color: isDark ? "#0f0f2d" : "#1f045e",
              },
              {
                id: "retro-console",
                name: "Console",
                description: "Classic green terminal",
                color: isDark ? "#111111" : "#242424",
              },
              {
                id: "vaporwave",
                name: "Vaporwave",
                description: "Retro 80s aesthetic",
                color: isDark ? "#20063b" : "#ff6ad5",
              },
              {
                id: "terminal",
                name: "Terminal",
                description: "Solarized terminal look",
                color: isDark ? "#002b36" : "#fdf6e3",
              },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id as ColorTheme)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem",
                  backgroundColor:
                    colorTheme === theme.id
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  border:
                    colorTheme === theme.id
                      ? "2px solid var(--terminal-text)"
                      : "2px solid transparent",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    backgroundColor: theme.color,
                    border: "2px solid #000",
                    borderRadius: "2px",
                  }}
                ></div>

                <div>
                  <div
                    style={{
                      fontFamily: "var(--pixel-font)",
                      fontSize: "0.5rem",
                      color: "var(--terminal-text)",
                      marginBottom: "2px",
                    }}
                  >
                    {theme.name.toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--terminal-font)",
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      opacity: 0.8,
                    }}
                  >
                    {theme.description}
                  </div>
                </div>

                {colorTheme === theme.id && (
                  <div
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      backgroundColor: "var(--terminal-text)",
                      boxShadow: "var(--text-glow)",
                    }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
