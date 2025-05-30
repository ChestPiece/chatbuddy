import { Message, ConversationSummary } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import SessionManager from "./sessionManager";

// Keys for localStorage
const HISTORY_KEY = "chatBuddy_history";
const CURRENT_CHAT_KEY = "chatBuddy_currentChat";
const CHAT_SUMMARIES_KEY = "chatBuddy_chatSummaries";

// Maximum number of conversations to store per user
const MAX_STORED_CONVERSATIONS = 10;

export interface StoredConversation {
  id: string;
  userId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title: string;
  summary?: string;
}

/**
 * Manages conversation history across multiple sessions
 */
export const HistoryManager = {
  /**
   * Stores the current conversation in history
   */
  saveCurrentConversation: (messages: Message[]): void => {
    if (typeof window === "undefined" || messages.length === 0) return;

    try {
      const userId = SessionManager.getUserId();

      // Get existing conversation or create new one
      let currentConversation = HistoryManager.getCurrentConversation();

      if (!currentConversation || currentConversation.messages.length === 0) {
        // Create a new conversation
        currentConversation = {
          id: uuidv4(),
          userId,
          messages,
          createdAt: new Date(),
          updatedAt: new Date(),
          title: HistoryManager.generateConversationTitle(messages),
        };
      } else {
        // Update existing conversation
        currentConversation = {
          ...currentConversation,
          messages,
          updatedAt: new Date(),
          title: HistoryManager.generateConversationTitle(messages),
        };
      }

      // Store current conversation
      localStorage.setItem(
        CURRENT_CHAT_KEY,
        JSON.stringify(currentConversation)
      );

      // Update the conversation summaries
      HistoryManager.updateConversationSummary(currentConversation);
    } catch (error) {
      console.error("Failed to save conversation history:", error);
    }
  },

  /**
   * Get the current conversation
   */
  getCurrentConversation: (): StoredConversation | null => {
    if (typeof window === "undefined") return null;

    try {
      const storedConversation = localStorage.getItem(CURRENT_CHAT_KEY);
      if (!storedConversation) return null;

      return JSON.parse(storedConversation, (key, value) => {
        // Parse dates
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error("Failed to get current conversation:", error);
      return null;
    }
  },

  /**
   * Reset the current conversation (start a new one)
   */
  resetCurrentConversation: (): void => {
    if (typeof window === "undefined") return;

    try {
      // Archive the current conversation if it has messages
      const currentConversation = HistoryManager.getCurrentConversation();
      if (currentConversation && currentConversation.messages.length > 0) {
        HistoryManager.archiveConversation(currentConversation);
      }

      // Clear current conversation
      localStorage.removeItem(CURRENT_CHAT_KEY);

      // Force a new session ID
      SessionManager.forceNewSession();
    } catch (error) {
      console.error("Failed to reset conversation:", error);
    }
  },

  /**
   * Archive a conversation to history
   */
  archiveConversation: (conversation: StoredConversation): void => {
    if (typeof window === "undefined") return;

    try {
      const userId = SessionManager.getUserId();

      // Get existing conversations for this user
      let userConversations = HistoryManager.getUserConversations(userId);

      // Add the conversation to history
      userConversations.unshift(conversation);

      // Limit the number of stored conversations
      if (userConversations.length > MAX_STORED_CONVERSATIONS) {
        userConversations = userConversations.slice(
          0,
          MAX_STORED_CONVERSATIONS
        );
      }

      // Store updated conversations
      localStorage.setItem(
        `${HISTORY_KEY}_${userId}`,
        JSON.stringify(userConversations)
      );
    } catch (error) {
      console.error("Failed to archive conversation:", error);
    }
  },

  /**
   * Get all conversations for a user
   */
  getUserConversations: (userId: string): StoredConversation[] => {
    if (typeof window === "undefined") return [];

    try {
      const storedConversations = localStorage.getItem(
        `${HISTORY_KEY}_${userId}`
      );
      if (!storedConversations) return [];

      return JSON.parse(storedConversations, (key, value) => {
        // Parse dates
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error("Failed to get user conversations:", error);
      return [];
    }
  },

  /**
   * Load a specific conversation
   */
  loadConversation: (conversationId: string): StoredConversation | null => {
    if (typeof window === "undefined") return null;

    try {
      const userId = SessionManager.getUserId();
      const userConversations = HistoryManager.getUserConversations(userId);

      const conversation = userConversations.find(
        (c) => c.id === conversationId
      );
      if (!conversation) return null;

      // Set as current conversation
      localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(conversation));

      return conversation;
    } catch (error) {
      console.error("Failed to load conversation:", error);
      return null;
    }
  },

  /**
   * Generate a title for the conversation based on the first few messages
   */
  generateConversationTitle: (messages: Message[]): string => {
    if (!messages.length) return "New Conversation";

    // Use the first user message as the title, truncated
    const firstUserMessage = messages.find((m) => m.role === "user");
    if (firstUserMessage) {
      const content = firstUserMessage.content.trim();
      const maxLength = 30;

      if (content.length <= maxLength) {
        return content;
      }

      return `${content.substring(0, maxLength)}...`;
    }

    // Fallback
    return `Conversation ${new Date().toLocaleString()}`;
  },

  /**
   * Update the conversation summary for quick access
   */
  updateConversationSummary: (conversation: StoredConversation): void => {
    if (typeof window === "undefined") return;

    try {
      const userId = SessionManager.getUserId();

      // Get existing summaries
      let summaries = HistoryManager.getConversationSummaries();

      // Create or update summary
      const summary: ConversationSummary = {
        id: conversation.id,
        userId,
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages.length,
      };

      // Find and update existing summary or add new one
      const existingIndex = summaries.findIndex(
        (s) => s.id === conversation.id
      );
      if (existingIndex >= 0) {
        summaries[existingIndex] = summary;
      } else {
        summaries.unshift(summary);
      }

      // Limit the number of summaries
      if (summaries.length > MAX_STORED_CONVERSATIONS * 2) {
        summaries = summaries.slice(0, MAX_STORED_CONVERSATIONS * 2);
      }

      // Store updated summaries
      localStorage.setItem(CHAT_SUMMARIES_KEY, JSON.stringify(summaries));
    } catch (error) {
      console.error("Failed to update conversation summary:", error);
    }
  },

  /**
   * Get all conversation summaries
   */
  getConversationSummaries: (): ConversationSummary[] => {
    if (typeof window === "undefined") return [];

    try {
      const storedSummaries = localStorage.getItem(CHAT_SUMMARIES_KEY);
      if (!storedSummaries) return [];

      return JSON.parse(storedSummaries, (key, value) => {
        // Parse dates
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error("Failed to get conversation summaries:", error);
      return [];
    }
  },

  /**
   * Get conversation summaries for the current user
   */
  getCurrentUserSummaries: (): ConversationSummary[] => {
    if (typeof window === "undefined") return [];

    const userId = SessionManager.getUserId();
    const allSummaries = HistoryManager.getConversationSummaries();

    return allSummaries.filter((s) => s.userId === userId);
  },

  /**
   * Clear all conversation history for the current user
   */
  clearUserHistory: (): void => {
    if (typeof window === "undefined") return;

    try {
      const userId = SessionManager.getUserId();

      // Remove all user conversations
      localStorage.removeItem(`${HISTORY_KEY}_${userId}`);

      // Remove current conversation
      localStorage.removeItem(CURRENT_CHAT_KEY);

      // Update summaries to remove user conversations
      const allSummaries = HistoryManager.getConversationSummaries();
      const filteredSummaries = allSummaries.filter((s) => s.userId !== userId);
      localStorage.setItem(
        CHAT_SUMMARIES_KEY,
        JSON.stringify(filteredSummaries)
      );

      // Force a new session
      SessionManager.forceNewSession();
    } catch (error) {
      console.error("Failed to clear user history:", error);
    }
  },
};

export default HistoryManager;
