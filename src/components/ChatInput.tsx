"use client";

import React, {
  useState,
  useRef,
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
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function ChatInputComponent({
  onSendMessage,
  isLoading = false,
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

  // Add keyboard event listeners for better typing sound effects
  useEffect(() => {
    // Create event listener for keydown events - using DOM KeyboardEvent type, not React's
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      // Only play sound for character keys and not for special keys
      const isCharKey =
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey;

      // Only play for textarea when it's focused
      if (
        isCharKey &&
        document.activeElement === textareaRef.current &&
        !typingTimeoutRef.current
      ) {
        playTypingSound();

        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 50);
      }
    };

    // Add global keyboard listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playTypingSound]);

  // Use the enhanced useFocus hook with our existing ref
  const focusRef = useFocus<HTMLTextAreaElement>({
    focusOnMount: true,
    focusOnUpdate: true,
    dependencies: [isLoading, input], // Re-focus when loading state or input changes
    delay: 10,
    attemptCount: 5, // Try more times to ensure it gets focus
  });

  // Merge the refs
  useEffect(() => {
    if (focusRef.current !== null && textareaRef.current === null) {
      // This shouldn't happen, but TypeScript needs this check
      // No action needed as focusRef will handle the focusing
    }
  }, [focusRef]);

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

  // Handle input changes
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      // Play typing sound for each character typed
      // Only if the input is getting longer (not when deleting text)
      if (value.length > input.length) {
        // Only throttle slightly to make typing feel more responsive
        if (!typingTimeoutRef.current) {
          playTypingSound();

          // Set a very short throttle time for a more responsive feel
          typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
          }, 50); // Much shorter delay for faster typing sound response
        }
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

  // Convert CSSProperties to style properties that TextareaAutosize accepts
  const textareaStyle = {
    resize: "none" as const,
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
    position: "relative" as const,
    zIndex: 2,
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
            {">" + (isInputEmpty ? "" : " " + input.length)}
          </div>

          {/* Text area wrapper */}
          <div
            style={{
              flex: 1,
              position: "relative",
              border: "3px solid #000",
              borderRadius: "2px",
              boxShadow: "3px 3px 0 #000, inset 0 0 6px rgba(0, 0, 0, 0.4)",
              backgroundColor: "rgba(15, 25, 50, 0.8)",
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
              ref={(element) => {
                // Assign to both refs
                if (textareaRef) textareaRef.current = element;
                if (focusRef && typeof focusRef === "object")
                  (
                    focusRef as React.MutableRefObject<HTMLTextAreaElement | null>
                  ).current = element;
              }}
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isInputEmpty && !isLoading && !disabled) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder={placeholder}
              minRows={1}
              maxRows={5}
              disabled={isLoading || disabled}
              style={textareaStyle}
            />

            {/* Hidden submit button for form submission - visually hidden but keeps form functionality */}
            <button
              type="submit"
              disabled={isInputEmpty || isLoading || disabled}
              style={{ display: "none" }}
            />
          </div>
        </div>

        {/* Character count */}
        <div
          style={{
            position: "absolute",
            right: "20px", // Adjusted position since there's no Send button
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

      <style jsx>{`
        .action-icon:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        .action-icon {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const ChatInput = memo(ChatInputComponent);
