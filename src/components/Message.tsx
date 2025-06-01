"use client";

import { Message as MessageType } from "@/types/chat";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState, CSSProperties, memo, useMemo } from "react";
import { useAnimation } from "@/hooks/useAnimation";

interface MessageProps {
  message: MessageType;
  isLastInGroup?: boolean;
}

function MessageComponent({ message, isLastInGroup = false }: MessageProps) {
  const { mode } = useTheme();
  const isUser = message.role === "user";
  const isDark = mode === "dark";

  const [displayedContent, setDisplayedContent] = useState(
    isUser || !message.isStreaming ? message.content : ""
  );

  const [typeIndex, setTypeIndex] = useState(0);

  const contentLines = useMemo(() => {
    return displayedContent.split("\n");
  }, [displayedContent]);

  const animation = useAnimation({
    initialState: {
      transform: `translateY(${isUser ? "10px" : "-10px"})`,
      opacity: 0,
    },
    finalState: {
      transform: "translateY(0)",
      opacity: 1,
    },
    duration: 300,
    delay: 100,
  });

  useEffect(() => {
    if (isUser || !message.isStreaming) {
      setDisplayedContent(message.content);
      return;
    }

    if (typeIndex >= message.content.length) {
      return;
    }

    const currentChar = message.content[typeIndex];
    const isEndOfSentence = [".", "!", "?", "\n"].includes(currentChar);
    const typingDelay = isEndOfSentence ? 50 : 15;

    const timer = setTimeout(() => {
      setTypeIndex((prev) => prev + 1);
      setDisplayedContent(message.content.substring(0, typeIndex + 1));
    }, typingDelay);

    return () => clearTimeout(timer);
  }, [message.content, typeIndex, isUser, message.isStreaming]);

  useEffect(() => {
    if (!isUser) {
      if (message.isStreaming) {
        setTypeIndex(0);
        setDisplayedContent("");
      } else {
        setDisplayedContent(message.content);
      }
    }
  }, [message.content, isUser, message.isStreaming]);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "24px",
      position: "relative",
      ...animation.style,
    }),
    [isUser, animation.style]
  );

  const formattedTime = useMemo(() => {
    return new Date(message.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.createdAt]);

  const messageBubbleStyle = useMemo<CSSProperties>(
    () => ({
      maxWidth: "85%",
      borderRadius: "3px",
      padding: "10px 14px",
      backgroundColor: isUser
        ? isDark
          ? "var(--retro-blue)"
          : "var(--retro-teal)"
        : isDark
        ? "rgba(7, 10, 28, 0.85)"
        : "rgba(10, 20, 45, 0.85)",
      color: isUser
        ? "#ffffff"
        : isDark
        ? "var(--terminal-text)"
        : "var(--terminal-text)",
      border: `3px solid #000`,
      boxShadow: "3px 3px 0 #000",
      transform: "translate(0, 0)",
      imageRendering: "pixelated",
      position: "relative",
      overflow: "hidden",
    }),
    [isUser, isDark]
  );

  return (
    <div
      className={`flex-${
        isUser ? "justify-end" : "justify-start"
      } message-container`}
      style={containerStyle}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <div
          style={{
            width: "24px",
            height: "24px",
            marginRight: "10px",
            marginTop: "2px",
            backgroundColor: isDark ? "#121233" : "#0a1530",
            border: "2px solid #000",
            boxShadow: "1px 1px 0 #000, inset 0 0 4px rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isDark ? "var(--terminal-text)" : "var(--terminal-text)",
              fontSize: "14px",
              fontFamily: "var(--pixel-font)",
              textShadow: "0 0 4px rgba(122, 255, 155, 0.5)",
            }}
          >
            {">"}
          </div>
        </div>
      )}

      <div
        className={`message-bubble ${
          isUser ? "user-message" : "assistant-message"
        }`}
        style={messageBubbleStyle}
      >
        {isUser && (
          <div
            className="tv-static"
            style={{
              opacity: 0.03,
              borderRadius: "1px",
            }}
          />
        )}

        {!isUser && (
          <div
            className="scanlines"
            style={{
              opacity: 0.05,
              borderRadius: "1px",
            }}
          />
        )}

        {/* Message content */}
        <div
          className={isUser ? "" : "terminal-text"}
          style={{
            lineHeight: "1.5",
            fontSize: "16px",
            wordBreak: "break-word",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* If the message is from assistant, render the header */}
          {!isUser && isLastInGroup && (
            <div
              style={{
                fontSize: "0.75rem",
                marginBottom: "10px",
                color: isDark ? "var(--retro-cyan)" : "var(--retro-teal)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: "bold",
                fontFamily: "var(--pixel-font)",
              }}
            >
              SYSTEM
            </div>
          )}

          {/* Prefix for user messages */}
          {isUser && (
            <span style={{ color: "var(--retro-yellow)", marginRight: "6px" }}>
              &gt;
            </span>
          )}

          {contentLines.map((line, i) => (
            <div
              key={i}
              style={{
                marginBottom: "0.7rem",
                wordBreak: "break-word",
                position: "relative",
              }}
            >
              {line || "\u00A0"}
            </div>
          ))}
          {message.isStreaming && (
            <span
              className="cursor-blink"
              style={{
                display: "inline-block",
                width: "8px",
                height: "16px",
                backgroundColor: isDark
                  ? "var(--terminal-text)"
                  : "var(--terminal-text)",
                verticalAlign: "middle",
                marginLeft: "4px",
              }}
            />
          )}
        </div>

        {/* Timestamp */}
        {isLastInGroup && (
          <div
            style={{
              fontSize: "0.65rem",
              opacity: 0.8,
              marginTop: "8px",
              textAlign: isUser ? "right" : "left",
              fontFamily: "var(--terminal-font)",
              color: isUser
                ? "rgba(255, 255, 255, 0.8)"
                : isDark
                ? "var(--retro-teal)"
                : "var(--retro-teal)",
              letterSpacing: "1px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {formattedTime}
          </div>
        )}
      </div>

      {/* Avatar for user */}
      {isUser && (
        <div
          style={{
            width: "24px",
            height: "24px",
            marginLeft: "10px",
            marginTop: "2px",
            backgroundColor: isDark ? "var(--retro-blue)" : "var(--retro-teal)",
            border: "2px solid #000",
            boxShadow: "1px 1px 0 #000, inset 0 0 4px rgba(255, 255, 255, 0.1)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "12px",
              fontFamily: "var(--pixel-font)",
              textShadow: "0 0 4px rgba(255, 255, 255, 0.5)",
            }}
          >
            {"U"}
          </div>
        </div>
      )}
    </div>
  );
}

export const Message = memo(MessageComponent);
