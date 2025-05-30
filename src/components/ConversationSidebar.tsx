"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { ConversationSummary } from "@/types/chat";
import { useSound } from "@/context/SoundContext";
import SessionManager from "@/utils/sessionManager";
import Database from "@/utils/database";

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Memoize conversation item for better performance
const ConversationItem = memo(
  ({
    conversation,
    isActive,
    onSelect,
    onDelete,
  }: {
    conversation: ConversationSummary;
    isActive: boolean;
    onSelect: () => void;
    onDelete: (e: React.MouseEvent) => void;
  }) => {
    // Handle date formatting on client-side only to prevent hydration mismatch
    const [formattedDate, setFormattedDate] = useState("");

    useEffect(() => {
      // Format date on client side only
      setFormattedDate(new Date(conversation.updatedAt).toLocaleDateString());
    }, [conversation.updatedAt]);

    return (
      <div
        onClick={onSelect}
        style={{
          backgroundColor: isActive ? "var(--primary-light)" : "var(--card-bg)",
          border: "1px solid var(--border)",
          borderRadius: "0.25rem",
          padding: "0.75rem",
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "var(--system-font)",
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: "bold",
              color: isActive ? "var(--primary)" : "var(--text)",
            }}
          >
            {conversation.title || "Untitled"}
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              color: "var(--text-secondary)",
              marginTop: "0.25rem",
            }}
          >
            {conversation.messageCount} messages • {formattedDate}
          </div>
        </div>
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--error)",
            opacity: 0.7,
            fontFamily: "var(--pixel-font)",
            fontSize: "0.7rem",
            padding: "0.25rem",
            transition: "opacity 0.2s ease",
          }}
          title="Delete conversation"
          aria-label="Delete conversation"
        >
          ×
        </button>
      </div>
    );
  }
);

ConversationItem.displayName = "ConversationItem";

export function ConversationSidebar({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { playSound } = useSound();

  // Load conversation history on mount and when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = SessionManager.getUserId();
      const userConversations = await Database.getUserConversations(userId);

      // Make sure we have the current conversation in the list
      if (currentConversationId) {
        const hasCurrentConversation = userConversations.some(
          (conv) => conv.id === currentConversationId
        );

        if (!hasCurrentConversation) {
          // Add the current conversation to the list
          try {
            const currentConv = await Database.loadConversation(
              currentConversationId
            );
            if (currentConv) {
              userConversations.unshift({
                id: currentConv.id,
                userId: currentConv.userId,
                title: currentConv.title || "Untitled Conversation",
                createdAt: currentConv.createdAt,
                updatedAt: currentConv.updatedAt,
                messageCount: currentConv.messages?.length || 0,
              });
            }
          } catch (err) {
            console.error("Failed to load current conversation:", err);
          }
        }
      }

      // Convert to ConversationSummary type if needed
      const summaries: ConversationSummary[] = userConversations.map(
        (conv) => ({
          id: conv.id,
          userId: conv.userId,
          title: conv.title || "Untitled Conversation",
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messageCount: conv.messages?.length || 0,
        })
      );

      // Deduplicate by ID
      const uniqueSummaries = Array.from(
        new Map(summaries.map((item) => [item.id, item])).values()
      );

      setConversations(uniqueSummaries);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      playSound("/click.mp3", 0.2);
      onSelectConversation(conversationId);
      onClose();
    },
    [onSelectConversation, onClose, playSound]
  );

  const handleNewConversation = useCallback(() => {
    playSound("/click.mp3", 0.2);
    onNewConversation();
    onClose();
  }, [onNewConversation, onClose, playSound]);

  const handleDeleteConversation = useCallback(
    async (e: React.MouseEvent, conversationId: string) => {
      e.stopPropagation(); // Prevent triggering the conversation selection
      playSound("/click.mp3", 0.2);

      try {
        // Delete the conversation from storage
        const success = await Database.deleteConversation(conversationId);

        if (success) {
          // If the current conversation was deleted, create a new one
          if (conversationId === currentConversationId) {
            onNewConversation();
          }

          // Reload the conversation list
          await loadConversations();
        }
      } catch (error) {
        console.error("Failed to delete conversation:", error);
      }
    },
    [currentConversationId, loadConversations, onNewConversation, playSound]
  );

  if (!isOpen) return null;

  return (
    <div
      className="conversation-sidebar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "300px",
        backgroundColor: "var(--background)",
        zIndex: 1000,
        borderRight: "2px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        boxShadow: "var(--shadow)",
        padding: "1rem",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        className="sidebar-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          padding: "0.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <h3
          style={{
            fontSize: "0.85rem",
            fontFamily: "var(--pixel-font)",
            margin: 0,
            color: "var(--primary)",
          }}
        >
          CONVERSATIONS
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text)",
            fontFamily: "var(--pixel-font)",
            fontSize: "0.85rem",
          }}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      <button
        onClick={handleNewConversation}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          backgroundColor: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          padding: "0.75rem",
          cursor: "pointer",
          fontFamily: "var(--pixel-font)",
          fontSize: "0.7rem",
          marginBottom: "1rem",
          width: "100%",
          transition: "opacity 0.2s ease",
        }}
      >
        <span>+</span> NEW CONVERSATION
      </button>

      <div
        className="conversation-list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          opacity: isLoading ? 0.7 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              fontSize: "0.7rem",
              color: "var(--text-secondary)",
            }}
          >
            Loading conversations...
          </div>
        )}

        {!isLoading && conversations.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              fontSize: "0.7rem",
              padding: "1rem",
            }}
          >
            No conversation history
          </div>
        )}

        {!isLoading &&
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === currentConversationId}
              onSelect={() => handleSelectConversation(conversation.id)}
              onDelete={(e) => handleDeleteConversation(e, conversation.id)}
            />
          ))}
      </div>
    </div>
  );
}
