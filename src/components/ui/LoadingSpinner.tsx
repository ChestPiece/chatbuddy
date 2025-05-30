"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

type SpinnerSize = "sm" | "md" | "lg";
type SpinnerVariant = "dots" | "spinner" | "pulse";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: string;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingSpinner({
  size = "md",
  variant = "dots",
  color,
  text,
  className = "",
  style = {},
}: LoadingSpinnerProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  const getColor = () => {
    if (color) return color;
    return isDark ? "var(--primary)" : "var(--primary)";
  };

  const getSizeValue = () => {
    switch (size) {
      case "sm":
        return { dot: 4, text: "0.75rem" };
      case "md":
        return { dot: 8, text: "0.875rem" };
      case "lg":
        return { dot: 12, text: "1rem" };
      default:
        return { dot: 8, text: "0.875rem" };
    }
  };

  const sizeValues = getSizeValue();

  const renderDots = () => (
    <div
      className="loading-dots"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: `${sizeValues.dot / 2}px`,
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="dot"
          style={{
            width: `${sizeValues.dot}px`,
            height: `${sizeValues.dot}px`,
            backgroundColor: getColor(),
            borderRadius: "50%",
            display: "inline-block",
            animation: `bounce 1s infinite ${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );

  const renderSpinner = () => (
    <div
      className="spinner"
      style={{
        width: `${sizeValues.dot * 3}px`,
        height: `${sizeValues.dot * 3}px`,
        border: `${Math.max(
          2,
          sizeValues.dot / 3
        )}px solid rgba(255, 255, 255, 0.2)`,
        borderTopColor: getColor(),
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );

  const renderPulse = () => (
    <div
      className="pulse"
      style={{
        width: `${sizeValues.dot * 2}px`,
        height: `${sizeValues.dot * 2}px`,
        backgroundColor: getColor(),
        borderRadius: "50%",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "spinner":
        return renderSpinner();
      case "pulse":
        return renderPulse();
      default:
        return renderDots();
    }
  };

  return (
    <div
      className={`loading-spinner ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        ...style,
      }}
    >
      {renderLoader()}
      {text && (
        <div style={{ fontSize: sizeValues.text, color: getColor() }}>
          {text}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-${sizeValues.dot / 2}px);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
