import { Message, ConversationContext } from "@/types/chat";
import {
  supabase,
  isSupabaseConfigured,
  handleSupabaseError,
} from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Fallback to local storage if Supabase is not configured
import {
  saveMessages as saveMessagesToLocal,
  loadMessages as loadMessagesFromLocal,
  clearMessages as clearMessagesFromLocal,
} from "./chatPersistence";

// Define the database tables
const MESSAGES_TABLE = "chat_messages";
const CONTEXT_TABLE = "conversation_contexts";

// Session identifier to group messages (simulating user authentication)
let sessionId: string | null = null;

/**
 * Get or create a session ID for the current user
 */
const getSessionId = (): string => {
  if (!sessionId) {
    // Try to get session from localStorage
    if (typeof window !== "undefined") {
      sessionId = localStorage.getItem("chatSessionId");

      // If no session exists, create a new one
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("chatSessionId", sessionId);
      }
    } else {
      // Fallback for server-side
      sessionId = uuidv4();
    }
  }

  return sessionId;
};

/**
 * Save chat messages to Supabase
 */
export const saveMessages = async (messages: Message[]): Promise<void> => {
  // If Supabase is not configured, fall back to localStorage
  if (!isSupabaseConfigured()) {
    saveMessagesToLocal(messages);
    return;
  }

  try {
    const sid = getSessionId();

    // First, delete all existing messages for this session
    // This simplifies the update process (delete and re-insert pattern)
    await supabase.from(MESSAGES_TABLE).delete().eq("session_id", sid);

    // If there are no messages, we're done
    if (messages.length === 0) return;

    // Format messages for insertion
    const formattedMessages = messages.map((msg, index) => ({
      id: msg.id,
      session_id: sid,
      role: msg.role,
      content: msg.content,
      created_at: msg.createdAt.toISOString(),
      sequence: index, // Keep track of message order
      context_id: msg.contextId || null,
      references_message_ids: msg.referencesMessageIds || null,
    }));

    // Insert all messages
    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .insert(formattedMessages);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "save messages");
    // Fall back to local storage on error
    saveMessagesToLocal(messages);
  }
};

/**
 * Load chat messages from Supabase
 */
export const loadMessages = async (): Promise<Message[]> => {
  // If Supabase is not configured, fall back to localStorage
  if (!isSupabaseConfigured()) {
    return loadMessagesFromLocal();
  }

  try {
    const sid = getSessionId();

    // Get all messages for this session, ordered by sequence
    const { data, error } = await supabase
      .from(MESSAGES_TABLE)
      .select("*")
      .eq("session_id", sid)
      .order("sequence", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return [];
    }

    // Convert database format back to Message objects
    return data.map((item) => ({
      id: item.id,
      role: item.role,
      content: item.content,
      createdAt: new Date(item.created_at),
      contextId: item.context_id,
      referencesMessageIds: item.references_message_ids,
    }));
  } catch (error) {
    handleSupabaseError(error, "load messages");
    // Fall back to local storage on error
    return loadMessagesFromLocal();
  }
};

/**
 * Clear chat messages from Supabase
 */
export const clearMessages = async (): Promise<void> => {
  // If Supabase is not configured, fall back to localStorage
  if (!isSupabaseConfigured()) {
    clearMessagesFromLocal();
    return;
  }

  try {
    const sid = getSessionId();

    // Delete all messages for this session
    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .delete()
      .eq("session_id", sid);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "clear messages");
    // Fall back to local storage on error
    clearMessagesFromLocal();
  }
};

/**
 * Save conversation context to Supabase
 */
export const saveContext = async (
  context: ConversationContext
): Promise<void> => {
  if (!isSupabaseConfigured()) {
    // For local storage, just use the regular localStorage API
    try {
      localStorage.setItem("conversationContext", JSON.stringify(context));
    } catch (error) {
      console.error(
        "Failed to save conversation context to localStorage:",
        error
      );
    }
    return;
  }

  try {
    const sid = getSessionId();

    // Format context for insertion
    const formattedContext = {
      session_id: sid,
      topic: context.topic || null,
      start_time: context.startTime.toISOString(),
      last_update_time: context.lastUpdateTime.toISOString(),
      message_count: context.messageCount,
      detected_entities: context.detectedEntities || null,
    };

    // Upsert the context (insert if not exists, update if exists)
    const { error } = await supabase
      .from(CONTEXT_TABLE)
      .upsert(formattedContext, { onConflict: "session_id" });

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "save context");
    // Fallback to localStorage
    try {
      localStorage.setItem("conversationContext", JSON.stringify(context));
    } catch (localError) {
      console.error(
        "Failed to save conversation context to localStorage:",
        localError
      );
    }
  }
};

/**
 * Load conversation context from Supabase
 */
export const loadContext = async (): Promise<ConversationContext> => {
  // Default context to return if nothing is found
  const defaultContext: ConversationContext = {
    startTime: new Date(),
    lastUpdateTime: new Date(),
    messageCount: 0,
  };

  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    try {
      const storedContext = localStorage.getItem("conversationContext");
      if (!storedContext) return defaultContext;

      // Parse dates properly
      return JSON.parse(storedContext, (key, value) => {
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error(
        "Failed to load conversation context from localStorage:",
        error
      );
      return defaultContext;
    }
  }

  try {
    const sid = getSessionId();

    // Get the context for this session
    const { data, error } = await supabase
      .from(CONTEXT_TABLE)
      .select("*")
      .eq("session_id", sid)
      .single();

    if (error) {
      // If no context is found, that's expected for new conversations
      if (error.code === "PGRST116") {
        return defaultContext;
      }
      throw error;
    }

    if (!data) return defaultContext;

    // Convert database format back to ConversationContext
    return {
      topic: data.topic || undefined,
      startTime: new Date(data.start_time),
      lastUpdateTime: new Date(data.last_update_time),
      messageCount: data.message_count,
      detectedEntities: data.detected_entities || undefined,
    };
  } catch (error) {
    handleSupabaseError(error, "load context");
    // Fallback to localStorage
    try {
      const storedContext = localStorage.getItem("conversationContext");
      if (!storedContext) return defaultContext;

      return JSON.parse(storedContext, (key, value) => {
        if (
          typeof value === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)
        ) {
          return new Date(value);
        }
        return value;
      });
    } catch (localError) {
      console.error(
        "Failed to load conversation context from localStorage:",
        localError
      );
      return defaultContext;
    }
  }
};

/**
 * Clear conversation context from Supabase
 */
export const clearContext = async (): Promise<void> => {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    try {
      localStorage.removeItem("conversationContext");
    } catch (error) {
      console.error(
        "Failed to clear conversation context from localStorage:",
        error
      );
    }
    return;
  }

  try {
    const sid = getSessionId();

    // Delete the context for this session
    const { error } = await supabase
      .from(CONTEXT_TABLE)
      .delete()
      .eq("session_id", sid);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "clear context");
    // Fallback to localStorage
    try {
      localStorage.removeItem("conversationContext");
    } catch (localError) {
      console.error(
        "Failed to clear conversation context from localStorage:",
        localError
      );
    }
  }
};
