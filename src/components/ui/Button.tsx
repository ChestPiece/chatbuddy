"use client";

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { buttonStyles } from "@/styles/ui";

type ButtonVariant = "primary" | "secondary" | "icon" | "text" | "retro";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  leftIcon,
  rightIcon,
  isLoading = false,
  className = "",
  ...props
}: ButtonProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  // Calculate size styles
  const sizeStyles = {
    sm: { padding: "0.375rem 0.75rem", fontSize: "0.75rem" },
    md: { padding: "0.625rem 1rem", fontSize: "0.875rem" },
    lg: { padding: "0.75rem 1.25rem", fontSize: "1rem" },
  };

  // Build combined styles
  const getButtonStyles = () => {
    let styles = { ...buttonStyles.base, ...sizeStyles[size] };

    if (fullWidth) {
      styles = { ...styles, width: "100%" };
    }

    // Apply variant styles
    switch (variant) {
      case "primary":
        styles = { ...styles, ...buttonStyles.primary };
        break;
      case "secondary":
        styles = { ...styles, ...buttonStyles.secondary(isDark) };
        break;
      case "icon":
        styles = { ...styles, ...buttonStyles.icon };
        break;
      case "text":
        styles = {
          ...styles,
          backgroundColor: "transparent",
          border: "none",
          boxShadow: "none",
          color: isDark ? "#e2e8f0" : "#1e293b",
          padding: "0.25rem 0.5rem",
        };
        break;
      case "retro":
        // No need to add styles here as we'll use the retro-button class
        break;
    }

    return styles;
  };

  // Determine if we should apply the retro class
  const buttonClass = variant === "retro" ? "retro-button" : "";

  return (
    <button
      style={getButtonStyles()}
      disabled={isLoading || props.disabled}
      className={`${buttonClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            className="loading-dots"
            style={{ display: "flex", justifyContent: "center", gap: "4px" }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="dot"
                style={{
                  width: "0.25rem",
                  height: "0.25rem",
                  backgroundColor: "currentColor",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: `bounce 1s infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </div>
          {variant !== "icon" && (
            <span>{variant === "retro" ? "LOADING..." : "Loading..."}</span>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {leftIcon && <span className="button-icon">{leftIcon}</span>}
          {variant === "retro" ? children.toString().toUpperCase() : children}
          {rightIcon && <span className="button-icon">{rightIcon}</span>}
        </div>
      )}
    </button>
  );
}
