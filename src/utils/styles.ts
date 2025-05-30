// Common style utility functions and constants

// Color palette
export const colors = {
  primary: {
    light: "#60a5fa",
    main: "#3b82f6",
    dark: "#2563eb",
  },
  secondary: {
    light: "#9ca3af",
    main: "#6b7280",
    dark: "#4b5563",
  },
  success: {
    light: "#34d399",
    main: "#10b981",
    dark: "#059669",
  },
  error: {
    light: "#f87171",
    main: "#ef4444",
    dark: "#dc2626",
  },
  warning: {
    light: "#fbbf24",
    main: "#f59e0b",
    dark: "#d97706",
  },
  background: {
    light: "#f3f4f6",
    dark: "#121a29",
  },
  text: {
    light: "#1e293b",
    dark: "#e2e8f0",
  },
  border: {
    light: "#e2e8f0",
    dark: "#000000",
  },
};

// Common styles
export const commonStyles = {
  retro: {
    border: "4px solid #000000",
    boxShadow: "4px 4px 0 rgba(0, 0, 0, 0.5)",
    borderRadius: "4px",
  },
  statusIndicator: {
    borderRadius: "50%",
  },
  scanlines: {
    pointerEvents: "none",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
    backgroundImage:
      "linear-gradient(to bottom, rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, 0.3) 50%)",
    backgroundSize: "100% 4px",
  },
};

// Animation keyframes objects for easy reuse
export const keyframes = {
  blink: `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
  `,
  glitch1: `
    @keyframes glitch-anim-1 {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-1px, 1px); }
      40% { transform: translate(-1px, -1px); }
      60% { transform: translate(1px, 1px); }
      80% { transform: translate(1px, -1px); }
    }
  `,
  glitch2: `
    @keyframes glitch-anim-2 {
      0%, 100% { transform: translate(0); }
      25% { transform: translate(1px, 0); }
      50% { transform: translate(-1px, 1px); }
      75% { transform: translate(1px, -1px); }
    }
  `,
};

// Helper function to convert hex to rgba
export function hexToRgba(hex: string, alpha: number = 1) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
