import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if OpenAI API key is set
    const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

    return NextResponse.json({
      status: "ok",
      hasApiKey,
      usingMock: !hasApiKey,
      provider: "OpenAI",
    });
  } catch (error) {
    console.error("Error in status API:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
