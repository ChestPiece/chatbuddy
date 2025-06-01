import { Message, ConversationContext } from "@/types/chat";
import { supabase, handleSupabaseError } from "./supabase";
import { v4 as uuidv4 } from "uuid";

// Define the database tables
const MESSAGES_TABLE = "chat_messages";
const CONTEXT_TABLE = "conversation_contexts";

// Session identifier to group messages
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
  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

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
    console.error("Failed to save messages to database:", error);
  }
};

/**
 * Load chat messages from Supabase
 */
export const loadMessages = async (): Promise<Message[]> => {
  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

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
    console.error("Failed to load messages from database:", error);
    return [];
  }
};

/**
 * Clear chat messages from Supabase
 */
export const clearMessages = async (): Promise<void> => {
  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

    // Delete all messages for this session
    const { error } = await supabase
      .from(MESSAGES_TABLE)
      .delete()
      .eq("session_id", sid);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "clear messages");
    console.error("Failed to clear messages from database:", error);
  }
};

/**
 * Save conversation context to Supabase
 */
export const saveContext = async (
  context: ConversationContext
): Promise<void> => {
  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

    // Format context for insertion
    const formattedContext = {
      session_id: sid,
      topic: context.topic || null,
      name: context.name || null,
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
    console.error("Failed to save conversation context to database:", error);
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

  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

    // Get the context for this session
    const { data, error } = await supabase
      .from(CONTEXT_TABLE)
      .select("*")
      .eq("session_id", sid)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No results found, which is fine for a new user
        return defaultContext;
      }
      throw error;
    }

    if (!data) {
      return defaultContext;
    }

    // Convert database format back to ConversationContext object
    return {
      topic: data.topic || undefined,
      name: data.name || undefined,
      startTime: new Date(data.start_time),
      lastUpdateTime: new Date(data.last_update_time),
      messageCount: data.message_count,
      detectedEntities: data.detected_entities || undefined,
    };
  } catch (error) {
    handleSupabaseError(error, "load context");
    console.error("Failed to load conversation context from database:", error);
    return defaultContext;
  }
};

/**
 * Clear conversation context from Supabase
 */
export const clearContext = async (): Promise<void> => {
  try {
    const sid = getSessionId();

    // Set the session_id in Supabase for RLS policies
    await supabase.rpc("set_session_id", { sid });

    // Delete the context for this session
    const { error } = await supabase
      .from(CONTEXT_TABLE)
      .delete()
      .eq("session_id", sid);

    if (error) throw error;
  } catch (error) {
    handleSupabaseError(error, "clear context");
    console.error("Failed to clear conversation context from database:", error);
  }
};
