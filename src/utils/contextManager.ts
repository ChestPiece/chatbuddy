import { ConversationContext } from "@/types/chat";
import { Message } from "@/types/chat";
import Database from "./database";

/**
 * Manages conversation context data
 */
export const ContextManager = {
  /**
   * Save context data to storage
   */
  saveContext: async (context: ConversationContext): Promise<void> => {
    try {
      await Database.saveContext(context);
    } catch (error) {
      console.error("Failed to save context:", error);
    }
  },

  /**
   * Load context data from storage
   */
  loadContext: async (): Promise<ConversationContext | null> => {
    try {
      return await Database.loadContext();
    } catch (error) {
      console.error("Failed to load context:", error);
      return null;
    }
  },

  /**
   * Clear context data from storage
   */
  clearContext: async (): Promise<void> => {
    try {
      await Database.clearContext();
    } catch (error) {
      console.error("Failed to clear context:", error);
    }
  },

  /**
   * Update specific context fields
   */
  updateContext: async (
    updates: Partial<ConversationContext>
  ): Promise<void> => {
    try {
      // Get existing context or create new one
      const existingContext = (await ContextManager.loadContext()) || {
        startTime: new Date(),
        lastUpdateTime: new Date(),
        messageCount: 0,
      };

      // Update with new values
      const updatedContext = {
        ...existingContext,
        ...updates,
        lastUpdateTime: new Date(), // Always update the timestamp
      };

      // Save the updated context
      await ContextManager.saveContext(updatedContext);
    } catch (error) {
      console.error("Failed to update context:", error);
    }
  },
};

/**
 * Enhances a system prompt with contextual information from conversation history
 */
export const getContextEnhancedPrompt = async (
  systemPrompt: string,
  messages: Message[]
): Promise<string> => {
  // Get the existing context or create a new one
  const context = (await ContextManager.loadContext()) || {
    startTime: new Date(),
    lastUpdateTime: new Date(),
    messageCount: 0,
  };

  // Basic context extraction
  let contextInfo = "";

  if (messages.length > 1) {
    // Track message count
    context.messageCount = messages.length;

    // Extract potential topics from user messages
    const userMessages = messages.filter((msg) => msg.role === "user");

    if (userMessages.length > 1) {
      // Simple topic extraction from past messages
      const allUserContent = userMessages.map((msg) => msg.content).join(" ");
      const words = allUserContent.split(" ").filter((word) => word.length > 4);

      // Count word frequency to identify potential topics
      const wordFrequency: Record<string, number> = {};
      words.forEach((word) => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
        if (cleanWord && cleanWord.length > 4) {
          wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
        }
      });

      // Get the top 3 frequent words as potential topics
      const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([word]) => word);

      if (topWords.length > 0) {
        contextInfo += `\nPotential topics of interest: ${topWords.join(", ")}`;
      }
    }

    // Add conversation length context
    contextInfo += `\nConversation length: ${messages.length} messages`;

    // Add previous question context if available
    const previousUserMessage = userMessages[userMessages.length - 2];
    if (previousUserMessage) {
      contextInfo += `\nPrevious question: "${previousUserMessage.content}"`;
    }

    // Update the context in storage
    await ContextManager.updateContext(context);
  }

  // Return enhanced prompt with context information if available
  return contextInfo
    ? `${systemPrompt}\n\nCURRENT CONVERSATION CONTEXT:${contextInfo}`
    : systemPrompt;
};

export default ContextManager;
export const clearContext = ContextManager.clearContext;
