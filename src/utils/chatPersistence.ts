import { Message } from "@/types/chat";

const STORAGE_KEY = "chatHistory";

// Helper function to safely parse dates when deserializing from localStorage
const reviver = (key: string, value: unknown): unknown => {
  // Check if the value is a date string (ISO format)
  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
  ) {
    return new Date(value);
  }
  return value;
};

/**
 * Save chat messages to localStorage
 */
export const saveMessages = (messages: Message[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

/**
 * Load chat messages from localStorage
 */
export const loadMessages = (): Message[] => {
  try {
    const storedMessages = localStorage.getItem(STORAGE_KEY);
    if (!storedMessages) {
      return [];
    }
    return JSON.parse(storedMessages, reviver);
  } catch (error) {
    console.error("Failed to load chat history:", error);
    return [];
  }
};

/**
 * Clear chat messages from localStorage
 */
export const clearMessages = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
};
