import { useRef, useEffect, RefObject, useCallback } from "react";

interface UseFocusOptions<T extends HTMLElement> {
  ref?: RefObject<T>;
  focusOnMount?: boolean;
  focusOnUpdate?: boolean;
  dependencies?: unknown[];
  delay?: number;
  attemptCount?: number; // Number of retry attempts
}

/**
 * A custom hook for managing focus on elements
 *
 * @param options - Configuration options
 * @returns A ref to attach to the element you want to focus
 */
export function useFocus<T extends HTMLElement>({
  ref: externalRef,
  focusOnMount = false,
  focusOnUpdate = false,
  dependencies = [],
  delay = 0,
  attemptCount = 3, // Default to 3 retry attempts
}: UseFocusOptions<T>): RefObject<T> {
  const internalRef = useRef<T>(null);

  // Use the external ref if provided, otherwise use the internal one
  const ref = externalRef || internalRef;

  // Helper function to focus with retry mechanism, wrapped in useCallback
  const focusWithRetry = useCallback(
    (attempts: number, interval: number) => {
      // Focus immediately first
      if (ref.current) {
        try {
          ref.current.focus();
          return; // Success, no need for retries
        } catch {
          console.warn("Focus attempt failed, will retry");
        }
      }

      // Set up retry attempts if initial focus fails
      let attemptsMade = 0;

      const attemptFocus = () => {
        if (attemptsMade >= attempts) return;

        if (ref.current) {
          try {
            ref.current.focus();
            attemptsMade = attempts; // Stop retrying on success
          } catch {
            attemptsMade++;

            if (attemptsMade < attempts) {
              setTimeout(attemptFocus, interval);
            }
          }
        } else {
          attemptsMade++;

          if (attemptsMade < attempts) {
            setTimeout(attemptFocus, interval);
          }
        }
      };

      // Start retry process
      setTimeout(attemptFocus, interval);
    },
    [ref]
  );

  // Focus on mount
  useEffect(() => {
    if (focusOnMount) {
      const timeoutId = setTimeout(() => {
        focusWithRetry(attemptCount, 50); // Retry every 50ms
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [focusOnMount, delay, attemptCount, focusWithRetry]);

  // Focus on dependencies update
  useEffect(() => {
    if (focusOnUpdate) {
      const timeoutId = setTimeout(() => {
        focusWithRetry(attemptCount, 50); // Retry every 50ms
      }, delay);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, focusOnUpdate, delay, attemptCount, focusWithRetry]);

  return ref;
}
