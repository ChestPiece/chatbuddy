# AI Chatbot with Supabase Database

This is a Next.js chatbot application that uses OpenAI's API and Supabase for persistent storage.

## Features

- Real-time chat with OpenAI's GPT models
- Context-aware conversations
- Persistent chat history with Supabase
- Fallback to localStorage when Supabase is not configured
- Retro UI with typing effects, loading indicators, and sound effects

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a Supabase account at https://supabase.com/
2. Create a new project
3. Go to SQL Editor in the Supabase dashboard
4. Copy the contents of `supabase/schema.sql` from this project
5. Paste the SQL into the SQL Editor and run it to create the necessary tables

### 4. Configure environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# OpenAI Model (optional - defaults to gpt-3.5-turbo)
# OPENAI_MODEL=gpt-4-turbo

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find your Supabase URL and anon key in the Supabase dashboard under Project Settings > API.

### 5. Run the application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Database Fallback

The application is designed to gracefully fall back to using localStorage if:

- Supabase credentials are not provided
- There's a connection issue with Supabase
- The database operations fail for any reason

You'll see a storage indicator in the status bar that shows whether your chat is using the database (DB) or local storage (LOCAL).

## Customization

### Changing the OpenAI model

You can change the OpenAI model by setting the `OPENAI_MODEL` environment variable in your `.env.local` file. Supported models include:

- gpt-3.5-turbo (default)
- gpt-4-turbo
- gpt-4

### Implementing authentication

This project is set up with Row Level Security (RLS) policies in Supabase, making it ready for implementing user authentication. To add authentication:

1. Follow the Supabase Auth documentation to set up authentication
2. Update the RLS policies to use the authenticated user's ID
3. Modify the app to store user-specific sessions

## License

[MIT](LICENSE)
