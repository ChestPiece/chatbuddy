"use client";

import React, { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { cardStyles } from "@/styles/ui";

type CardVariant = "default" | "glass" | "message" | "outlined" | "retro";

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  role?: string;
  messageRole?: "user" | "assistant";
  hoverEffect?: boolean;
}

export function Card({
  children,
  variant = "default",
  className = "",
  style = {},
  onClick,
  role,
  messageRole,
  hoverEffect = false,
  ...props
}: CardProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const getCardStyles = () => {
    let styles = { ...cardStyles.base } as React.CSSProperties;

    switch (variant) {
      case "glass":
        styles = { ...styles, ...cardStyles.glass(isDark) };
        break;
      case "message":
        if (messageRole === "user") {
          styles = { ...styles, ...cardStyles.messageUser(isDark) };
        } else if (messageRole === "assistant") {
          styles = { ...styles, ...cardStyles.messageAssistant(isDark) };
        }
        break;
      case "outlined":
        styles = {
          ...styles,
          backgroundColor: "transparent",
          border: `1px solid ${
            isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)"
          }`,
        };
        break;
      case "retro":
        styles = {
          ...styles,
          backgroundColor: isDark
            ? "var(--retro-dark-gray)"
            : "var(--retro-white)",
          border: "var(--pixel-border-size) solid var(--pixel-border-color)",
          borderRadius: "2px",
          boxShadow: "var(--pixel-shadow)",
          imageRendering: "pixelated",
        };
        break;
    }

    if (hoverEffect) {
      styles = {
        ...styles,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      };
    }

    return { ...styles, ...style };
  };

  const retroClasses = variant === "retro" ? "pixel-border" : "";
  const messageClasses =
    variant === "message"
      ? messageRole === "user"
        ? "retro-message retro-message-user"
        : messageRole === "assistant"
        ? "retro-message retro-message-assistant"
        : ""
      : "";
  const hoverClasses = hoverEffect ? "hover-effect" : "";

  return (
    <div
      className={`card ${variant} ${retroClasses} ${messageClasses} ${hoverClasses} ${className}`}
      style={getCardStyles()}
      onClick={onClick}
      role={role}
      {...props}
    >
      {children}
    </div>
  );
}
