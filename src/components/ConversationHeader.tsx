"use client";

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
  CSSProperties,
} from "react";
import { useSound } from "@/context/SoundContext";
import { useTheme } from "@/context/ThemeContext";

interface ConversationHeaderProps {
  title: string;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onClearChat: () => void;
}

function ConversationHeaderComponent({
  title,
  onNewChat,
  onToggleSidebar,
  onClearChat,
}: ConversationHeaderProps) {
  const [showOptions, setShowOptions] = useState(false);
  const { playSound } = useSound();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);

  // Memoize handlers for better performance
  const handleToggleOptions = useCallback(() => {
    playSound("/click.mp3", 0.1);
    setShowOptions((prev) => !prev);
  }, [playSound]);

  const handleNewChat = useCallback(() => {
    playSound("/click.mp3", 0.2);
    onNewChat();
    setShowOptions(false);
  }, [playSound, onNewChat]);

  const handleClearChat = useCallback(() => {
    playSound("/click.mp3", 0.2);
    onClearChat();
    setShowOptions(false);
  }, [playSound, onClearChat]);

  const handleToggleSidebar = useCallback(() => {
    playSound("/click.mp3", 0.2);
    onToggleSidebar();
  }, [playSound, onToggleSidebar]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node) &&
        optionsButtonRef.current &&
        !optionsButtonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    // Handle escape key to close dropdown
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showOptions) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showOptions]);

  // Focus management for the dropdown menu
  useEffect(() => {
    if (showOptions && optionsRef.current) {
      const firstButton = optionsRef.current.querySelector("button");
      if (firstButton) {
        (firstButton as HTMLButtonElement).focus();
      }
    }
  }, [showOptions]);

  const headerStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    backgroundColor: isDark ? "var(--retro-black)" : "var(--retro-dark-blue)",
    borderBottom: `3px solid #000`,
    position: "relative",
    zIndex: 10,
    boxShadow: "inset 0 -4px 8px rgba(0, 0, 0, 0.2)",
    margin: "0 10px",
    marginTop: "10px",
    borderRadius: "3px 3px 0 0",
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: isDark ? "#121233" : "#460000",
    border: "2px solid #000",
    color: "white",
    cursor: "pointer",
    padding: "6px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "2px 2px 0 #000",
    transform: "translate(0, 0)",
    imageRendering: "pixelated",
  };

  const titleStyle: CSSProperties = {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: isDark ? "#92e852" : "#8adb4b",
    textAlign: "center",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    padding: "0 1rem",
    margin: 0,
    fontFamily: "var(--terminal-font)",
    letterSpacing: "1px",
    textTransform: "uppercase",
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: "calc(100% + 5px)",
    right: "10px",
    backgroundColor: isDark ? "var(--retro-black)" : "var(--retro-dark-blue)",
    border: `3px solid #000`,
    borderRadius: "3px",
    boxShadow: "3px 3px 0 #000",
    padding: "4px 0",
    zIndex: 20,
    minWidth: "180px",
    overflow: "hidden",
  };

  const menuItemStyle = (isDelete = false): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontFamily: "var(--terminal-font)",
    letterSpacing: "1px",
    color: isDelete ? "var(--retro-red)" : isDark ? "#92e852" : "#8adb4b",
    borderBottom: isDelete ? "none" : `2px solid ${isDark ? "#000" : "#000"}`,
  });

  return (
    <header
      className="conversation-header"
      style={headerStyle}
      role="banner"
      aria-label="Conversation header"
    >
      <button
        onClick={handleToggleSidebar}
        className="sidebar-toggle retro-btn"
        style={buttonStyle}
        title="Show conversations"
        aria-label="Show conversations sidebar"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1
        className="conversation-title crt-flicker"
        style={titleStyle}
        title={title || "New Conversation"}
      >
        {title || "NEW SESSION"}
      </h1>

      <div className="conversation-actions" style={{ position: "relative" }}>
        <button
          ref={optionsButtonRef}
          onClick={handleToggleOptions}
          className="retro-btn"
          style={buttonStyle}
          title="Options"
          aria-label="Conversation options"
          aria-haspopup="true"
          aria-expanded={showOptions}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
              fill="currentColor"
            />
            <path
              d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
              fill="currentColor"
            />
            <path
              d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {showOptions && (
          <div
            ref={optionsRef}
            className="options-dropdown pixel-box"
            style={dropdownStyle}
            role="menu"
            aria-orientation="vertical"
          >
            <button
              onClick={handleNewChat}
              style={menuItemStyle()}
              role="menuitem"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "10px" }}
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              NEW SESSION
            </button>
            <button
              onClick={handleClearChat}
              style={menuItemStyle(true)}
              role="menuitem"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginRight: "10px" }}
              >
                <path
                  d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M3 7H21M16 7L15.2815 4.84847C15.107 4.32756 14.6156 4 14.0621 4H9.93789C9.38438 4 8.89302 4.32756 8.71846 4.84847L8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              CLEAR CHAT
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        button.retro-btn:active {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
      `}</style>
    </header>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ConversationHeader = memo(ConversationHeaderComponent);
