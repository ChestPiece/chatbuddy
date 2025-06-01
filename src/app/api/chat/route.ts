import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Message } from "@/types/chat";
import { getContextEnhancedPrompt } from "@/utils/contextManager";
import { LRUCache } from "lru-cache";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Flag to determine if we should use mock responses when API key is missing
const useMockResponses = !process.env.OPENAI_API_KEY;

// Cache for storing responses to similar queries
const responseCache = new LRUCache<string, string>({
  max: 100, // Maximum number of items to store in cache
  ttl: 1000 * 60 * 60, // Cache TTL: 1 hour
  allowStale: false,
});

// Define the system prompt for the agent with enhanced context awareness
const SYSTEM_PROMPT = `You are Chat Buddy, a friendly and intelligent chat companion designed to be highly context-aware.

IMPORTANT CONTEXT GUIDELINES:
- Actively refer back to previous parts of the conversation when relevant
- Maintain continuity by acknowledging what has been discussed before
- Remember details the user has shared and incorporate them in your responses
- If the user asks follow-up questions, connect them to previous context
- Avoid asking for information the user has already provided
- If you're unsure about something mentioned earlier, you can reference it and ask for clarification

Be helpful, accurate, friendly, and conversational in your responses.`;

// Define interface for incoming message format
interface IncomingMessage {
  id?: string;
  role: string;
  content: string;
}

// Ensure the role is a valid Message role
function ensureValidRole(role: string): "user" | "assistant" | "system" {
  if (role === "user" || role === "assistant" || role === "system") {
    return role;
  }
  // Default to user if role is not recognized
  return "user";
}

// Generate a cache key from messages array
function generateCacheKey(messages: IncomingMessage[]): string {
  // Get only the last 3 messages for the cache key to balance cache hits and freshness
  const recentMessages = messages.slice(-3);
  return JSON.stringify(
    recentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required and must be an array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if we should use mock responses
    if (useMockResponses) {
      console.log("Using mock responses because OpenAI API key is missing");
      // For mock responses, we'll simulate a streaming response using ReadableStream
      const encoder = new TextEncoder();
      const mockContent = getMockResponse(
        messages.findLast((msg: IncomingMessage) => msg.role === "user")
          ?.content || "",
        messages // Pass all messages for context in mock responses
      );

      // Create a stream that will emit the mock response character by character
      // Using optimized batching for better performance
      const stream = new ReadableStream({
        async start(controller) {
          const BATCH_SIZE = 5; // Number of characters to send in each batch

          for (let i = 0; i < mockContent.length; i += BATCH_SIZE) {
            const end = Math.min(i + BATCH_SIZE, mockContent.length);
            const chunk = mockContent.substring(i, end);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
            // Reduced delay for faster response
            await new Promise((resolve) => setTimeout(resolve, 15));
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    try {
      // Check cache first for similar recent queries
      const cacheKey = generateCacheKey(messages);
      const cachedResponse = responseCache.get(cacheKey);

      if (cachedResponse) {
        console.log("Using cached response");

        // Return cached response as a stream
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            // Send in chunks to simulate streaming but faster
            const CHUNK_SIZE = 20;
            for (let i = 0; i < cachedResponse.length; i += CHUNK_SIZE) {
              const end = Math.min(i + CHUNK_SIZE, cachedResponse.length);
              const chunk = cachedResponse.substring(i, end);
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content: chunk })}\n\n`
                )
              );
              // Very short delay for cached responses
              await new Promise((resolve) => setTimeout(resolve, 5));
            }

            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      }

      // Get the enhanced system prompt with context from our contextManager
      // First convert the messages to our internal Message type
      const formattedInternalMessages: Message[] = messages.map(
        (msg: IncomingMessage) => ({
          id: msg.id || `${msg.role}-${Date.now()}`,
          role: ensureValidRole(msg.role),
          content: msg.content,
          createdAt: new Date(),
        })
      );

      // Get enhanced prompt using our context manager
      const enhancedSystemPrompt = await getContextEnhancedPrompt(
        SYSTEM_PROMPT,
        formattedInternalMessages
      );

      // Format messages for OpenAI with enhanced context handling
      const formattedMessages = [
        {
          role: "system" as const,
          content: enhancedSystemPrompt,
        },
        ...messages.map((msg: IncomingMessage) => ({
          role: ensureValidRole(msg.role),
          content: msg.content,
        })),
      ];

      // Call OpenAI Chat API with streaming enabled
      // Using gpt-4-turbo for better context handling if available, falling back to gpt-3.5-turbo
      const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";
      const response = await openai.chat.completions.create({
        model,
        messages: formattedMessages,
        stream: true,
        // Increase max_tokens for more detailed responses that can include contextual references
        max_tokens: 1024,
        // Slightly increase temperature for more contextually varied responses
        temperature: 0.7,
        // Add parameters for better performance
        frequency_penalty: 0.1,
        presence_penalty: 0.2,
      });

      // Create a stream that transforms the OpenAI response
      const encoder = new TextEncoder();
      let fullResponse = ""; // Accumulate full response for caching

      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            // Extract the content delta if it exists
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              fullResponse += content; // Accumulate for caching
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }

          // Store in cache when complete
          if (fullResponse.length > 0) {
            responseCache.set(cacheKey, fullResponse);
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      console.error("Specific OpenAI API error:", error);
      throw error; // Re-throw to be caught by the outer catch block
    }
  } catch (error) {
    console.error("Error in chat API:", error);

    // Return error as JSON
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Mock response function (implementation needed if you're using mock responses)
function getMockResponse(
  userMessage: string,
  allMessages: IncomingMessage[]
): string {
  // Generate a context-aware mock response
  const mockResponses = [
    `I understand your question about "${userMessage.substring(
      0,
      30
    )}...". Let me help you with that.`,
    `That's an interesting point about "${userMessage.substring(
      0,
      20
    )}...". Here's what I think...`,
    `Thanks for asking about that. Based on our conversation, I'd say...`,
    `I'm processing your question about ${userMessage.substring(
      0,
      25
    )}. Here's my response...`,
  ];

  // Add some context awareness to mock responses
  let response =
    mockResponses[Math.floor(Math.random() * mockResponses.length)];

  // Check if we have previous context to reference
  if (allMessages.length > 2) {
    const previousUserMessages = allMessages
      .filter((msg) => msg.role === "user")
      .slice(0, -1)
      .map((msg) => msg.content);

    if (previousUserMessages.length > 0) {
      const randomPrevMsg =
        previousUserMessages[
          Math.floor(Math.random() * previousUserMessages.length)
        ];
      response += `\n\nEarlier you mentioned "${randomPrevMsg.substring(
        0,
        30
      )}..." which relates to this.`;
    }
  }

  // Add more content to make it feel like a complete response
  response += `\n\nTo address your specific question, I would suggest the following approach...
  
1. First, consider the key aspects of what you're asking
2. Then, evaluate the best way to proceed based on your goals
3. Finally, implement the solution that best fits your needs

I hope that helps! Let me know if you need any clarification or have additional questions.`;

  return response;
}
