import { supabase, isSupabaseConfigured } from "./supabase";

// Table names
const MESSAGES_TABLE = "chat_messages";
const CONTEXT_TABLE = "conversation_contexts";
const CONVERSATION_TABLE = "conversations";

/**
 * Creates the required tables in Supabase if they don't exist
 */
export async function setupDatabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase is not configured, skipping database setup");
    return false;
  }

  try {
    console.log("Checking Supabase connection...");

    // First, check if we can connect to Supabase
    const { error: healthError } = await supabase
      .from("_health_check")
      .select("*")
      .maybeSingle();

    if (healthError) {
      console.error("Supabase connection error:", healthError);
      return false;
    }

    console.log("Supabase connection successful");

    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.error("Error checking tables:", tablesError);
      return false;
    }

    const existingTables = tables ? tables.map((t) => t.table_name) : [];
    console.log("Existing tables:", existingTables);

    // Create tables if they don't exist
    const createPromises = [];

    if (!existingTables.includes(MESSAGES_TABLE)) {
      console.log(`Creating ${MESSAGES_TABLE} table...`);
      createPromises.push(createMessagesTable());
    }

    if (!existingTables.includes(CONVERSATION_TABLE)) {
      console.log(`Creating ${CONVERSATION_TABLE} table...`);
      createPromises.push(createConversationsTable());
    }

    if (!existingTables.includes(CONTEXT_TABLE)) {
      console.log(`Creating ${CONTEXT_TABLE} table...`);
      createPromises.push(createContextTable());
    }

    if (createPromises.length > 0) {
      await Promise.all(createPromises);
      console.log("All tables created successfully");
    } else {
      console.log("All required tables already exist");
    }

    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  }
}

/**
 * Creates the messages table
 */
async function createMessagesTable() {
  const { error } = await supabase.rpc("create_messages_table", {
    messages_table_name: MESSAGES_TABLE,
  });

  if (error) {
    console.error(`Error creating ${MESSAGES_TABLE} table:`, error);

    // Try direct SQL as fallback
    const { error: sqlError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE} (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          sequence INTEGER NOT NULL,
          context_id TEXT,
          references_message_ids TEXT[]
        );
        CREATE INDEX IF NOT EXISTS idx_${MESSAGES_TABLE}_session_id ON ${MESSAGES_TABLE} (session_id);
      `,
    });

    if (sqlError) {
      console.error("SQL fallback error:", sqlError);
      throw sqlError;
    }
  }
}

/**
 * Creates the conversations table
 */
async function createConversationsTable() {
  const { error } = await supabase.rpc("create_conversations_table", {
    conversations_table_name: CONVERSATION_TABLE,
  });

  if (error) {
    console.error(`Error creating ${CONVERSATION_TABLE} table:`, error);

    // Try direct SQL as fallback
    const { error: sqlError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ${CONVERSATION_TABLE} (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
          summary TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_${CONVERSATION_TABLE}_user_id ON ${CONVERSATION_TABLE} (user_id);
      `,
    });

    if (sqlError) {
      console.error("SQL fallback error:", sqlError);
      throw sqlError;
    }
  }
}

/**
 * Creates the context table
 */
async function createContextTable() {
  const { error } = await supabase.rpc("create_context_table", {
    context_table_name: CONTEXT_TABLE,
  });

  if (error) {
    console.error(`Error creating ${CONTEXT_TABLE} table:`, error);

    // Try direct SQL as fallback
    const { error: sqlError } = await supabase.rpc("execute_sql", {
      sql_query: `
        CREATE TABLE IF NOT EXISTS ${CONTEXT_TABLE} (
          session_id TEXT PRIMARY KEY,
          topic TEXT,
          name TEXT,
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          last_update_time TIMESTAMP WITH TIME ZONE NOT NULL,
          message_count INTEGER NOT NULL,
          detected_entities TEXT[]
        );
      `,
    });

    if (sqlError) {
      console.error("SQL fallback error:", sqlError);
      throw sqlError;
    }
  }
}

// Define a more specific type for the details
export type DatabaseDetails = {
  version?: string;
  message?: string;
  [key: string]: unknown;
};

// Function to test database connection
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: DatabaseDetails;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase is not configured. Check your environment variables.",
    };
  }

  try {
    // Attempt to get server version
    const { data, error } = await supabase.rpc("version");

    if (error) {
      return {
        success: false,
        message: "Failed to connect to Supabase",
        details: { ...error } as DatabaseDetails,
      };
    }

    return {
      success: true,
      message: "Successfully connected to Supabase",
      details: data as DatabaseDetails,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error testing database connection",
      details: { error: String(error) } as DatabaseDetails,
    };
  }
}
