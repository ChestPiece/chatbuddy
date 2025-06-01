import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return the current environment variable status (without revealing the actual values)
    return NextResponse.json({
      success: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL: {
          set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...`
            : null,
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          set: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          // Show only a hint of the key to verify it's correct without revealing it all
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...`
            : null,
        },
        OPENAI_API_KEY: {
          set: !!process.env.OPENAI_API_KEY,
          value: process.env.OPENAI_API_KEY
            ? `${process.env.OPENAI_API_KEY.substring(0, 7)}...`
            : null,
        },
      },
      fixInstructions: `
To fix your environment variables:

1. Make sure you have a file named '.env.local' in the root of your project
2. Ensure it contains the following variables (without any line breaks or extra spaces):

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

3. Restart the development server with 'npm run dev'

If issues persist, try the following:
- Delete the '.next' folder and restart the server
- Make sure there are no syntax errors in your .env.local file
- Verify your Supabase credentials in the Supabase dashboard
      `,
    });
  } catch (error) {
    console.error("Error in fix-env API:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error checking environment variables",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
