import { useState, useEffect, useCallback } from "react";

interface UseTypingEffectOptions {
  text: string;
  typingSpeed?: number;
  startDelay?: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTypingEffect({
  text,
  typingSpeed = 50,
  startDelay = 0,
  onComplete,
  autoStart = true,
}: UseTypingEffectOptions) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(autoStart);
  const [isComplete, setIsComplete] = useState(false);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    setCurrentIndex(0);
    setDisplayedText("");
    setIsComplete(false);
  }, []);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
  }, []);

  const completeTyping = useCallback(() => {
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsTyping(false);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      if (currentIndex === 0 && startDelay > 0) {
        // Initial delay before typing begins
        timeoutId = setTimeout(() => {
          setCurrentIndex(1);
          setDisplayedText(text.substring(0, 1));
        }, startDelay);
      } else if (currentIndex < text.length) {
        // Regular typing
        timeoutId = setTimeout(() => {
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setDisplayedText(text.substring(0, currentIndex + 1));
        }, typingSpeed);
      } else if (currentIndex === text.length) {
        // Typing completed
        setIsTyping(false);
        setIsComplete(true);
        onComplete?.();
      }
    }

    return () => clearTimeout(timeoutId);
  }, [currentIndex, isTyping, text, typingSpeed, startDelay, onComplete]);

  // Reset the typing effect if the text changes
  useEffect(() => {
    if (autoStart) {
      startTyping();
    } else {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsComplete(false);
    }
  }, [text, autoStart, startTyping]);

  return {
    displayedText,
    isTyping,
    isComplete,
    progress: text.length > 0 ? currentIndex / text.length : 0,
    startTyping,
    stopTyping,
    completeTyping,
  };
}
