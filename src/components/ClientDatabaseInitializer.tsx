"use client";

import dynamic from "next/dynamic";

// Dynamically import the DatabaseInitializer with no SSR
const DatabaseInitializer = dynamic(
  () =>
    import("@/components/DatabaseInitializer").then(
      (mod) => mod.DatabaseInitializer
    ),
  { ssr: false }
);

export function ClientDatabaseInitializer() {
  return <DatabaseInitializer />;
}
