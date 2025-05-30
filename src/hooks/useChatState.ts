import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message, ChatState, ChatSessionState } from "@/types/chat";
import { useSound } from "@/context/SoundContext";
import { sendChatMessage, formatMessagesForApi } from "@/services/chatService";
import { SOUNDS, ERROR_MESSAGES } from "@/utils/constants";

export function useChatState() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    status: ChatSessionState.Idle,
    conversationId: null,
    title: "New Chat",
    isLoading: false,
    error: null,
  });

  const { playSound } = useSound();

  /**
   * Sends a user message to the chat API and handles the response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || chatState.isLoading) return;

      // Play send message sound
      playSound(SOUNDS.SEND, 0.2);

      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      // Update state with user message and loading
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        status: ChatSessionState.Loading,
        isLoading: true,
        error: null,
      }));

      try {
        // Format messages for the API
        const apiMessages = formatMessagesForApi([
          ...chatState.messages,
          userMessage,
        ]);

        // Call API
        const data = await sendChatMessage(apiMessages);

        // Play response received sound
        playSound(SOUNDS.RECEIVE, 0.2);

        // Extract the assistant's response
        const assistantResponse = data.choices[0]?.message;

        if (assistantResponse) {
          // Add assistant message to the chat
          const assistantMessage: Message = {
            id: uuidv4(),
            role: "assistant",
            content: assistantResponse.content,
            createdAt: new Date(),
          };

          setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, assistantMessage],
            status: ChatSessionState.Idle,
            isLoading: false,
          }));
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (error) {
        console.error("Error sending message:", error);

        // Play error sound
        playSound(SOUNDS.ERROR, 0.3);

        setChatState((prev) => ({
          ...prev,
          status: ChatSessionState.Error,
          isLoading: false,
          error:
            error instanceof Error ? error.message : ERROR_MESSAGES.DEFAULT,
        }));
      }
    },
    [chatState.messages, chatState.isLoading, playSound]
  );

  /**
   * Clears the chat history
   */
  const clearChat = useCallback(() => {
    setChatState({
      messages: [],
      status: ChatSessionState.Idle,
      conversationId: null,
      title: "New Chat",
      isLoading: false,
      error: null,
    });
    playSound(SOUNDS.CLICK, 0.2);
  }, [playSound]);

  /**
   * Clears the current error
   */
  const clearError = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    chatState,
    sendMessage,
    clearChat,
    clearError,
  };
}
