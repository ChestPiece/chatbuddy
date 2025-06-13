"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "./Message";
import { ChatInput } from "./ChatInput";
import {
  Message as MessageType,
  ChatState,
  ChatSessionState,
} from "@/types/chat";
import { useSound } from "@/context/SoundContext";
import { useTheme } from "@/context/ThemeContext";
import { clearContext } from "@/utils/contextManager";
import SessionManager from "@/utils/sessionManager";
import Database from "@/utils/database";
import { ConversationSidebar } from "./ConversationSidebar";
import { ConversationHeader } from "./ConversationHeader";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

export function Chat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    status: ChatSessionState.Idle,
    conversationId: null,
    title: "New Chat",
    error: null,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playTypingSound, playMessageSound, playClickSound, playErrorSound } =
    useSound();
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the scrollToBottom function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Memoize the generateTitle function
  const generateTitle = useCallback((content: string): string => {
    // Extract a title from the first user message
    if (!content) return "New Conversation";

    // If content is already short, use it directly
    if (content.length <= 30) {
      return content;
    }

    // Try to find a meaningful sentence or phrase
    const sentences = content.split(/[.!?]/);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();

      // If first sentence is reasonably short, use it
      if (firstSentence.length <= 50) {
        return firstSentence;
      }

      // Otherwise, get the first part with ellipsis
      return firstSentence.substring(0, 47) + "...";
    }

    // Fallback to first 30 chars if no sentence structure found
    return content.substring(0, 27) + "...";
  }, []);

  // Load messages from storage on initial mount
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        const messages = await Database.loadMessages();
        if (messages && messages.length > 0) {
          setChatState((prev) => ({
            ...prev,
            messages,
            conversationId: SessionManager.getSessionId(),
            title: "Conversation",
          }));
        }
      } catch (error) {
        console.error("Failed to load initial messages:", error);
      }
    };

    loadInitialMessages();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, scrollToBottom]);

  // Save messages when they change
  useEffect(() => {
    if (chatState.messages.length > 0) {
      Database.saveMessages(chatState.messages);

      // Update title based on first few messages
      if (!chatState.title || chatState.title === "New Chat") {
        const userMessage = chatState.messages.find((m) => m.role === "user");
        if (userMessage) {
          const title = generateTitle(userMessage.content);
          setChatState((prev) => ({ ...prev, title }));
        }
      }
    }
  }, [chatState.messages, chatState.title, generateTitle]);

  // Auto-generate conversation name after receiving the first assistant response
  useEffect(() => {
    const generateConversationName = async () => {
      const messages = chatState.messages;
      // Only proceed if we have at least one user message and one assistant response
      if (
        messages.length >= 2 &&
        messages.some((m) => m.role === "user") &&
        messages.some(
          (m) => m.role === "assistant" && m.content.trim() !== ""
        ) &&
        (!chatState.title ||
          chatState.title === "New Chat" ||
          chatState.title === "Conversation")
      ) {
        try {
          // Call our API to generate a name
          const response = await fetch("/api/conversation-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages }),
          });

          if (response.ok) {
            const { name } = await response.json();
            if (name) {
              setChatState((prev) => ({ ...prev, title: name }));

              // Also update in the conversation context
              const context = await Database.loadContext();
              if (context) {
                context.name = name;
                await Database.saveContext(context);
              }
            }
          }
        } catch (error) {
          console.error("Error generating conversation name:", error);
        }
      }
    };

    generateConversationName();
  }, [chatState.messages, chatState.title]);

  /**
   * Stream the chat response and call the contentCallback with each content chunk
   */
  const streamChatResponse = useCallback(
    async (
      messages: MessageType[],
      signal: AbortSignal,
      contentCallback: (content: string) => void
    ): Promise<void> => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
          signal,
          // Add cache: 'no-store' to avoid browser caching
          cache: "no-store",
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Error fetching chat response";

          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If parsing fails, use the raw error text if available
            if (errorText) errorMessage = errorText;
          }

          throw new Error(errorMessage);
        }

        // Check if the response has a readable body
        if (!response.body) {
          throw new Error("Response body is not readable");
        }

        // Process the stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let contentBuffer = ""; // Accumulate content for batch updates
        let lastUpdateTime = Date.now();
        const UPDATE_INTERVAL = 20; // Reduced from 30ms to 20ms for faster UI updates
        const MIN_CONTENT_LENGTH = 15; // Minimum content length to trigger an update

        const processBuffer = () => {
          let boundary = buffer.indexOf("\n\n");
          while (boundary !== -1) {
            const line = buffer.substring(0, boundary);
            buffer = buffer.substring(boundary + 2);

            if (line.startsWith("data: ")) {
              const data = line.substring(6);
              if (data === "[DONE]") {
                return true; // Streaming complete
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  contentBuffer += parsed.content;
                }
              } catch {
                console.warn("Failed to parse SSE data:", data);
              }
            }

            boundary = buffer.indexOf("\n\n");
          }
          return false; // Not done yet
        };

        const flushContentBuffer = () => {
          if (contentBuffer) {
            contentCallback(contentBuffer);
            contentBuffer = "";
            lastUpdateTime = Date.now();
          }
        };

        // Enhanced streaming with more frequent updates and parallel processing
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            flushContentBuffer();
            break;
          }

          // Decode the chunk and add to buffer
          buffer += decoder.decode(value, { stream: true });

          // Process the buffer
          const isComplete = processBuffer();

          // Flush content buffer if enough time has passed or if we have substantial content
          const now = Date.now();
          if (
            contentBuffer &&
            (now - lastUpdateTime > UPDATE_INTERVAL ||
              contentBuffer.length > MIN_CONTENT_LENGTH ||
              isComplete)
          ) {
            flushContentBuffer();
          }

          if (isComplete) break;
        }

        // Process any remaining data
        if (buffer.startsWith("data: ")) {
          const data = buffer.substring(6);
          if (data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                contentCallback(parsed.content);
              }
            } catch {
              // Ignore unparseable final chunk
            }
          }
        }

        // Final flush of any remaining content
        flushContentBuffer();
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        console.error("Error in streamChatResponse:", error);
        contentCallback(
          "\n\nI apologize, but I encountered an error: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
    },
    []
  );

  // Define saveCurrentConversation with useCallback
  const saveCurrentConversation = useCallback(
    async (messages: MessageType[]) => {
      if (!messages || messages.length === 0) return;

      try {
        const sessionId =
          chatState.conversationId || SessionManager.getSessionId();
        const userId = SessionManager.getUserId();
        const title =
          chatState.title || generateTitle(messages[0]?.content || "");

        // Create conversation object
        const conversation = {
          id: sessionId,
          userId,
          title,
          messages,
          createdAt: messages[0]?.createdAt || new Date(),
          updatedAt: new Date(),
        };

        // Save to database with proper error handling
        await Database.saveConversation(conversation)
          .then(() => {
            // Successfully saved - no action needed
          })
          .catch((err) => {
            console.error("Error saving conversation in Chat component:", err);
            // We'll continue execution and not throw further to prevent disrupting the UI
          });
      } catch (error) {
        console.error("Error in saveCurrentConversation:", error);
        // Don't throw to prevent UI disruption, but log for debugging
      }
    },
    [chatState.conversationId, chatState.title, generateTitle]
  );

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (chatState.status === ChatSessionState.Loading) return;

      // Play typing sound
      playTypingSound();

      // Add a click sound for the send button
      playClickSound();

      // Create a new user message
      const userMessage: MessageType = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      // Create a placeholder assistant message that will be updated incrementally
      const assistantMessageId = uuidv4();
      const assistantMessage: MessageType = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      // Update state once with both messages
      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, assistantMessage],
        status: ChatSessionState.Loading,
      }));

      try {
        // Cancel any previous ongoing requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create a new AbortController for this request
        abortControllerRef.current = new AbortController();

        // Save messages in the background (don't await)
        const updatedMessages = [
          ...chatState.messages,
          userMessage,
          assistantMessage,
        ];
        Database.saveMessages(updatedMessages)
          .then(() => {
            // Success - no action needed
          })
          .catch((err) => {
            console.error("Background save failed:", err);
            // Don't disrupt UI flow on error
          });

        // Local reference to accumulate content during streaming
        let responseContent = "";

        // Stream the response and update the message incrementally
        await streamChatResponse(
          [...chatState.messages, userMessage],
          abortControllerRef.current.signal,
          (content) => {
            // Update the responseContent variable
            responseContent += content;

            // Update the assistant message with new content
            setChatState((prev) => {
              const updatedMessages = prev.messages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: responseContent }
                  : msg
              );
              return {
                ...prev,
                messages: updatedMessages,
              };
            });
          }
        );

        // Update status to idle
        setChatState((prev) => ({
          ...prev,
          status: ChatSessionState.Idle,
        }));

        // Play sound when message is received
        playMessageSound();

        // Final messages with complete content
        const finalMessages = [
          ...chatState.messages,
          userMessage,
          {
            ...assistantMessage,
            content: responseContent,
          },
        ];

        // Save in background (don't block UI)
        saveCurrentConversation(finalMessages)
          .then(() => {
            // Successfully saved conversation
          })
          .catch((err) => {
            console.error("Error saving conversation:", err);
            // Don't disrupt UI flow on error
          });

        // Save messages in background
        Database.saveMessages(finalMessages)
          .then(() => {
            // Successfully saved messages
          })
          .catch((err) => {
            console.error("Error saving messages:", err);
            // Don't disrupt UI flow on error
          });
      } catch (error: unknown) {
        // Only handle errors if not aborted
        if (error instanceof Error && error.name === "AbortError") {
          console.log("Request was cancelled by user");
          // Already handled in handleCancelResponse
        } else if (error instanceof Error) {
          console.error("Error fetching chat response:", error);
          setChatState((prev) => ({
            ...prev,
            status: ChatSessionState.Error,
          }));
          playErrorSound();
        }
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      chatState.status,
      chatState.messages,
      playClickSound,
      playErrorSound,
      playMessageSound,
      playTypingSound,
      streamChatResponse,
      saveCurrentConversation,
    ]
  );

  const handleClearChat = useCallback(async () => {
    // Play sound
    playClickSound();

    try {
      // Clear the chat messages and context
      await Database.clearMessages();
      await clearContext();

      // Reset chat state
      setChatState({
        messages: [],
        status: ChatSessionState.Idle,
        conversationId: SessionManager.forceNewSession(),
        title: "New Chat",
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      playErrorSound();
    }
  }, [playClickSound, playErrorSound]);

  const handleNewConversation = useCallback(async () => {
    try {
      // Save the current conversation before starting a new one
      if (chatState.messages.length > 0) {
        await saveCurrentConversation(chatState.messages);
      }

      // Create a new conversation ID
      const newSessionId = SessionManager.forceNewSession();

      // Clear the chat messages and context
      await Database.clearMessages();
      await clearContext();

      // Reset chat state with the new session ID
      setChatState({
        messages: [],
        status: ChatSessionState.Idle,
        conversationId: newSessionId,
        title: "New Chat",
      });

      // Play sound feedback
      playClickSound();
    } catch (error) {
      console.error("Error creating new conversation:", error);
      playErrorSound();
    }
  }, [
    chatState.messages,
    playClickSound,
    playErrorSound,
    saveCurrentConversation,
  ]);

  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      try {
        // Save the current conversation before loading a new one
        if (chatState.messages.length > 0) {
          await saveCurrentConversation(chatState.messages);
        }

        // Load the selected conversation
        const conversation = await Database.loadConversation(conversationId);

        if (!conversation) {
          console.error("Conversation not found:", conversationId);
          return;
        }

        // Update the session ID
        SessionManager.setSessionId(conversationId);

        // Update chat state with the loaded conversation
        setChatState({
          messages: conversation.messages || [],
          status: ChatSessionState.Idle,
          conversationId,
          title: conversation.title || "Conversation",
        });
      } catch (error) {
        console.error("Error loading conversation:", error);
      }
    },
    [saveCurrentConversation, chatState.messages]
  );

  const handleRetryMessage = useCallback(async () => {
    if (chatState.status === ChatSessionState.Loading) return;

    // Get the most recent user message
    const messages = [...chatState.messages];
    let lastUserMessageIndex = messages.length - 1;

    while (
      lastUserMessageIndex >= 0 &&
      messages[lastUserMessageIndex].role !== "user"
    ) {
      lastUserMessageIndex--;
    }

    if (lastUserMessageIndex < 0) return; // No user message found

    // Get all messages up to and including the last user message
    const messagesToSend = messages.slice(0, lastUserMessageIndex + 1);

    // Remove error-state messages
    const cleanMessages = chatState.messages.filter((m) => !m.isError);

    // Create a placeholder assistant message
    const assistantMessageId = uuidv4();
    const assistantMessage: MessageType = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date(),
    };

    // Update state
    setChatState((prev) => ({
      ...prev,
      messages: [...cleanMessages, assistantMessage],
      status: ChatSessionState.Loading,
      error: null,
    }));

    try {
      // Cancel any previous ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();

      // Local reference to accumulate content during streaming
      let responseContent = "";

      // Stream the response and update the message incrementally
      await streamChatResponse(
        messagesToSend,
        abortControllerRef.current.signal,
        (content) => {
          // Update the responseContent variable
          responseContent += content;

          // Update the assistant message with new content
          setChatState((prev) => {
            const updatedMessages = prev.messages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: responseContent }
                : msg
            );
            return {
              ...prev,
              messages: updatedMessages,
            };
          });
        }
      );

      // Update status to idle
      setChatState((prev) => ({
        ...prev,
        status: ChatSessionState.Idle,
      }));

      // Play sound when message is received
      playMessageSound();

      // Final messages with complete content
      const finalMessages = cleanMessages.map((msg) =>
        msg.id === assistantMessageId
          ? { ...msg, content: responseContent, isError: false }
          : msg
      );

      // Save in background
      Database.saveMessages(finalMessages)
        .then(() => {
          // Successfully saved messages
        })
        .catch((err) => {
          console.error("Error saving messages in retry:", err);
          // Continue execution to not disrupt UI
        });
    } catch (error: unknown) {
      // Only handle errors if not aborted
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching chat response:", error);
        setChatState((prev) => ({
          ...prev,
          status: ChatSessionState.Error,
          error: error instanceof Error ? error.message : "Unknown error",
        }));
        playErrorSound();
      }
    } finally {
      abortControllerRef.current = null;
    }
  }, [
    chatState.messages,
    chatState.status,
    playErrorSound,
    playMessageSound,
    streamChatResponse,
  ]);

  // Add this useEffect to handle the retry event
  useEffect(() => {
    const handleRetry = () => {
      if (chatState.status !== ChatSessionState.Loading) {
        handleRetryMessage();
      }
    };

    // Add event listener
    window.addEventListener("retry-message", handleRetry);

    // Clean up
    return () => {
      window.removeEventListener("retry-message", handleRetry);
    };
  }, [handleRetryMessage, chatState.status]);

  // Function to focus the chat input
  const focusChatInput = useCallback(() => {
    if (chatState.status === ChatSessionState.Loading) return;

    // Find input inside ChatInput component
    const textareaElement = document.querySelector(
      ".chat-input-container textarea"
    );
    if (textareaElement instanceof HTMLTextAreaElement) {
      textareaElement.focus();
    }
  }, [chatState.status]);

  return (
    <div
      className="chat-container pixel-box crt-flicker power-on"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        margin: "10px",
        padding: 0,
        overflow: "hidden",
        backgroundColor: isDark ? "var(--tv-screen)" : "var(--tv-screen)",
        color: isDark ? "var(--terminal-text)" : "var(--terminal-text)",
        position: "relative",
        height: "calc(100% - 20px)",
        maxHeight: "calc(100% - 20px)",
        borderRadius: "10px",
        boxShadow: "inset 0 0 20px var(--tv-glow), 0 0 20px var(--tv-shadow)",
      }}
    >
      {/* TV Static overlay with enhanced animation */}
      <div className="tv-static"></div>

      {/* Scanlines overlay with enhanced animation */}
      <div className="scanlines"></div>

      {/* TV scan effect - new moving scan line */}
      <div className="tv-scan"></div>

      {/* Screen glow effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at center, rgba(140, 255, 180, 0.1), transparent 75%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      ></div>

      {/* Random pixel noise effect */}
      <div
        className="pixel-noise"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundSize: "4px 4px",
          opacity: 0.03,
          pointerEvents: "none",
          zIndex: 2,
        }}
      ></div>

      {/* Add KeyboardShortcuts component */}
      <KeyboardShortcuts
        onNewChat={handleNewConversation}
        onClearChat={handleClearChat}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onFocusInput={focusChatInput}
      />

      {/* Conversation sidebar */}
      <ConversationSidebar
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        currentConversationId={chatState.conversationId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Conversation header */}
      <ConversationHeader
        title={chatState.title}
        onNewChat={handleNewConversation}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onClearChat={handleClearChat}
      />

      {/* Messages container */}
      <div
        className="messages-container"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          position: "relative",
          zIndex: 5,
          fontFamily: "var(--terminal-font)",
          fontSize: "1.1rem",
          letterSpacing: "1px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          maxHeight: "calc(100% - 130px)",
          background: isDark
            ? "linear-gradient(180deg, rgba(7, 10, 28, 0.8) 0%, rgba(7, 10, 28, 1) 100%)"
            : "linear-gradient(180deg, rgba(15, 30, 60, 0.8) 0%, rgba(10, 20, 45, 1) 100%)",
        }}
      >
        {chatState.messages.length === 0 && (
          <div
            className="welcome-message"
            style={{
              textAlign: "center",
              marginTop: "4rem",
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                color: isDark
                  ? "var(--terminal-text-highlight)"
                  : "var(--terminal-text-highlight)",
                fontFamily: "var(--pixel-font)",
                textShadow: "var(--text-shadow)",
                letterSpacing: "2px",
              }}
            >
              WELCOME TO CHAT BUDDY
            </h2>
            <p
              className="terminal-text"
              style={{
                fontSize: "1.1rem",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              &gt; AWAITING INPUT...
            </p>

            {/* Blinking cursor */}
            <div
              className="cursor-blink"
              style={{
                display: "inline-block",
                width: "10px",
                height: "16px",
                backgroundColor: isDark
                  ? "var(--terminal-text)"
                  : "var(--terminal-text)",
                marginTop: "20px",
              }}
            ></div>
          </div>
        )}

        {chatState.messages.map((message) => (
          <Message key={message.id} message={message} isLastInGroup={true} />
        ))}

        {chatState.status === ChatSessionState.Loading && (
          <div
            className="typing-indicator"
            style={{
              display: "flex",
              padding: "0.5rem",
              justifyContent: "space-between",
              marginLeft: "1rem",
              marginRight: "1rem",
              alignItems: "center",
            }}
          >
            <div
              className="typing-animation"
              style={{
                display: "flex",
                gap: "0.3rem",
                alignItems: "center",
              }}
            >
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
            </div>
          </div>
        )}

        {chatState.status === ChatSessionState.Error && (
          <div className="flex flex-col items-center justify-center p-4 text-red-500">
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-4">
              <p>Sorry, there was an error processing your request.</p>
              {chatState.error && (
                <p className="text-sm mt-1">{chatState.error}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRetryMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={chatState.status === ChatSessionState.Loading}
        placeholder="Type your message..."
      />

      <style jsx global>{`
        .typing-animation .dot {
          width: 8px;
          height: 8px;
          background-color: var(--retro-green);
          border-radius: 50%;
          animation: pulse 1.5s infinite;
          opacity: 0.9;
        }
        .typing-animation .dot:nth-child(2) {
          animation-delay: 0.5s;
        }
        .typing-animation .dot:nth-child(3) {
          animation-delay: 1s;
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(0.7);
          }
          50% {
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* CRT on/off animation */
        @keyframes crtOn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          5% {
            opacity: 0.7;
          }
          15% {
            opacity: 0.3;
          }
          30% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          75% {
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Horizontal scan line animation */
        @keyframes horizontalScan {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 0 100%;
          }
        }
      `}</style>
    </div>
  );
}
