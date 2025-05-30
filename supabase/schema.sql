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
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  last_update_time TIMESTAMP WITH TIME ZONE NOT NULL,
  message_count INTEGER NOT NULL,
  detected_entities TEXT[]
);

-- Create RLS (Row Level Security) policies for chat_messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage only their own messages
-- This is important for when you implement authentication later
CREATE POLICY chat_messages_policy ON chat_messages
  USING (true)  -- In this simplified version, we allow all operations
  WITH CHECK (true);

-- Create RLS policies for conversation_contexts
ALTER TABLE conversation_contexts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to manage only their own conversation contexts
CREATE POLICY conversation_contexts_policy ON conversation_contexts
  USING (true)  -- In this simplified version, we allow all operations
  WITH CHECK (true);

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