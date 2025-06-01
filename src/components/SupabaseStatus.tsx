import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/utils/supabase";

export default function SupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        setIsConfigured(isSupabaseConfigured());

        // Check if we can connect to Supabase by making a simple query
        const response = await fetch("/api/status/database", {
          method: "GET",
        });
        const data = await response.json();
        setIsOnline(data.online);
      } catch (error) {
        console.error("Error checking Supabase status:", error);
        setIsOnline(false);
      } finally {
        setLoading(false);
      }
    };

    checkSupabase();
  }, []);

  if (loading) {
    return (
      <div className="text-xs text-gray-500 flex items-center">
        <div className="animate-pulse bg-gray-600 h-2 w-2 rounded-full mr-2"></div>
        Checking database...
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="text-xs text-amber-500 flex items-center">
        <div className="bg-amber-500 h-2 w-2 rounded-full mr-2"></div>
        Local storage (Database not configured)
      </div>
    );
  }

  return (
    <div
      className={`text-xs flex items-center ${
        isOnline ? "text-green-500" : "text-red-500"
      }`}
    >
      <div
        className={`h-2 w-2 rounded-full mr-2 ${
          isOnline ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      {isOnline
        ? "Database connected"
        : "Database offline (using local storage)"}
    </div>
  );
}
