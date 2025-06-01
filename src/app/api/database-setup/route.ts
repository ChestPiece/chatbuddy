import { NextResponse } from "next/server";
import { setupDatabase, testDatabaseConnection } from "@/utils/setupDatabase";
import { isSupabaseConfigured } from "@/utils/supabase";

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Supabase is not configured. Check your environment variables.",
          configured: false,
          env: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
            key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
          },
        },
        { status: 400 }
      );
    }

    // Test the database connection
    const connectionTest = await testDatabaseConnection();

    if (!connectionTest.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to Supabase",
          details: connectionTest.details,
          configured: true,
        },
        { status: 500 }
      );
    }

    // Set up the database tables
    const setupResult = await setupDatabase();

    return NextResponse.json({
      success: setupResult,
      message: setupResult
        ? "Database tables created successfully"
        : "Failed to create database tables",
      connectionTest,
    });
  } catch (error) {
    console.error("Error in database setup API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error in database setup",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
