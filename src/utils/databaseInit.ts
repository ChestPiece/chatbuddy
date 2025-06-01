import { setupDatabase, testDatabaseConnection } from "./setupDatabase";
import { isSupabaseConfigured } from "./supabase";

/**
 * Initialize database connection when app starts
 */
export async function initializeDatabase() {
  // Only run on client side
  if (typeof window === "undefined") {
    return;
  }

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.warn(
      "Supabase is not configured, skipping database initialization"
    );
    return;
  }

  try {
    // Test connection first
    const connectionTest = await testDatabaseConnection();
    if (!connectionTest.success) {
      console.error("Database connection test failed:", connectionTest.message);
      console.log("Details:", connectionTest.details);

      // Don't proceed with setup if connection failed
      return;
    }

    // Setup database tables
    const setupResult = await setupDatabase();
    if (setupResult) {
      console.log("Database initialized successfully");
    } else {
      console.warn("Database initialization skipped or failed");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}
