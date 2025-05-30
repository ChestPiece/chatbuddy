"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SoundContextType {
  isSoundEnabled: boolean;
  toggleSound: () => void;
  playSound: (src: string, volume?: number) => void;
  playClickSound: () => void;
  playTypingSound: () => void;
  playMessageSound: () => void;
  playErrorSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

interface SoundProviderProps {
  children: ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [audioCache, setAudioCache] = useState<
    Record<string, HTMLAudioElement>
  >({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Restore sound preference from localStorage
      const savedPreference = localStorage.getItem("chatBuddy_soundEnabled");
      if (savedPreference !== null) {
        setIsSoundEnabled(savedPreference === "true");
      }

      // Preload common sounds
      const commonSounds = [
        "/sounds/click.mp3",
        "/sounds/typing.mp3",
        "/sounds/message.mp3",
        "/sounds/error.mp3",
      ];
      const newCache: Record<string, HTMLAudioElement> = {};

      commonSounds.forEach((src) => {
        try {
          const audio = new Audio(src);
          audio.preload = "auto";
          newCache[src] = audio;
        } catch (error) {
          console.warn(`Failed to preload sound: ${src}`, error);
        }
      });

      setAudioCache(newCache);
    }
  }, []);

  const toggleSound = () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatBuddy_soundEnabled", newValue.toString());
    }
    // Play a click sound even when turning sound off (last sound before off)
    if (newValue) {
      playSound("/sounds/click.mp3", 0.3);
    }
  };

  const playSound = (src: string, volume = 0.5) => {
    if (!isSoundEnabled || typeof window === "undefined") return;

    try {
      // Ensure path starts with /sounds/ directory
      const soundPath = src.startsWith("/sounds/")
        ? src
        : `/sounds/${src.startsWith("/") ? src.substring(1) : src}`;

      // Use cached audio if available, otherwise create new
      let audio = audioCache[soundPath];

      if (!audio) {
        audio = new Audio(soundPath);
        // Add to cache for future use
        setAudioCache((prev) => ({
          ...prev,
          [soundPath]: audio,
        }));
      }

      // Set volume and play
      audio.volume = volume;

      // Reset playback position if the audio is already playing
      audio.currentTime = 0;

      // Play the sound and handle any errors silently
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Silently handle play() errors (common on some browsers)
          console.warn(`Sound playback error: ${soundPath}`, error);
        });
      }
    } catch (error) {
      // Silently fail if there's an error with the audio
      console.warn(`Failed to play sound: ${src}`, error);
    }
  };

  // Convenience methods for common sounds
  const playClickSound = () => playSound("/sounds/click.mp3", 0.3);
  const playTypingSound = () => playSound("/sounds/typing.mp3", 0.2);
  const playMessageSound = () => playSound("/sounds/message.mp3", 0.4);
  const playErrorSound = () => playSound("/sounds/error.mp3", 0.5);

  const contextValue: SoundContextType = {
    isSoundEnabled,
    toggleSound,
    playSound,
    playClickSound,
    playTypingSound,
    playMessageSound,
    playErrorSound,
  };

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextType {
  const context = useContext(SoundContext);
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
}

// Provider for components that don't need a ThemeProvider
export function useSoundProvider() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const playSound = () => {
    // Empty implementation
  };

  const playClickSound = () => {};
  const playTypingSound = () => {};
  const playMessageSound = () => {};
  const playErrorSound = () => {};

  return {
    isSoundEnabled,
    toggleSound,
    playSound,
    playClickSound,
    playTypingSound,
    playMessageSound,
    playErrorSound,
  };
}
