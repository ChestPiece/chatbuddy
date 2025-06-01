"use client";

import { useEffect } from "react";
import { initializeDatabase } from "@/utils/databaseInit";

export function DatabaseInitializer() {
  useEffect(() => {
    // Initialize database on component mount
    const initDb = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error("Failed to initialize database:", error);
      }
    };

    initDb();
  }, []);

  // This component doesn't render anything
  return null;
}
