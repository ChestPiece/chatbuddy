"use client";

import React, { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";
import { APP_INFO } from "@/utils/constants";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title = "CHAT BUDDY" }: AppHeaderProps) {
  const { mode, toggleMode } = useTheme();
  const { isSoundEnabled, toggleSound, playClickSound } = useSound();
  const isDark = mode === "dark";

  useEffect(() => {
    const handleScroll = () => {
      // No longer need to track scroll state
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSoundToggle = () => {
    playClickSound();
    toggleSound();
  };

  const handleThemeToggle = () => {
    playClickSound();
    toggleMode();
  };

  return (
    <header
      className="app-header pixel-border"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.8rem 1.2rem",
        background: isDark
          ? "var(--header-gradient-dark)"
          : "var(--header-gradient-light)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        width: "100%",
        imageRendering: "pixelated",
        overflow: "hidden",
        height: "60px",
        minHeight: "60px",
        boxSizing: "border-box",
        fontFamily: "var(--pixel-font)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
        borderWidth: "0 0 4px 0",
        borderStyle: "solid",
        borderColor: "#000",
      }}
    >
      {/* Scanlines overlay */}
      <div
        className="scanlines"
        style={{
          opacity: 0.15,
        }}
      ></div>

      {/* Left side - Logo and Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Logo Pixel Art */}
        <div
          className="power-on"
          style={{
            width: "32px",
            height: "32px",
            backgroundColor: isDark ? "#121233" : "#1a2850",
            border: "3px solid #000",
            boxShadow: "2px 2px 0 #000, inset 0 0 6px rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transform: "rotate(-2deg)",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Simple pixel art chat bubble */}
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                width: "12px",
                height: "8px",
                backgroundColor: "white",
                borderRadius: "3px",
                boxShadow: "0 0 4px rgba(255, 255, 255, 0.5)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "0",
                width: "0",
                height: "0",
                borderLeft: "5px solid white",
                borderTop: "5px solid transparent",
              }}
            ></div>
          </div>
        </div>

        <h1
          className="crt-flicker"
          style={{
            margin: 0,
            fontSize: "0.75rem",
            letterSpacing: "2px",
            color: "white",
            textShadow: "var(--text-shadow)",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {title}
          <span
            style={{
              fontSize: "0.4rem",
              verticalAlign: "super",
              marginLeft: "6px",
              color: "rgba(255, 255, 255, 0.9)",
              textShadow: "1px 1px 0 rgba(0, 0, 0, 0.5)",
            }}
          >
            v{APP_INFO.VERSION}
          </span>
        </h1>
      </div>

      {/* Center - Chat Mode indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 5,
        }}
      >
        <div
          className="blink-slow"
          style={{
            padding: "4px 8px",
            backgroundColor: isDark
              ? "rgba(15, 17, 27, 0.9)"
              : "rgba(15, 30, 60, 0.9)",
            border: "2px solid #000",
            boxShadow: "2px 2px 0 #000, inset 0 0 6px rgba(255, 255, 255, 0.1)",
            color: "white",
            fontSize: "0.5rem",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            fontFamily: "var(--pixel-font)",
            position: "relative",
            borderRadius: "2px",
          }}
        >
          <span className="crt-flicker" style={{ letterSpacing: "1px" }}>
            CHAT MODE
          </span>
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "4px",
              height: "4px",
              backgroundColor: isDark
                ? "var(--retro-lime)"
                : "var(--retro-cyan)",
              boxShadow: "0 0 4px rgba(120, 255, 255, 0.8)",
              animation: "blink 1s infinite",
            }}
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Sound Toggle Button */}
        <button
          onClick={handleSoundToggle}
          className="retro-btn"
          style={{
            width: "36px",
            height: "32px",
            padding: "4px",
            backgroundColor: isDark
              ? "var(--retro-dark-blue)"
              : "var(--retro-blue)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            cursor: "pointer",
            fontSize: "0",
            borderRadius: "0",
            boxShadow: "3px 3px 0 #000, inset 0 0 6px rgba(255, 255, 255, 0.1)",
          }}
          title={isSoundEnabled ? "Sound On" : "Sound Off"}
        >
          {isSoundEnabled ? (
            <div
              style={{ width: "20px", height: "20px", position: "relative" }}
            >
              {/* Improved Sound-On Icon */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Speaker body */}
                <div
                  style={{
                    position: "absolute",
                    left: "2px",
                    top: "6px",
                    width: "6px",
                    height: "8px",
                    backgroundColor: "white",
                  }}
                ></div>
                {/* Speaker cone */}
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "3px",
                    width: "0",
                    height: "0",
                    borderTop: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    borderLeft: "7px solid white",
                  }}
                ></div>
                {/* Sound waves */}
                <div
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "5px",
                    width: "2px",
                    height: "10px",
                    borderLeft: "2px solid white",
                    borderTop: "2px solid white",
                    borderBottom: "2px solid white",
                    borderRadius: "8px 0 0 8px",
                  }}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    right: "0px",
                    top: "3px",
                    width: "2px",
                    height: "14px",
                    borderLeft: "2px solid white",
                    borderTop: "2px solid white",
                    borderBottom: "2px solid white",
                    borderRadius: "8px 0 0 8px",
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div
              style={{ width: "20px", height: "20px", position: "relative" }}
            >
              {/* Improved Sound-Off Icon */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Speaker body */}
                <div
                  style={{
                    position: "absolute",
                    left: "2px",
                    top: "6px",
                    width: "6px",
                    height: "8px",
                    backgroundColor: "white",
                  }}
                ></div>
                {/* Speaker cone */}
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "3px",
                    width: "0",
                    height: "0",
                    borderTop: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    borderLeft: "7px solid white",
                  }}
                ></div>
                {/* Mute line */}
                <div
                  style={{
                    position: "absolute",
                    right: "2px",
                    top: "3px",
                    width: "14px",
                    height: "2px",
                    backgroundColor: "white",
                    transform: "rotate(45deg)",
                    transformOrigin: "right center",
                  }}
                ></div>
              </div>
            </div>
          )}
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={handleThemeToggle}
          className="retro-btn"
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          style={{
            width: "36px",
            height: "32px",
            padding: "4px",
            backgroundColor: isDark ? "var(--retro-blue)" : "var(--retro-teal)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "0",
            borderRadius: "0",
            boxShadow: "3px 3px 0 #000, inset 0 0 6px rgba(255, 255, 255, 0.1)",
          }}
        >
          {isDark ? (
            <div
              style={{ width: "20px", height: "20px", position: "relative" }}
            >
              {/* CSS Sun Icon */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    boxShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
                  }}
                ></div>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div
                    key={angle}
                    style={{
                      position: "absolute",
                      width: "2px",
                      height: "5px",
                      backgroundColor: "white",
                      transformOrigin: "center 12px",
                      transform: `rotate(${angle}deg) translateY(-7px)`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{ width: "20px", height: "20px", position: "relative" }}
            >
              {/* CSS Moon Icon */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: "3px",
                    boxShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
                  }}
                ></div>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: isDark
                      ? "var(--retro-blue)"
                      : "var(--retro-teal)",
                    borderRadius: "50%",
                    position: "absolute",
                    top: "3px",
                    left: "7px",
                  }}
                ></div>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Pixel art frame corners */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "6px",
          height: "6px",
          backgroundColor: "#000",
          zIndex: 6,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "6px",
          height: "6px",
          backgroundColor: "#000",
          zIndex: 6,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "6px",
          height: "6px",
          backgroundColor: "#000",
          zIndex: 6,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "6px",
          height: "6px",
          backgroundColor: "#000",
          zIndex: 6,
        }}
      ></div>

      <style jsx>{`
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        .blink-slow {
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        button:hover {
          filter: brightness(1.2);
        }

        button:active {
          transform: translate(3px, 3px);
          box-shadow: none !important;
        }
      `}</style>
    </header>
  );
}
