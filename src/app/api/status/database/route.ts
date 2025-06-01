import { NextResponse } from "next/server";
import { testDatabaseConnection } from "@/utils/setupDatabase";

export async function GET() {
  try {
    // Make a simple query to check if Supabase is online
    const result = await testDatabaseConnection();

    return NextResponse.json({
      status: result.success ? "online" : "error",
      message: result.success ? "Connection successful" : result.message,
      details: result.details,
    });
  } catch (error) {
    console.error("Error checking database status:", error);

    return NextResponse.json(
      { online: false, error: "Failed to connect to database" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
