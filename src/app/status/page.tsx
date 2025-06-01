"use client";

import { useState, useEffect } from "react";
import {
  testDatabaseConnection,
  type DatabaseDetails,
} from "@/utils/setupDatabase";
import { isSupabaseConfigured } from "@/utils/supabase";

interface ApiStatus {
  success: boolean;
  message: string;
  details?: DatabaseDetails;
}

export default function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        setLoading(true);

        // First check if Supabase is configured
        const isConfigured = isSupabaseConfigured();

        if (!isConfigured) {
          setStatus({
            success: false,
            message:
              "Supabase is not configured properly. Check your environment variables.",
          });
          return;
        }

        // Test the database connection
        const result = await testDatabaseConnection();
        setStatus(result);
      } catch (err) {
        console.error("Error checking status:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, []);

  const runDatabaseSetup = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/database-setup");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Error setting up database:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">ChatBuddy System Status</h1>

      {loading ? (
        <div className="text-center p-8">
          <p>Loading status...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      ) : (
        <div>
          <div
            className={`p-4 rounded mb-6 ${
              status?.success
                ? "bg-green-100 border border-green-400"
                : "bg-red-100 border border-red-400"
            }`}
          >
            <h2 className="text-xl font-semibold mb-2">
              Database Connection:{" "}
              {status?.success ? "Connected" : "Not Connected"}
            </h2>
            <p className="mb-2">{status?.message}</p>

            {!status?.success && (
              <button
                onClick={runDatabaseSetup}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                disabled={loading}
              >
                Initialize Database
              </button>
            )}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Environment Status:</h3>
            <p>
              NEXT_PUBLIC_SUPABASE_URL:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Not set"}
            </p>
            <p>
              NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? "✅ Set"
                : "❌ Not set"}
            </p>
          </div>

          {status?.details && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Details:</h3>
              <pre className="bg-gray-800 text-white p-4 rounded overflow-auto">
                {JSON.stringify(status.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
