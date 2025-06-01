"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useSound } from "@/context/SoundContext";

interface KeyboardShortcutsProps {
  onNewChat?: () => void;
  onClearChat?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
}

export function KeyboardShortcuts({
  onNewChat,
  onClearChat,
  onToggleSidebar,
  onFocusInput,
}: KeyboardShortcutsProps) {
  const { toggleMode } = useTheme();
  const { toggleSound, playClickSound } = useSound();

  useEffect(() => {
    const handleKeyboardShortcuts = (event: KeyboardEvent) => {
      // Ignore shortcuts when user is typing in input fields
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        // Allow only Escape to work in input fields
        if (event.key === "Escape") {
          document.activeElement.blur();
          playClickSound();
          event.preventDefault();
        }
        return;
      }

      // Handle various keyboard shortcuts
      if (event.ctrlKey || event.metaKey) {
        // Check for Ctrl/Cmd combinations
        switch (event.key.toLowerCase()) {
          case "n": // New chat
            if (onNewChat) {
              event.preventDefault();
              playClickSound();
              onNewChat();
            }
            break;
          case "l": // Clear chat
            if (onClearChat) {
              event.preventDefault();
              playClickSound();
              onClearChat();
            }
            break;
          case "/": // Focus input
            if (onFocusInput) {
              event.preventDefault();
              playClickSound();
              onFocusInput();
            }
            break;
        }
      } else {
        // Single key shortcuts
        switch (event.key) {
          case "/": // Focus input
            if (onFocusInput) {
              event.preventDefault();
              playClickSound();
              onFocusInput();
            }
            break;
          case "t": // Toggle theme
            event.preventDefault();
            playClickSound();
            toggleMode();
            break;
          case "m": // Toggle sound
            event.preventDefault();
            playClickSound();
            toggleSound();
            break;
          case "s": // Toggle sidebar
            if (onToggleSidebar) {
              event.preventDefault();
              playClickSound();
              onToggleSidebar();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);

    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [
    onNewChat,
    onClearChat,
    onFocusInput,
    onToggleSidebar,
    toggleMode,
    toggleSound,
    playClickSound,
  ]);

  // This is a non-visual component
  return null;
}
