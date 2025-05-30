import type { Metadata, Viewport } from "next";
import "../globals.css";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { SoundProvider } from "@/context/SoundContext";
import { AppHeader } from "@/components/AppHeader";
import { APP_INFO } from "@/utils/constants";

export const metadata: Metadata = {
  title: APP_INFO.NAME,
  description: APP_INFO.DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#051122",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflow: "hidden", height: "100%" }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap"
          rel="stylesheet"
          as="font"
          crossOrigin="anonymous"
        />
        <meta name="theme-color" content="#051122" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body style={{ overflow: "hidden", height: "100%" }}>
        <ThemeProvider>
          <SoundProvider>
            <div
              className="app-container"
              style={{
                height: "100vh",
                maxHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <AppHeader />
              <main
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  position: "relative",
                  isolation: "isolate",
                }}
              >
                {children}
              </main>
            </div>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
