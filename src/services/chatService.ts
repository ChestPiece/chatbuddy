import { Message } from "@/types/chat";

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: string;
}

/**
 * Send a chat message to the API
 * @param messages Array of chat messages
 * @returns Promise with the API response
 */
export async function sendChatMessage(
  messages: ChatMessage[]
): Promise<ChatResponse> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    throw error;
  }
}

/**
 * Check if the API key is configured
 * @returns Promise with the status response
 */
export async function checkApiStatus(): Promise<{ hasApiKey: boolean }> {
  try {
    const response = await fetch("/api/status");
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error checking API status:", error);
    return { hasApiKey: false };
  }
}

/**
 * Format messages for the API
 * @param messages Array of Message objects from the chat state
 * @returns Array of formatted ChatMessage objects for the API
 */
export function formatMessagesForApi(messages: Message[]): ChatMessage[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}
