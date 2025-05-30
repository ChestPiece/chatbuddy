/**
 * Database abstraction layer
 *
 * This file provides a unified interface for data storage operations,
 * automatically using Supabase when configured or falling back to localStorage
 */

import { Message, ConversationContext } from "@/types/chat";
import { supabase, isSupabaseConfigured } from "./supabase";
import { StoredConversation } from "./historyManager";

// Table names
const MESSAGES_TABLE = "chat_messages";
const CONTEXT_TABLE = "conversation_contexts";
const CONVERSATION_TABLE = "conversations";

// LocalStorage keys
const LS_PREFIX = "chatBuddy_";
const MESSAGES_KEY = `${LS_PREFIX}messages`;
const CONTEXT_KEY = `${LS_PREFIX}context`;
const HISTORY_KEY = `${LS_PREFIX}history`;

// Helper to check if we're in a browser environment
const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
};

// Type for database message storage format
interface DbMessage {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: string;
  sequence: number;
  context_id?: string | null;
  references_message_ids?: string[] | null;
}

/**
 * Convert Message objects for database storage
 */
const formatMessagesForStorage = (
  messages: Message[],
  sid: string
): DbMessage[] => {
  return messages.map((msg, index) => ({
    id: msg.id,
    session_id: sid,
    role: msg.role,
    content: msg.content,
    created_at: msg.createdAt.toISOString(),
    sequence: index,
    context_id: msg.contextId || null,
    references_message_ids: msg.referencesMessageIds || null,
  }));
};

/**
 * Convert database messages to Message objects
 */
const formatMessagesFromStorage = (data: DbMessage[]): Message[] => {
  return data.map((item) => ({
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: new Date(item.created_at),
    contextId: item.context_id || undefined,
    referencesMessageIds: item.references_message_ids || undefined,
  }));
};

/**
 * Parse Date objects when reading from localStorage
 */
const parseWithDates = <T>(text: string): T => {
  return JSON.parse(text, (key, value) => {
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
    ) {
      return new Date(value);
    }
    return value;
  });
};

/**
 * Database operations
 */
