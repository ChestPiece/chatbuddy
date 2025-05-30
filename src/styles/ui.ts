/**
 * Common UI styles for reuse across components
 */

export const buttonStyles = {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    cursor: "pointer",
    outline: "none",
    transition: "all 0.2s ease",
  },
  toggle: (isDark: boolean) => ({
    width: "36px",
    height: "36px",
    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    border: `2px solid ${isDark ? "#1e293b" : "#cbd5e1"}`,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
  }),
  primary: {
    backgroundImage: "var(--gradient-primary)",
    color: "white",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    padding: "0.75rem 1.25rem",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  secondary: (isDark: boolean) => ({
    backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
    color: isDark ? "#e2e8f0" : "#1e293b",
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
  }),
  icon: {
    width: "2rem",
    height: "2rem",
    padding: "0.25rem",
  },
};

export const cardStyles = {
  base: {
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    boxShadow: "var(--shadow)",
    overflow: "hidden",
  },
  glass: (isDark: boolean) => ({
    backgroundColor: isDark
      ? "rgba(15, 23, 42, 0.7)"
      : "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: `1px solid ${
      isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)"
    }`,
    boxShadow: isDark
      ? "0 4px 6px rgba(0, 0, 0, 0.1)"
      : "0 4px 6px rgba(0, 0, 0, 0.05)",
  }),
  messageUser: (isDark: boolean) => ({
    backgroundColor: isDark
      ? "rgba(37, 99, 235, 0.8)"
      : "rgba(59, 130, 246, 0.95)",
    color: "white",
    border: `1px solid ${
      isDark ? "rgba(30, 64, 175, 0.5)" : "rgba(37, 99, 235, 0.4)"
    }`,
    boxShadow: isDark
      ? "0 2px 5px rgba(0, 0, 0, 0.2)"
      : "0 2px 10px rgba(37, 99, 235, 0.2)",
  }),
  messageAssistant: (isDark: boolean) => ({
    backgroundColor: isDark
      ? "rgba(30, 41, 59, 0.7)"
      : "rgba(255, 255, 255, 0.95)",
    color: isDark ? "white" : "#1e293b",
    border: `1px solid ${
      isDark ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)"
    }`,
    boxShadow: isDark
      ? "0 2px 5px rgba(0, 0, 0, 0.2)"
      : "0 2px 10px rgba(0, 0, 0, 0.05)",
  }),
};

export const textStyles = {
  pixel: {
    fontFamily: "var(--pixel-font)",
  },
  heading: {
    fontWeight: "bold",
    lineHeight: "1.2",
  },
  body: {
    fontFamily: "var(--main-font)",
    lineHeight: "1.5",
  },
  muted: (isDark: boolean) => ({
    color: isDark ? "var(--text-muted-dark)" : "var(--text-muted-light)",
    fontSize: "0.875rem",
  }),
};

export const layoutStyles = {
  flexRow: {
    display: "flex",
    alignItems: "center",
  },
  flexColumn: {
    display: "flex",
    flexDirection: "column",
  },
  container: {
    width: "90%",
    maxWidth: "800px",
    margin: "0 auto",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  gap: (size: number) => ({
    gap: `${size * 0.25}rem`,
  }),
};
