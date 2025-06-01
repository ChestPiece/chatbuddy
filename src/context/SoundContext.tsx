"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";

interface SoundContextType {
  isSoundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  adjustVolume: (newVolume: number) => void;
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
  const [volume, setVolume] = useState(0.5);
  const [audioCache, setAudioCache] = useState<
    Record<string, HTMLAudioElement>
  >({});

  // Add throttling for typing sound
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimestamps = useRef<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Restore sound preference from localStorage
      const savedPreference = localStorage.getItem("chatBuddy_soundEnabled");
      if (savedPreference !== null) {
        setIsSoundEnabled(savedPreference === "true");
      }

      // Restore volume preference from localStorage
      const savedVolume = localStorage.getItem("chatBuddy_volume");
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }

      // Preload common sounds
      const commonSounds = [
        "/click.mp3",
        "/send.mp3",
        "/receive.mp3",
        "/error.mp3",
        "/typing.mp3",
      ];
      const newCache: Record<string, HTMLAudioElement> = {};

      commonSounds.forEach((src) => {
        try {
          const audio = new Audio(src);
          audio.preload = "auto";
          newCache[src] = audio;
          console.log(`Preloaded sound: ${src}`);
        } catch (error) {
          console.warn(`Failed to preload sound: ${src}`, error);
        }
      });

      setAudioCache(newCache);
    }

    // Clean up any timeouts on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const toggleSound = () => {
    const newValue = !isSoundEnabled;
    setIsSoundEnabled(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatBuddy_soundEnabled", newValue.toString());
    }
    // Play a click sound even when turning sound off (last sound before off)
    if (newValue) {
      playDirectSound("/click.mp3", volume * 0.6);
    }
  };

  const adjustVolume = (newVolume: number) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (typeof window !== "undefined") {
      localStorage.setItem("chatBuddy_volume", clampedVolume.toString());
    }

    // Play a soft click for feedback if sound is enabled
    if (isSoundEnabled) {
      playDirectSound("/click.mp3", clampedVolume * 0.3);
    }
  };

  // Helper function to play sounds directly without checking isSoundEnabled
  // Used for playing the toggle sound when enabling sound
  const playDirectSound = (src: string, specificVolume?: number) => {
    if (typeof window === "undefined") return;

    try {
      // Use the path as provided
      const soundPath = src;

      // Use cached audio if available, otherwise create new
      let audio = audioCache[soundPath];

      if (!audio) {
        audio = new Audio(soundPath);
      }

      // Set volume and play
      audio.volume = specificVolume !== undefined ? specificVolume : volume;
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`Sound playback error: ${soundPath}`, error);
      });
    } catch (error) {
      console.warn(`Failed to play sound: ${src}`, error);
    }
  };

  // Add throttling to prevent sound playback overload
  const shouldThrottle = (soundPath: string, minDelayMs = 50): boolean => {
    const now = Date.now();
    const lastPlayed = lastSoundTimestamps.current[soundPath] || 0;

    if (now - lastPlayed < minDelayMs) {
      return true; // Throttle this sound
    }

    // Update the timestamp and allow playing
    lastSoundTimestamps.current[soundPath] = now;
    return false;
  };

  const playSound = (src: string, specificVolume?: number) => {
    if (!isSoundEnabled || typeof window === "undefined") return;

    // Don't play sounds too rapidly
    if (shouldThrottle(src)) return;

    try {
      // Use the path as provided
      const soundPath = src;

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
      audio.volume = specificVolume !== undefined ? specificVolume : volume;

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
  const playClickSound = () => playSound("/click.mp3", volume * 0.6);

  // Enhanced typing sound with randomized volume
  const playTypingSound = () => {
    if (!isSoundEnabled || typeof window === "undefined") return;

    // Don't allow too many typing sounds to play at once
    if (typingTimeoutRef.current) return;

    try {
      const variableVolume = volume * (0.7 + Math.random() * 0.2); // Randomize between 70-90% of master volume
      // Create a new audio element specifically for typing sound
      const typingSound = new Audio("/typing.mp3");
      typingSound.volume = variableVolume;
      typingSound.play().catch((err) => {
        console.warn("Error playing typing sound:", err);
      });

      // Set a short throttle to prevent too many simultaneous sounds
      typingTimeoutRef.current = setTimeout(() => {
        typingTimeoutRef.current = null;
      }, 30);
    } catch (error) {
      console.warn("Failed to play typing sound:", error);
    }
  };

  const playMessageSound = () => playSound("/receive.mp3", volume * 0.8);
  const playErrorSound = () => playSound("/error.mp3", volume);

  const contextValue: SoundContextType = {
    isSoundEnabled,
    volume,
    toggleSound,
    adjustVolume,
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
  const [volume, setVolume] = useState(0.5);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const adjustVolume = (newVolume: number) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
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
    volume,
    toggleSound,
    adjustVolume,
    playSound,
    playClickSound,
    playTypingSound,
    playMessageSound,
    playErrorSound,
  };
}
