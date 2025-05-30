// App constants

// App information
export const APP_INFO = {
  NAME: "Chat Buddy",
  VERSION: "1.0.0",
  DESCRIPTION: "Your AI chat companion",
  COPYRIGHT_YEAR: "2025",
  API_PROVIDER: "OpenAI",
};

// Sound file paths
export const SOUNDS = {
  CLICK: "/click.mp3",
  SEND: "/send.mp3",
  RECEIVE: "/receive.mp3",
  ERROR: "/error.mp3",
};

// Boot sequence steps
export const BOOT_SEQUENCE_STEPS = [
  "INITIALIZING SYSTEM...",
  "LOADING USER INTERFACE...",
  "ESTABLISHING CONNECTION...",
  "CALIBRATING RESPONSE ALGORITHMS...",
  "ACTIVATING CONVERSATION MODULE...",
  "SYSTEM READY",
];

// Welcome messages
export const WELCOME_MESSAGES = [
  "CHAT BUDDY ACTIVATED. HOW CAN I HELP YOU TODAY?",
  "NEURAL INTERFACE READY. ASK ME ANYTHING!",
  "BUDDY SYSTEM ONLINE. WHAT'S ON YOUR MIND?",
  "WELCOME TO CHAT BUDDY! HOW CAN I ASSIST YOU?",
];

// Error messages
export const ERROR_MESSAGES = {
  DEFAULT: "Failed to get a response. Please try again.",
  API_UNAVAILABLE:
    "Chat service is currently unavailable. Please try again later.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  API_KEY_MISSING:
    "API key is not configured. Please set up your API key to use Chat Buddy.",
};

// UI constants
export const UI = {
  MAX_MESSAGE_WIDTH: "80%",
  ANIMATION_SPEED: {
    FAST: "0.1s",
    MEDIUM: "0.3s",
    SLOW: "0.5s",
  },
  SIZES: {
    SM: "sm",
    MD: "md",
    LG: "lg",
  },
};

export const API_ROUTES = {
  CHAT: "/api/chat",
};

// Default settings
export const DEFAULT_SETTINGS = {
  THEME: "light",
  SOUND_ENABLED: true,
  AUTO_SCROLL: true,
};

// Messages
export const MESSAGES = {
  WELCOME: "Welcome to Chat Buddy! How can I help you today?",
  ERROR: "I apologize, but I encountered an error processing your request.",
  LOADING: "Thinking...",
};

// Storage keys
export const STORAGE_KEYS = {
  SESSION_ID: "chatbuddy_session_id",
  USER_ID: "chatbuddy_user_id",
  THEME: "chatbuddy_theme",
  SOUND_ENABLED: "chatbuddy_sound_enabled",
  MESSAGES: "chatbuddy_messages",
  CONVERSATIONS: "chatbuddy_conversations",
};
