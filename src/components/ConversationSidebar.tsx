"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSound } from "@/context/SoundContext";
import SessionManager from "@/utils/sessionManager";
import Database from "@/utils/database";
import { formatRelativeTime } from "@/utils/dateUtils";

// Enhanced type for display purposes
interface DisplayConversation {
  id: string;
  title: string;
  date: Date;
  isActive: boolean;
  messageCount: number;
}

interface ConversationItemProps {
  conversation: DisplayConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  // Format the date on the client side only
  useEffect(() => {
    setFormattedDate(formatRelativeTime(conversation.date));
  }, [conversation.date]);

  return (
    <div
      className={`conversation-item ${isActive ? "active" : ""}`}
      onClick={onSelect}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.75rem",
        borderRadius: "0.25rem",
        backgroundColor: isActive
          ? "var(--primary-light)"
          : "var(--background-alt)",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        position: "relative",
        border: `1px solid ${
          isActive ? "var(--primary)" : "var(--border-dark)"
        }`,
      }}
    >
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: isActive ? "bold" : "normal",
            marginBottom: "0.25rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: isActive ? "var(--primary)" : "var(--text)",
          }}
        >
          {conversation.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.6rem",
            color: "var(--text-secondary)",
          }}
        >
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{conversation.messageCount} messages</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          fontSize: "0.75rem",
          padding: "0.25rem",
          marginLeft: "0.5rem",
          borderRadius: "0.25rem",
          opacity: 0.6,
          transition: "opacity 0.2s",
        }}
        aria-label="Delete conversation"
      >
        🗑️
      </button>
    </div>
  );
}

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  currentConversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationSidebar({
  onSelectConversation,
  onNewConversation,
  currentConversationId,
  isOpen,
  onClose,
}: ConversationSidebarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<DisplayConversation[]>([]);
  const { playSound } = useSound();

  // Load conversation summaries
  const loadConversations = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get user ID
      const userId = SessionManager.getUserId();

      // Get conversations from history
      const storedConversations = await Database.getUserConversations(userId);

      // Create summaries with message counts
      const summaries: DisplayConversation[] = storedConversations.map(
        (conv) => ({
          id: conv.id,
          title: conv.title || "Untitled",
          date: conv.updatedAt || conv.createdAt,
          isActive: conv.id === currentConversationId,
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

  // Load conversations on mount and when currentConversationId changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
              isActive={conversation.isActive}
              onSelect={() => handleSelectConversation(conversation.id)}
              onDelete={(e) => handleDeleteConversation(e, conversation.id)}
            />
          ))}
      </div>
    </div>
  );
}
