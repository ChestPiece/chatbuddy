"use client";

import React, {
  useState,
  useRef,
  KeyboardEvent,
  CSSProperties,
  useEffect,
  useCallback,
  memo,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useSound } from "@/context/SoundContext";
import { useTheme } from "@/context/ThemeContext";
import { useFocus } from "@/hooks/useFocus";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function ChatInputComponent({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = "Type your message...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { mode } = useTheme();
  const { playClickSound, playTypingSound } = useSound();
  const isDark = mode === "dark";
  const isInputEmpty = input.trim() === "";

  // Use the enhanced useFocus hook with our existing ref
  useFocus({
    ref: textareaRef,
    focusOnMount: true,
    focusOnUpdate: true,
    dependencies: [isLoading, input], // Re-focus when loading state or input changes
    delay: 10,
    attemptCount: 5, // Try more times to ensure it gets focus
  });

  // Ensure textarea gets focus after component updates (like after sending a message)
  useEffect(() => {
    // Short delay to ensure focus happens after state updates
    const focusTimeout = setTimeout(() => {
      if (textareaRef.current && !isLoading) {
        textareaRef.current.focus();
      }
    }, 100);

    return () => clearTimeout(focusTimeout);
  }, [isLoading, input]);

  // Memoize the submit handler to prevent unnecessary re-creations
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (input.trim() && !isLoading && !disabled) {
        playClickSound();
        onSendMessage(input.trim());
        setInput("");

        // Force focus back to textarea after a short delay
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 10);
      }
    },
    [input, isLoading, disabled, onSendMessage, playClickSound]
  );

  // Handle key press events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
        return;
      }
    },
    [handleSubmit]
  );

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      // Only play typing sound if not already playing and input is getting longer
      if (value.length > input.length && !typingTimeoutRef.current) {
        playTypingSound();

        // Set a timer to allow the sound to play again after a delay
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 500);
      }
    },
    [input, playTypingSound]
  );

  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Style objects
  const containerStyle: CSSProperties = {
    padding: "1rem",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderTop: "4px solid var(--tv-border)",
    backdropFilter: "blur(4px)",
    imageRendering: "pixelated",
  };

  const textareaStyle: CSSProperties = {
    resize: "none",
    padding: "8px 12px",
    paddingRight: "80px",
    fontSize: "1rem",
    backgroundColor: "transparent",
    color: isDark ? "var(--terminal-text)" : "var(--terminal-text)",
    border: "none",
    outline: "none",
    fontFamily: "var(--terminal-font)",
    width: "100%",
    lineHeight: "1.5",
    letterSpacing: "1px",
    position: "relative",
    zIndex: 2,
  };

  const sendButtonStyle: CSSProperties = {
    position: "absolute",
    right: "8px",
    bottom: "8px",
    fontSize: "0.75rem",
    padding: "4px 8px",
    minWidth: "60px",
    backgroundColor: isDark ? "var(--retro-blue)" : "var(--retro-teal)",
    opacity: isInputEmpty || isLoading || disabled ? 0.5 : 1,
    cursor: isInputEmpty || isLoading || disabled ? "not-allowed" : "pointer",
  };

  return (
    <div className="chat-input-container" style={containerStyle}>
      <form onSubmit={handleSubmit} style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.75rem",
            position: "relative",
          }}
        >
          {/* Command prompt symbol */}
          <div
            style={{
              fontFamily: "var(--terminal-font)",
              fontSize: "1.5rem",
              color: isDark ? "var(--terminal-text)" : "var(--terminal-text)",
              fontWeight: "bold",
              lineHeight: 1,
              marginBottom: "10px",
              textShadow: "var(--text-glow)",
            }}
          >
            &gt;
          </div>

          {/* Text area wrapper */}
          <div
            style={{
              flex: 1,
              position: "relative",
              border: "3px solid #000",
              borderRadius: "2px",
              boxShadow: "3px 3px 0 #000, inset 0 0 6px rgba(0, 0, 0, 0.4)",
              backgroundColor: isDark
                ? "rgba(15, 17, 27, 0.8)"
                : "rgba(15, 25, 50, 0.8)",
              padding: "0.2rem",
              display: "flex",
            }}
          >
            {/* Scanlines effect inside the input */}
            <div
              className="scanlines"
              style={{
                opacity: 0.05,
                borderRadius: "0",
                zIndex: 1,
              }}
            ></div>

            <TextareaAutosize
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              minRows={1}
              maxRows={5}
              disabled={isLoading || disabled}
              style={textareaStyle}
            />

            {/* Send button */}
            <button
              className="retro-btn"
              type="submit"
              disabled={isInputEmpty || isLoading || disabled}
              style={sendButtonStyle}
            >
              {isLoading ? "..." : "SEND"}
            </button>
          </div>
        </div>

        {/* Character count */}
        <div
          style={{
            position: "absolute",
            right: "105px",
            bottom: "-1.5rem",
            fontSize: "0.75rem",
            color: isDark
              ? input.length > 2000
                ? "var(--retro-red)"
                : "var(--retro-teal)"
              : input.length > 2000
              ? "var(--retro-red)"
              : "var(--retro-teal)",
            fontFamily: "var(--terminal-font)",
            opacity: 0.8,
            textShadow: "var(--text-glow)",
          }}
        >
          {input.length}/4000
        </div>
      </form>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ChatInput = memo(ChatInputComponent);
