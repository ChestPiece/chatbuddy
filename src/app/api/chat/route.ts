import { OpenAI } from "openai";
import { NextRequest } from "next/server";
import { Message } from "@/types/chat";
import { getContextEnhancedPrompt } from "@/utils/contextManager";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Flag to determine if we should use mock responses when API key is missing
const useMockResponses = !process.env.OPENAI_API_KEY;

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
      const stream = new ReadableStream({
        async start(controller) {
          for (let i = 0; i < mockContent.length; i++) {
            const chunk = mockContent.charAt(i);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            );
            // Add a delay to simulate streaming
            await new Promise((resolve) => setTimeout(resolve, 30));
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
      console.log("Calling OpenAI API with messages:", messages);

      // Get the enhanced system prompt with context from our contextManager
      // First convert the messages to our internal Message type
      const formattedInternalMessages: Message[] = messages.map(
        (msg: IncomingMessage) => ({
          id: msg.id || `${msg.role}-${Date.now()}`,
          role: msg.role,
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
          role: "system",
          content: enhancedSystemPrompt,
        },
        ...messages.map((msg: IncomingMessage) => ({
          role: msg.role,
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
      });

      // Create a stream that transforms the OpenAI response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of response) {
            // Extract the content delta if it exists
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
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

// Function to generate mock responses with context awareness
function getMockResponse(
  userMessage: string,
  allMessages: IncomingMessage[]
): string {
  // Convert the user message to lowercase for easier matching
  const message = userMessage.toLowerCase();

  // Check for context from previous messages
  const previousUserMessages = allMessages
    .filter((msg: IncomingMessage) => msg.role === "user")
    .map((msg: IncomingMessage) => msg.content);

  const hasContext = previousUserMessages.length > 1;
  const prevMessage =
    previousUserMessages.length > 1
      ? previousUserMessages[previousUserMessages.length - 2]
      : "";

  // Context-aware responses
  if (hasContext && message.includes("what") && !message.includes("your")) {
    return `Based on our conversation, I think you're asking about "${prevMessage}". Could you clarify what specific information you're looking for?`;
  }

  // Simple pattern matching for common questions
  if (
    message.includes("hello") ||
    message.includes("hi") ||
    message.includes("hey")
  ) {
    return hasContext
      ? "Hello again! Continuing our conversation, how can I help you further?"
      : "Hello! How can I help you today?";
  } else if (message.includes("how are you")) {
    return "I'm just a simulated response in your application, but I'm working well! How can I assist you?";
  } else if (message.includes("your name")) {
    return "I'm Chat Buddy, your friendly chat companion.";
  } else if (message.includes("weather")) {
    return "I can't check the real weather as this is a mock response, but I hope it's nice where you are!";
  } else if (message.includes("thank")) {
    return "You're welcome! Let me know if there's anything else you need help with.";
  } else if (message.includes("bye") || message.includes("goodbye")) {
    return "Goodbye! Feel free to return if you have more questions.";
  } else if (message.length < 10) {
    return "Could you please provide a bit more information so I can assist you better?";
  }

  // Default contextual response
  return hasContext
    ? `I notice we've been discussing various topics. To respond to "${userMessage}", I need to tell you that this is a mock response in development mode. To get real AI responses, please add your OpenAI API key to the environment variables.`
    : "This is a mock response because the application is running without an OpenAI API key. To get real AI responses, please add your API key to the environment variables.";
}
