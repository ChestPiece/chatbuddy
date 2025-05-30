import { createClient } from "@supabase/supabase-js";

// These values should be in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return false; // Force using localStorage instead of Supabase
};

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
  }
};

// Authentication helpers
export const authHelpers = {
  // Get the current user session
  getCurrentSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      handleSupabaseError(error, "get current session");
      return null;
    }
  },

  // Get the current user
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      handleSupabaseError(error, "get current user");
      return null;
    }
  },

  // Sign in with email and password
  signInWithEmail: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      handleSupabaseError(error, "sign in with email");
      throw error;
    }
  },

  // Sign up with email and password
  signUpWithEmail: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      handleSupabaseError(error, "sign up with email");
      throw error;
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      handleSupabaseError(error, "sign out");
      return false;
    }
  },
};
