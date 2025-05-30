import { v4 as uuidv4 } from "uuid";

// Keys for localStorage
const SESSION_ID_KEY = "chatBuddy_sessionId";
const LAST_VISIT_KEY = "chatBuddy_lastVisit";
const APP_VERSION_KEY = "chatBuddy_appVersion";
const CONVERSATIONS_KEY = "chatBuddy_conversations";

// The current app version - increment this when making significant changes
const CURRENT_APP_VERSION = "1.0.0";

// Timeout in milliseconds to consider a user as "new session" (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

// Helper to check if we're in a browser environment
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
};

// Define conversation history item type
interface ConversationHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Session management utilities
 */
const SessionManager = {
  /**
   * Get the current session ID or create a new one
   */
  getSessionId: (): string => {
    if (!isBrowser()) {
      return uuidv4();
    }

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      localStorage.setItem(SESSION_ID_KEY, sessionId);

      // Also add to conversation list
      SessionManager.addConversationToHistory(sessionId, "New Chat");
    }
    return sessionId;
  },

  /**
   * Create a new session ID
   */
  setSessionId: (id: string): void => {
    if (isBrowser()) {
      localStorage.setItem(SESSION_ID_KEY, id);
    }
  },

  /**
   * Force a new session
   */
  forceNewSession: (): string => {
    const newId = uuidv4();
    if (isBrowser()) {
      localStorage.setItem(SESSION_ID_KEY, newId);

      // Add to conversation history
      SessionManager.addConversationToHistory(newId, "New Chat");
    }
    return newId;
  },

  /**
   * Add a conversation to history tracking
   */
  addConversationToHistory: (conversationId: string, title: string): void => {
    if (!isBrowser()) return;

    try {
      // Get existing conversation list
      const conversationsJson = localStorage.getItem(CONVERSATIONS_KEY) || "[]";
      const conversations = JSON.parse(
        conversationsJson
      ) as ConversationHistoryItem[];

      // Add new conversation if not already in list
      if (!conversations.some((c) => c.id === conversationId)) {
        conversations.unshift({
          id: conversationId,
          title: title || "New Chat",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Keep only the most recent 20 conversations
        const trimmedConversations = conversations.slice(0, 20);

        // Save back to localStorage
        localStorage.setItem(
          CONVERSATIONS_KEY,
          JSON.stringify(trimmedConversations)
        );
      }
    } catch (error) {
      console.error("Error adding conversation to history:", error);
    }
  },

  /**
   * Get all conversation IDs in history
   */
  getConversationHistory: (): ConversationHistoryItem[] => {
    if (!isBrowser()) return [];

    try {
      const conversationsJson = localStorage.getItem(CONVERSATIONS_KEY) || "[]";
      return JSON.parse(conversationsJson) as ConversationHistoryItem[];
    } catch (error) {
      console.error("Error getting conversation history:", error);
      return [];
    }
  },

  /**
   * Check if a new session should be started
   */
  shouldStartNewSession: (): boolean => {
    if (!isBrowser()) return true;

    // Get the last active timestamp
    const lastActiveTime = localStorage.getItem("chatBuddy_lastActiveTime");

    if (!lastActiveTime) {
      // No last active time - this is a new session
      return true;
    }

    const lastActiveDate = new Date(lastActiveTime);
    const now = new Date();

    // If it's been more than 24 hours, start a new session
    const hoursSinceLastActive =
      (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastActive > 24;
  },

  /**
   * Update the last active time
   */
  updateLastActiveTime: (): void => {
    if (!isBrowser()) return;
    localStorage.setItem("chatBuddy_lastActiveTime", new Date().toISOString());
  },

  /**
   * Get the current user ID or create a new anonymous one
   */
  getUserId: (): string => {
    if (!isBrowser()) {
      // Server side - return a placeholder
      return "anonymous";
    }

    let userId = localStorage.getItem("chatBuddy_userId");
    if (!userId) {
      userId = `anon-${uuidv4().substring(0, 8)}`;
      localStorage.setItem("chatBuddy_userId", userId);
    }

    return userId;
  },

  /**
   * Update the last visit timestamp
   */
  updateLastVisit: (): void => {
    if (!isBrowser()) return;
    localStorage.setItem(LAST_VISIT_KEY, Date.now().toString());
  },

  /**
   * Check if we should start a new session based on:
   * 1. App version change
   * 2. Session timeout
   * 3. No previous session
   */
  shouldStartNewSessionBasedOnApp: (): boolean => {
    if (!isBrowser()) return true;

    // Check app version - if different, start new session
    const storedAppVersion = localStorage.getItem(APP_VERSION_KEY);
    if (storedAppVersion !== CURRENT_APP_VERSION) {
      return true;
    }

    // Check if this is the first session
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      return true;
    }

    // Check if session has timed out
    const lastVisitStr = localStorage.getItem(LAST_VISIT_KEY);
    if (!lastVisitStr) {
      return true;
    }

    const lastVisit = parseInt(lastVisitStr, 10);
    const now = Date.now();

    // If last visit was more than SESSION_TIMEOUT ago, start a new session
    return now - lastVisit > SESSION_TIMEOUT;
  },

  /**
   * Clear session data but keep user ID
   */
  clearSessionData: (): void => {
    if (!isBrowser()) return;

    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(LAST_VISIT_KEY);
  },
};

export default SessionManager;
