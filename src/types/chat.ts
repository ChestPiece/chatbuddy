export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  contextId?: string;
  referencesMessageIds?: string[];
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ConversationContext {
  topic?: string;
  name?: string;
  startTime: Date;
  lastUpdateTime: Date;
  messageCount: number;
  detectedEntities?: string[];
}

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export enum ChatSessionState {
  Idle = "idle",
  Loading = "loading",
  Error = "error",
}

export interface ChatState {
  messages: Message[];
  status: ChatSessionState;
  conversationId: string | null;
  title: string;
  isLoading?: boolean;
  error?: string | null;
}
