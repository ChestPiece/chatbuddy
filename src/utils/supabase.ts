import { createClient } from "@supabase/supabase-js";

// These values should be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// More robust client creation with proper error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const configured = !!supabaseUrl && !!supabaseAnonKey;

  // Show warning in development if not configured
  if (!configured && process.env.NODE_ENV === "development") {
    console.warn(
      "Supabase is not configured. Please check your .env.local file and ensure you have added the following variables:\n" +
        "NEXT_PUBLIC_SUPABASE_URL\n" +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY\n" +
        "The app will fall back to localStorage for data storage."
    );
  }

  return configured;
};

// Define a type for Supabase error objects
interface SupabaseError {
  code?: string;
  details?: string;
  hint?: string;
  message?: string;
}

// Function to handle errors consistently
export const handleSupabaseError = (
  error: Error | unknown,
  operation: string
): void => {
  console.error(`Supabase ${operation} error:`, error);

  // In development, show a more detailed error
  if (process.env.NODE_ENV === "development") {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Supabase configuration is missing. Please check your .env.local file."
      );
    }

    // Additional debug info for Supabase errors
    if (error && typeof error === "object" && "code" in error) {
      const supabaseError = error as SupabaseError;
      console.error(`Error code: ${supabaseError.code}`);
      console.error(
        `Error details: ${supabaseError.details || "No details available"}`
      );
      console.error(`Error hint: ${supabaseError.hint || "No hint available"}`);
    }
  }
};