const Database = {
  /**
   * Save messages to storage
   */
  saveMessages: async (messages: Message[]): Promise<void> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();

    if (isSupabaseConfigured()) {
      try {
        // Delete existing messages for this session
        await supabase.from(MESSAGES_TABLE).delete().eq("session_id", sid);

        if (messages.length === 0) return;

        // Insert new messages
        const formattedMessages = formatMessagesForStorage(messages, sid);
        const { error } = await supabase
          .from(MESSAGES_TABLE)
          .insert(formattedMessages);

        if (error) throw error;
      } catch (error) {
        console.error("Failed to save messages to Supabase:", error);
        // Fall back to localStorage on error
        try {
          if (isBrowser()) {
            localStorage.setItem(
              `${MESSAGES_KEY}_${sid}`,
              JSON.stringify(messages, (key, value) => {
                // Handle Date objects
                if (value instanceof Date) {
                  return value.toISOString();
                }
                return value;
              })
            );
          }
        } catch (localError) {
          console.error("Failed to save messages to localStorage:", localError);
        }
      }
    } else {
      // Use localStorage - make sure we stringify with proper date handling
      try {
        const messagesJson = JSON.stringify(messages, (key, value) => {
          // Handle Date objects
          if (value instanceof Date) {
            return value.toISOString();
          }
          return value;
        });

        if (isBrowser()) {
          localStorage.setItem(`${MESSAGES_KEY}_${sid}`, messagesJson);
          // Also save to a backup key in case the session changes
          localStorage.setItem(MESSAGES_KEY, messagesJson);
        }
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
      }
    }
  },

  /**
   * Load messages from storage
   */
  loadMessages: async (): Promise<Message[]> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from(MESSAGES_TABLE)
          .select("*")
          .eq("session_id", sid)
          .order("sequence", { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) return [];

        return formatMessagesFromStorage(data as DbMessage[]);
      } catch (error) {
        console.error("Failed to load messages from Supabase:", error);

        // Fall back to localStorage
        return Database.loadMessagesFromLocalStorage(sid);
      }
    } else {
      // Use localStorage
      return Database.loadMessagesFromLocalStorage(sid);
    }
  },

  /**
   * Helper function to load messages from localStorage
   */
  loadMessagesFromLocalStorage: (sessionId: string): Message[] => {
    try {
      if (!isBrowser()) return [];

      // First try to load using the session-specific key
      let storedMessages = localStorage.getItem(`${MESSAGES_KEY}_${sessionId}`);

      // If no messages for this session, try the backup key
      if (!storedMessages) {
        storedMessages = localStorage.getItem(MESSAGES_KEY);
      }

      if (!storedMessages) return [];

      return parseWithDates(storedMessages);
    } catch (error) {
      console.error("Failed to load messages from localStorage:", error);
      return [];
    }
  },

  /**
   * Clear messages from storage
   */
  clearMessages: async (): Promise<void> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from(MESSAGES_TABLE)
          .delete()
          .eq("session_id", sid);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to clear messages from Supabase:", error);
        if (isBrowser()) {
          localStorage.removeItem(`${MESSAGES_KEY}_${sid}`);
        }
      }
    } else if (isBrowser()) {
      localStorage.removeItem(`${MESSAGES_KEY}_${sid}`);
    }
  },

  /**
   * Save conversation context
   */
  saveContext: async (context: ConversationContext): Promise<void> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();

    if (isSupabaseConfigured()) {
      try {
        const formattedContext = {
          session_id: sid,
          topic: context.topic || null,
          start_time: context.startTime.toISOString(),
          last_update_time: context.lastUpdateTime.toISOString(),
          message_count: context.messageCount,
          detected_entities: context.detectedEntities || null,
        };

        const { error } = await supabase
          .from(CONTEXT_TABLE)
          .upsert(formattedContext, { onConflict: "session_id" });

        if (error) throw error;
      } catch (error) {
        console.error("Failed to save context to Supabase:", error);
        if (isBrowser()) {
          localStorage.setItem(
            `${CONTEXT_KEY}_${sid}`,
            JSON.stringify(context)
          );
        }
      }
    } else if (isBrowser()) {
      localStorage.setItem(`${CONTEXT_KEY}_${sid}`, JSON.stringify(context));
    }
  },

  /**
   * Load conversation context
   */
  loadContext: async (): Promise<ConversationContext | null> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();
    const defaultContext: ConversationContext = {
      startTime: new Date(),
      lastUpdateTime: new Date(),
      messageCount: 0,
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from(CONTEXT_TABLE)
          .select("*")
          .eq("session_id", sid)
          .single();

        if (error) {
          // Not found is expected for new sessions
          if (error.code === "PGRST116") {
            return defaultContext;
          }
          throw error;
        }

        if (!data) return defaultContext;

        return {
          topic: data.topic || undefined,
          startTime: new Date(data.start_time),
          lastUpdateTime: new Date(data.last_update_time),
          messageCount: data.message_count,
          detectedEntities: data.detected_entities || undefined,
        };
      } catch (error) {
        console.error("Failed to load context from Supabase:", error);

        // Fall back to localStorage
        if (isBrowser()) {
          const storedContext = localStorage.getItem(`${CONTEXT_KEY}_${sid}`);
          if (!storedContext) return defaultContext;
          return parseWithDates(storedContext);
        }
        return defaultContext;
      }
    } else {
      if (isBrowser()) {
        const storedContext = localStorage.getItem(`${CONTEXT_KEY}_${sid}`);
        if (!storedContext) return defaultContext;
        return parseWithDates(storedContext);
      }
      return defaultContext;
    }
  },

  /**
   * Clear conversation context
   */
  clearContext: async (): Promise<void> => {
    // Import dynamically to avoid circular dependencies
    const { default: SessionManager } = await import("./sessionManager");
    const sid = SessionManager.getSessionId();

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from(CONTEXT_TABLE)
          .delete()
          .eq("session_id", sid);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to clear context from Supabase:", error);
        if (isBrowser()) {
          localStorage.removeItem(`${CONTEXT_KEY}_${sid}`);
        }
      }
    } else if (isBrowser()) {
      localStorage.removeItem(`${CONTEXT_KEY}_${sid}`);
    }
  },

  /**
   * Save conversation history
   */
  saveConversation: async (conversation: StoredConversation): Promise<void> => {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from(CONVERSATION_TABLE).upsert({
          id: conversation.id,
          user_id: conversation.userId,
          title: conversation.title,
          created_at: conversation.createdAt.toISOString(),
          updated_at: conversation.updatedAt.toISOString(),
          summary: conversation.summary || null,
        });

        if (error) throw error;

        // Also save the messages separately
        if (conversation.messages.length > 0) {
          const formattedMessages = formatMessagesForStorage(
            conversation.messages,
            conversation.id
          );

          await supabase.from(MESSAGES_TABLE).insert(formattedMessages);
        }
      } else if (isBrowser()) {
        // Store in localStorage
        const userId = conversation.userId;
        const conversationKey = `${HISTORY_KEY}_${userId}`;

        try {
          // Get existing conversations
          const storedConversations = localStorage.getItem(conversationKey);
          const conversations = storedConversations
            ? parseWithDates<StoredConversation[]>(storedConversations)
            : [];

          // Check if conversation already exists
          const existingIndex = conversations.findIndex(
            (c) => c.id === conversation.id
          );

          if (existingIndex >= 0) {
            conversations[existingIndex] = conversation;
          } else {
            conversations.unshift(conversation);
          }

          // Limit to 50 conversations to prevent localStorage from growing too large
          const limitedConversations = conversations.slice(0, 50);

          // Serialize with proper date handling
          const conversationsJson = JSON.stringify(
            limitedConversations,
            (key, value) => {
              if (value instanceof Date) {
                return value.toISOString();
              }
              return value;
            }
          );

          localStorage.setItem(conversationKey, conversationsJson);

          // Also update the conversation history
          const { default: SessionManager } = await import("./sessionManager");
          SessionManager.addConversationToHistory(
            conversation.id,
            conversation.title
          );
        } catch (localError) {
          console.error(
            "Failed to save conversation to localStorage:",
            localError
          );
        }
      }
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  },

  /**
   * Get all conversations for a user
   */
  getUserConversations: async (
    userId: string
  ): Promise<StoredConversation[]> => {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from(CONVERSATION_TABLE)
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        if (!data) return [];

        // Convert to StoredConversation format (without messages for efficiency)
        return data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          summary: item.summary || undefined,
          messages: [], // Messages are loaded separately when needed
        }));
      } else {
        // Collect conversations from multiple sources for reliability
        const conversations: StoredConversation[] = [];

        if (isBrowser()) {
          try {
            // First, try to get from localStorage
            const storedConversations = localStorage.getItem(
              `${HISTORY_KEY}_${userId}`
            );

            if (storedConversations) {
              const parsed =
                parseWithDates<StoredConversation[]>(storedConversations);
              conversations.push(...parsed);
            }
          } catch (error) {
            console.error("Error reading stored conversations:", error);
          }
        }

        try {
          // Then, use the session manager's history for additional entries
          const { default: SessionManager } = await import("./sessionManager");
          const conversationHistory = SessionManager.getConversationHistory();

          // Convert to StoredConversation format and add them
          const historyConversations = conversationHistory.map((c) => ({
            id: c.id,
            userId: userId,
            title: c.title || "Untitled",
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            messages: [], // Will be loaded separately
          }));

          conversations.push(...historyConversations);
        } catch (error) {
          console.error("Error reading conversation history:", error);
        }

        // Deduplicate by ID and sort by most recent update
        const uniqueConversations = Array.from(
          new Map(conversations.map((item) => [item.id, item])).values()
        ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

        return uniqueConversations;
      }
    } catch (error) {
      console.error("Failed to get user conversations:", error);
      return [];
    }
  },

  /**
   * Load conversation by ID
   */
  loadConversation: async (
    conversationId: string
  ): Promise<StoredConversation | null> => {
    try {
      if (isSupabaseConfigured()) {
        // Get the conversation metadata
        const { data: conversationData, error: conversationError } =
          await supabase
            .from(CONVERSATION_TABLE)
            .select("*")
            .eq("id", conversationId)
            .single();

        if (conversationError) throw conversationError;
        if (!conversationData) return null;

        // Get the messages for this conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from(MESSAGES_TABLE)
          .select("*")
          .eq("session_id", conversationId)
          .order("sequence", { ascending: true });

        if (messagesError) throw messagesError;

        return {
          id: conversationData.id,
          userId: conversationData.user_id,
          title: conversationData.title,
          createdAt: new Date(conversationData.created_at),
          updatedAt: new Date(conversationData.updated_at),
          summary: conversationData.summary || undefined,
          messages: messagesData
            ? formatMessagesFromStorage(messagesData as DbMessage[])
            : [],
        };
      } else if (isBrowser()) {
        // Try to find in localStorage
        // For simplicity, we'll check all user histories
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith(HISTORY_KEY)
        );

        for (const key of keys) {
          const storedConversations = localStorage.getItem(key);
          if (!storedConversations) continue;

          const conversations =
            parseWithDates<StoredConversation[]>(storedConversations);
          const conversation = conversations.find(
            (c) => c.id === conversationId
          );

          if (conversation) return conversation;
        }
      }

      // Try to use the session manager as fallback
      try {
        const { default: SessionManager } = await import("./sessionManager");
        const history = SessionManager.getConversationHistory();
        const foundConversation = history.find((c) => c.id === conversationId);

        if (foundConversation) {
          return {
            id: foundConversation.id,
            userId: "anonymous",
            title: foundConversation.title || "Untitled",
            createdAt: new Date(foundConversation.createdAt),
            updatedAt: new Date(foundConversation.updatedAt),
            messages: [], // Empty messages as we don't have them in history
          };
        }
      } catch (error) {
        console.error("Error getting conversation from history:", error);
      }

      return null;
    } catch (error) {
      console.error("Failed to load conversation:", error);
      return null;
    }
  },

  /**
   * Delete a conversation
   */
  deleteConversation: async (conversationId: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured()) {
        // Delete the conversation
        const { error: conversationError } = await supabase
          .from(CONVERSATION_TABLE)
          .delete()
          .eq("id", conversationId);

        if (conversationError) throw conversationError;

        // Delete associated messages
        await supabase
          .from(MESSAGES_TABLE)
          .delete()
          .eq("session_id", conversationId);

        return true;
      } else if (isBrowser()) {
        // Delete from localStorage
        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith(HISTORY_KEY)
        );

        for (const key of keys) {
          const storedConversations = localStorage.getItem(key);
          if (!storedConversations) continue;

          const conversations =
            parseWithDates<StoredConversation[]>(storedConversations);
          const updatedConversations = conversations.filter(
            (c) => c.id !== conversationId
          );

          if (conversations.length !== updatedConversations.length) {
            localStorage.setItem(key, JSON.stringify(updatedConversations));
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      return false;
    }
  },
};

export default Database;
