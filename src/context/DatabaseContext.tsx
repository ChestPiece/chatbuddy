"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { initializeDatabase } from "@/utils/databaseInit";

type DatabaseContextType = {
  initialized: boolean;
  error: string | null;
};

const initialState: DatabaseContextType = {
  initialized: false,
  error: null,
};

const DatabaseContext = createContext<DatabaseContextType>(initialState);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setInitialized(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    init();
  }, []);

  return (
    <DatabaseContext.Provider value={{ initialized, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}
