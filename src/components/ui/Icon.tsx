"use client";

import { ReactNode } from "react";

// Icon types available in the app
type IconType =
  | "sound-on"
  | "sound-off"
  | "theme"
  | "warning"
  | "error"
  | "success"
  | "info"
  | "send"
  | "user"
  | "assistant"
  | "loading";

interface IconProps {
  type: IconType;
  size?: number;
  color?: string;
  className?: string;
}

export default function Icon({
  type,
  size = 20,
  color = "currentColor",
  className = "",
}: IconProps) {
  const getIcon = (): ReactNode => {
    switch (type) {
      case "sound-on":
        return (
          <>
            {/* Speaker icon */}
            <div
              style={{
                position: "absolute",
                width: `${size * 0.4}px`,
                height: `${size * 0.4}px`,
                borderRadius: `0 ${size * 0.2}px ${size * 0.2}px 0`,
                border: `2px solid ${color}`,
                borderLeft: "none",
                left: `${size * 0.2}px`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${size * 0.1}px`,
                width: `${size * 0.2}px`,
                height: `${size * 0.5}px`,
                backgroundColor: color,
                borderRadius: `${size * 0.1}px 0 0 ${size * 0.1}px`,
              }}
            />
            {/* Sound waves */}
            <div
              style={{
                position: "absolute",
                right: "0",
                width: `${size * 0.3}px`,
                height: `${size * 0.3}px`,
                borderTop: `2px solid ${color}`,
                borderRight: `2px solid ${color}`,
                borderRadius: `0 ${size * 0.3}px 0 0`,
                transform: "rotate(45deg)",
                top: `${size * 0.2}px`,
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "0",
                width: `${size * 0.4}px`,
                height: `${size * 0.4}px`,
                borderTop: `2px solid ${color}`,
                borderRight: `2px solid ${color}`,
                borderRadius: `0 ${size * 0.5}px 0 0`,
                transform: "rotate(45deg)",
                top: `${size * 0.1}px`,
              }}
            />
          </>
        );

      case "sound-off":
        return (
          <>
            {/* Speaker icon */}
            <div
              style={{
                position: "absolute",
                width: `${size * 0.4}px`,
                height: `${size * 0.4}px`,
                borderRadius: `0 ${size * 0.2}px ${size * 0.2}px 0`,
                border: `2px solid ${color}`,
                borderLeft: "none",
                left: `${size * 0.2}px`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${size * 0.1}px`,
                width: `${size * 0.2}px`,
                height: `${size * 0.5}px`,
                backgroundColor: color,
                borderRadius: `${size * 0.1}px 0 0 ${size * 0.1}px`,
              }}
            />
            {/* X */}
            <div
              style={{
                position: "absolute",
                right: "0",
                width: `${size * 0.1}px`,
                height: `${size * 0.7}px`,
                backgroundColor: color,
                transform: "rotate(45deg)",
                transformOrigin: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "0",
                width: `${size * 0.1}px`,
                height: `${size * 0.7}px`,
                backgroundColor: color,
                transform: "rotate(-45deg)",
                transformOrigin: "center",
              }}
            />
          </>
        );

      case "theme":
        return (
          <>
            <div
              style={{
                position: "absolute",
                width: `${size * 0.6}px`,
                height: `${size * 0.6}px`,
                borderRadius: "50%",
                border: `2px solid ${color}`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "50%",
                width: `${size * 0.1}px`,
                height: `${size * 0.4}px`,
                transform: "translateX(-50%)",
                backgroundColor: color,
              }}
            />
          </>
        );

      case "warning":
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                backgroundColor: color,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: `${size * 0.25}px`,
                left: "50%",
                transform: "translateX(-50%)",
                fontWeight: "bold",
                fontSize: `${size * 0.6}px`,
                color: "#000",
              }}
            >
              !
            </div>
          </>
        );

      case "error":
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: `${size * 0.6}px`,
                height: `${size * 0.1}px`,
                backgroundColor: "#000",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(45deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: `${size * 0.6}px`,
                height: `${size * 0.1}px`,
                backgroundColor: "#000",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%) rotate(-45deg)",
              }}
            />
          </>
        );

      case "success":
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
            <div
              style={{
                position: "absolute",
                width: `${size * 0.25}px`,
                height: `${size * 0.1}px`,
                backgroundColor: "#000",
                top: "50%",
                left: "30%",
                transform: "translate(-50%, -50%) rotate(45deg)",
                transformOrigin: "left center",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: `${size * 0.5}px`,
                height: `${size * 0.1}px`,
                backgroundColor: "#000",
                top: "50%",
                left: "65%",
                transform: "translate(-50%, -20%) rotate(-45deg)",
                transformOrigin: "left center",
              }}
            />
          </>
        );

      case "send":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              clipPath: "polygon(0 0, 0 100%, 100% 50%)",
              backgroundColor: color,
            }}
          />
        );

      case "user":
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: color,
                borderRadius: "0%",
                border: `2px solid #000`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: `${size * 0.1}px`,
                left: `${size * 0.1}px`,
                width: `${size * 0.4}px`,
                height: `${size * 0.4}px`,
                backgroundColor: "white",
              }}
            />
          </>
        );

      case "assistant":
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: color,
                borderRadius: "50%",
                border: `2px solid #000`,
              }}
            />
          </>
        );

      case "loading":
        return (
          <div
            style={{
              display: "flex",
              gap: `${size * 0.1}px`,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                height: `${size * 0.3}px`,
                width: `${size * 0.3}px`,
                backgroundColor: color,
                borderRadius: "50%",
                animation: "pulse 1s infinite",
                animationDelay: "0s",
              }}
            />
            <div
              style={{
                height: `${size * 0.3}px`,
                width: `${size * 0.3}px`,
                backgroundColor: color,
                borderRadius: "50%",
                animation: "pulse 1s infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              style={{
                height: `${size * 0.3}px`,
                width: `${size * 0.3}px`,
                backgroundColor: color,
                borderRadius: "50%",
                animation: "pulse 1s infinite",
                animationDelay: "0.4s",
              }}
            />

            <style jsx>{`
              @keyframes pulse {
                0%,
                100% {
                  opacity: 0.3;
                }
                50% {
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        );

      case "info":
      default:
        return (
          <>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor: color,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: `${size * 0.25}px`,
                left: "50%",
                transform: "translateX(-50%)",
                fontWeight: "bold",
                fontSize: `${size * 0.6}px`,
                color: "#000",
              }}
            >
              i
            </div>
          </>
        );
    }
  };

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {getIcon()}
    </div>
  );
}
