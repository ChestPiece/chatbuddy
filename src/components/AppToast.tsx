"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { createPortal } from "react-dom";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function AppToast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [isVisible, setIsVisible] = useState(true);
  const [element, setElement] = useState<HTMLElement | null>(null);

  // Set up the toast container if it doesn't exist
  useEffect(() => {
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.position = "fixed";
      toastContainer.style.top = "70px";
      toastContainer.style.right = "20px";
      toastContainer.style.zIndex = "9999";
      toastContainer.style.display = "flex";
      toastContainer.style.flexDirection = "column";
      toastContainer.style.gap = "10px";
      document.body.appendChild(toastContainer);
    }
    setElement(toastContainer);

    // Auto-hide the toast after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsVisible(false);
    // Let animation complete before removing
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  }, [onClose]);

  // Get color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return isDark ? "var(--retro-green-dark)" : "var(--retro-green)";
      case "error":
        return isDark ? "var(--retro-red-dark)" : "var(--retro-red)";
      case "warning":
        return isDark ? "var(--retro-yellow-dark)" : "var(--retro-yellow)";
      default:
        return isDark ? "var(--retro-blue-dark)" : "var(--retro-blue)";
    }
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "!";
      case "warning":
        return "⚠";
      default:
        return "i";
    }
  };

  if (!element) return null;

  return createPortal(
    <div
      style={{
        backgroundColor: getBackgroundColor(),
        color: "white",
        padding: "12px 16px",
        borderRadius: "0px",
        marginBottom: "8px",
        border: "3px solid #000",
        boxShadow: "4px 4px 0 #000",
        opacity: isVisible ? 1 : 0,
        transform: `translateX(${isVisible ? 0 : "100%"})`,
        transition: "opacity 300ms, transform 300ms",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        maxWidth: "320px",
        fontFamily: "var(--terminal-font)",
        position: "relative",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "24px",
          height: "24px",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderRadius: "0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          border: "2px solid #000",
        }}
      >
        {getIcon()}
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>{message}</div>

      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          padding: "4px",
          lineHeight: 1,
          opacity: 0.7,
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>,
    element
  );
}

// Helper function to show toasts from anywhere
let toastCounter = 0;

export const showToast = (
  message: string,
  type: ToastType = "info",
  duration = 3000
) => {
  const id = `toast-${++toastCounter}`;
  const toastContainer =
    document.getElementById("toast-root") || document.createElement("div");

  if (!document.getElementById("toast-root")) {
    toastContainer.id = "toast-root";
    document.body.appendChild(toastContainer);
  }

  const toastElement = document.createElement("div");
  toastElement.id = id;
  toastContainer.appendChild(toastElement);

  // Create a root and render the toast
  const root = document.createElement("div");
  root.id = `toast-root-${id}`;
  document.body.appendChild(root);

  // This is a placeholder for client-side rendering
  // In a real implementation, you'd use ReactDOM or another rendering approach
  console.log("Toast shown:", { message, type, duration });

  return id;
};
