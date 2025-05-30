"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type ColorTheme =
  | "default"
  | "cyberpunk"
  | "retro-console"
  | "vaporwave"
  | "terminal";

interface ThemeContextType {
  mode: "light" | "dark";
  toggleMode: () => void;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default");

  // Initial loading of saved theme preferences
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load theme mode from localStorage
      const savedMode = localStorage.getItem("chatBuddy_theme");
      if (savedMode === "light" || savedMode === "dark") {
        setMode(savedMode);
      }

      // Load color theme from localStorage
      const savedColorTheme = localStorage.getItem(
        "chatBuddy_colorTheme"
      ) as ColorTheme;
      if (savedColorTheme && isValidColorTheme(savedColorTheme)) {
        setColorTheme(savedColorTheme);
      }
    }
  }, []);

  // Effect to update body classes whenever theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      updateBodyClasses(mode, colorTheme);
    }
  }, [mode, colorTheme]);

  // Function to check if a string is a valid ColorTheme
  const isValidColorTheme = (theme: string): theme is ColorTheme => {
    return [
      "default",
      "cyberpunk",
      "retro-console",
      "vaporwave",
      "terminal",
    ].includes(theme);
  };

  // Function to update body classes for both mode and colorTheme
  const updateBodyClasses = (
    newMode: "light" | "dark",
    newColorTheme: ColorTheme
  ) => {
    // Update mode classes
    document.body.classList.add(newMode === "dark" ? "dark" : "light");
    document.body.classList.remove(newMode === "dark" ? "light" : "dark");

    // Update color theme classes
    document.body.classList.forEach((cls) => {
      if (cls.startsWith("theme-")) {
        document.body.classList.remove(cls);
      }
    });
    document.body.classList.add(`theme-${newColorTheme}`);
  };

  const toggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";
    setMode(newMode);

    if (typeof window !== "undefined") {
      localStorage.setItem("chatBuddy_theme", newMode);
      updateBodyClasses(newMode, colorTheme);
    }
  };

  const handleSetColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);

    if (typeof window !== "undefined") {
      localStorage.setItem("chatBuddy_colorTheme", theme);
      updateBodyClasses(mode, theme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        toggleMode,
        colorTheme,
        setColorTheme: handleSetColorTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
