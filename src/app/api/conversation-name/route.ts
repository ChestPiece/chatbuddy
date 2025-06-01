import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// Flag to determine if we should use mock responses when API key is missing
const useMockResponses = !process.env.OPENAI_API_KEY;

// Define proper type for messages
interface Message {
  role: string;
  content: string;
}

// Define the proper type for OpenAI chat message parameters
type Role = "system" | "user" | "assistant";
interface ChatMessage {
  role: Role;
  content: string;
}

// Simple function to generate a mock name when no API key is available
function generateMockName(messages: Message[]): string {
  const firstMessage = messages[0]?.content?.toLowerCase() || "";

  if (
    firstMessage.includes("hello") ||
    firstMessage.includes("hi") ||
    firstMessage.includes("hey")
  ) {
    return "Friendly Greeting";
  } else if (firstMessage.includes("help") || firstMessage.includes("assist")) {
    return "Help Request";
  } else if (firstMessage.includes("how") && firstMessage.includes("you")) {
    return "Casual Check-in";
  } else if (
    firstMessage.includes("what") ||
    firstMessage.includes("who") ||
    firstMessage.includes("why")
  ) {
    return "General Inquiry";
  } else {
    return "New Conversation " + new Date().toLocaleDateString();
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required and must be an array" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If no API key, generate a mock name
    if (useMockResponses) {
      const name = generateMockName(messages);
      return NextResponse.json(
        { name },
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get the first few messages to use for naming the conversation
    const recentMessages = messages.slice(0, Math.min(3, messages.length));

    // Format the messages for the OpenAI API with proper typing
    const prompt: ChatMessage[] = recentMessages.map((msg: Message) => ({
      role:
        msg.role === "user" || msg.role === "assistant" || msg.role === "system"
          ? (msg.role as Role)
          : "user",
      content: msg.content,
    }));

    // Add a system message to instruct the model
    prompt.unshift({
      role: "system",
      content:
        "You are an assistant that generates short, descriptive names for conversations based on their content. Respond with ONLY the name, nothing else. Keep it under 5 words and relevant to the topic. Don't use quotation marks.",
    });

    // Call OpenAI to generate a name
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: prompt,
      max_tokens: 20,
      temperature: 0.7,
    });

    const name =
      response.choices[0]?.message?.content?.trim() || "New Conversation";

    return NextResponse.json(
      { name },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating conversation name:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        name: "New Conversation", // Fallback name
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
