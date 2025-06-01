-- SQL to add the missing 'name' column to the conversation_contexts table
ALTER TABLE conversation_contexts ADD COLUMN IF NOT EXISTS name TEXT; 