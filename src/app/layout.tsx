import type { Metadata, Viewport } from "next";
import "../globals.css";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { SoundProvider } from "@/context/SoundContext";
import { AppHeader } from "@/components/AppHeader";
import { APP_INFO } from "@/utils/constants";
import { Press_Start_2P, VT323 } from "next/font/google";

// Configure the fonts
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-press-start-2p",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-vt323",
});

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
    <html
      lang="en"
      style={{ overflow: "hidden", height: "100%" }}
      className={`${pressStart2P.variable} ${vt323.variable}`}
    >
      <head>
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
