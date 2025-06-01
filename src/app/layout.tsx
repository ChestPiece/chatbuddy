import type { Metadata, Viewport } from "next";
import "../globals.css";
import React from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { SoundProvider } from "@/context/SoundContext";
import { ToastProvider } from "@/context/ToastContext";
import { AppHeader } from "@/components/AppHeader";
import { APP_INFO } from "@/utils/constants";
import { Press_Start_2P, VT323 } from "next/font/google";
import { ClientDatabaseInitializer } from "@/components/ClientDatabaseInitializer";
import Script from "next/script";

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
  manifest: "/manifest.json",
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
        <link
          rel="apple-touch-icon"
          href="/images/app-icons/icon-192x192.png"
        />
      </head>
      <body style={{ overflow: "hidden", height: "100%" }}>
        <ThemeProvider>
          <SoundProvider>
            <ToastProvider>
              {/* Database initializer will run on the client-side only */}
              <ClientDatabaseInitializer />
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
            </ToastProvider>
          </SoundProvider>
        </ThemeProvider>

        {/* Service Worker Registration */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                  })
                  .catch(error => {
                    console.error('Service Worker registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
