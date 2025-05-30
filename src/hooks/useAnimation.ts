import { useState, useEffect } from "react";

interface AnimationConfig {
  /** Initial state before animation starts */
  initialState?: Record<string, string | number>;
  /** Final state after animation completes */
  finalState?: Record<string, string | number>;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Duration of animation (ms) */
  duration?: number;
  /** Whether animation should autoplay on mount */
  autoPlay?: boolean;
}

/**
 * A custom hook for managing animations
 *
 * @param config - Animation configuration
 * @returns Animation state and control functions
 */
export function useAnimation({
  initialState = {},
  finalState = {},
  delay = 0,
  duration = 300,
  autoPlay = true,
}: AnimationConfig = {}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [animationState, setAnimationState] =
    useState<Record<string, string | number>>(initialState);

  // Function to start the animation
  const playAnimation = () => {
    setIsAnimating(true);
    setAnimationState(initialState);

    // Set a small delay to ensure initial state is applied
    setTimeout(() => {
      setIsVisible(true);

      setTimeout(() => {
        setAnimationState(finalState);

        setTimeout(() => {
          setIsAnimating(false);
        }, duration);
      }, delay);
    }, 10);
  };

  // Function to reset the animation
  const resetAnimation = () => {
    setIsAnimating(false);
    setIsVisible(false);
    setAnimationState(initialState);
  };

  // Auto-play animation on mount if specified
  useEffect(() => {
    if (autoPlay) {
      playAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isAnimating,
    isVisible,
    animationState,
    playAnimation,
    resetAnimation,
    style: {
      ...animationState,
      transition: `all ${duration}ms ease`,
      opacity: isVisible ? 1 : 0,
    },
  };
}
