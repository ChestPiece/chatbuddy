-- Create the chat_messages table to store all chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sequence INTEGER NOT NULL,
  context_id TEXT,
  references_message_ids TEXT[]
);

-- Create index on session_id to optimize queries by session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Create index on sequence to optimize ordering
CREATE INDEX IF NOT EXISTS idx_chat_messages_sequence ON chat_messages(sequence);

-- Create the conversation_contexts table to store context information
CREATE TABLE IF NOT EXISTS conversation_contexts (
  session_id UUID PRIMARY KEY,
  topic TEXT,
  name TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  last_update_time TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER NOT NULL,
  detected_entities TEXT[]
);

-- Enable Row Level Security on the chat_messages table
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows access only to messages with matching session_id
-- This ensures clients can only access their own data without needing authentication
CREATE POLICY chat_messages_policy ON chat_messages
  USING (session_id::text = current_setting('app.session_id', true))
  WITH CHECK (session_id::text = current_setting('app.session_id', true));

-- Enable Row Level Security on the conversation_contexts table
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows access only to contexts with matching session_id
CREATE POLICY conversation_contexts_policy ON conversation_contexts
  USING (session_id::text = current_setting('app.session_id', true))
  WITH CHECK (session_id::text = current_setting('app.session_id', true));

-- Create a function to clean up old messages (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_chats()
RETURNS void AS $$
BEGIN
  -- Delete messages older than 30 days
  DELETE FROM chat_messages 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete contexts with no recent updates
  DELETE FROM conversation_contexts 
  WHERE last_update_time < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Function to set the session_id for RLS policies
CREATE OR REPLACE FUNCTION set_session_id(sid text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.session_id', sid, false);
END;
$$ LANGUAGE plpgsql; 