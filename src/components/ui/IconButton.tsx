"use client";

import { ReactNode, ButtonHTMLAttributes, useState } from "react";
import { useSound } from "@/context/SoundContext";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  color?: string;
  size?: "sm" | "md" | "lg";
  bgColor?: string;
  glow?: boolean;
  glowColor?: string;
  soundEffect?: string;
}

export default function IconButton({
  icon,
  color = "white",
  size = "md",
  bgColor = "#3b82f6",
  glow = true,
  glowColor,
  soundEffect = "/click.mp3",
  className = "",
  disabled,
  onClick,
  ...props
}: IconButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const { playSound } = useSound();

  // Size dimensions
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { size: "36px", iconSize: "16px" };
      case "md":
        return { size: "44px", iconSize: "20px" };
      case "lg":
        return { size: "56px", iconSize: "24px" };
      default:
        return { size: "44px", iconSize: "20px" };
    }
  };

  const dimensions = getSizeStyles();
  const finalGlowColor = glowColor || bgColor;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 100);
      playSound(soundEffect, 0.3);
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      disabled={disabled}
      className={className}
      style={{
        width: dimensions.size,
        height: dimensions.size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        position: "relative",
        backgroundColor: bgColor,
        border: "4px solid #000000",
        boxShadow: isPressed
          ? "0px 0px 0px #000"
          : isHovered && !disabled
          ? "0px 4px 0px #000, 0 0 10px rgba(255,255,255,0.3)"
          : "0px 4px 0px #000",
        transform: isPressed ? "translateY(4px)" : "translateY(0)",
        transition: "all 0.1s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        overflow: "hidden",
        opacity: disabled ? 0.5 : 1,
        ...props.style,
      }}
      {...props}
    >
      {/* Icon container */}
      <div
        style={{
          width: dimensions.iconSize,
          height: dimensions.iconSize,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          color: color,
        }}
      >
        {icon}
      </div>

      {/* Glow effect */}
      {glow && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "50%",
            boxShadow: `inset 0 0 10px rgba(${hexToRgb(finalGlowColor)}, 0.7)`,
            opacity: isHovered ? 1 : 0.5,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Light reflection */}
      <div
        style={{
          position: "absolute",
          top: "5px",
          left: "5px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.3)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
    </button>
  );
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  // Remove the # if present
  hex = hex.replace(/^#/, "");

  // Parse the hex values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
}
