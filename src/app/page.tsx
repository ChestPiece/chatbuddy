"use client";

import { useState, useEffect } from "react";
import { Chat } from "@/components/Chat";

export default function Home() {
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [clientReady, setClientReady] = useState(false);

  // Boot sequence steps
  const bootSteps = [
    "INITIALIZING SYSTEM...",
    "LOADING NEURAL INTERFACE...",
    "ESTABLISHING OPENAI LINK...",
    "CALIBRATING RESPONSE ALGORITHMS...",
    "ACTIVATING CONVERSATION MODULE...",
    "SYSTEM READY",
  ];

  // Mark client as ready after mount
  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    // Boot sequence animation - only run on client
    if (clientReady && bootSequence) {
      const timer = setTimeout(() => {
        if (bootStep < bootSteps.length - 1) {
          setBootStep((prev) => prev + 1);
        } else {
          setBootSequence(false);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [bootSequence, bootStep, bootSteps.length, clientReady]);

  // Check if API key is missing by making a request to the status API
  useEffect(() => {
    if (!clientReady) return;

    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setApiKeyMissing(!data.hasApiKey);
      } catch (error) {
        console.error("Error checking API key:", error);
      }
    };

    checkApiKey();
  }, [clientReady]);

  if (bootSequence) {
    return (
      <div
        className="boot-sequence"
        style={{
          backgroundColor: "#000",
          color: "#00ff00",
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Press Start 2P', monospace",
          padding: "2rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="scanlines" style={{ opacity: 0.1 }}></div>
        <div
          style={{
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              marginBottom: "2rem",
              color: "#3b82f6",
            }}
          >
            CHAT BUDDY INTERFACE
          </h1>

          <div style={{ textAlign: "left", marginBottom: "2rem" }}>
            {bootSteps.slice(0, bootStep + 1).map((step, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "0.5rem",
                  opacity: i === bootStep ? 1 : 0.7,
                  fontSize: "0.75rem",
                }}
              >
                &gt; {step}
                {i === bootStep && <span className="cursor">_</span>}
              </div>
            ))}
          </div>

          {bootStep >= 3 && (
            <div
              style={{
                width: "100%",
                height: "10px",
                backgroundColor: "#111",
                marginBottom: "1rem",
                position: "relative",
                border: "1px solid #333",
              }}
            >
              <div
                style={{
                  width: `${(bootStep / (bootSteps.length - 1)) * 100}%`,
                  height: "100%",
                  backgroundColor: "#3b82f6",
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          )}
        </div>

        <style jsx>{`
          .cursor {
            animation: blink 1s step-start infinite;
          }

          @keyframes blink {
            50% {
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div
        className="tv-static"
        style={{
          opacity: 0.02,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: "none",
        }}
      ></div>
      <div
        className="scanlines"
        style={{
          opacity: 0.1,
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      ></div>

      {/* Add TV scan line effect */}
      <div
        className="tv-scan"
        style={{
          position: "fixed",
          zIndex: 3,
        }}
      ></div>

      {/* Add pixel noise */}
      <div
        className="pixel-noise"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          opacity: 0.03,
          pointerEvents: "none",
        }}
      ></div>

      <div
        className="main-container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          maxHeight: "100%",
          overflow: "hidden",
          backgroundColor: "var(--background)",
          position: "relative",
        }}
      >
        {/* CRT screen power-on effect with enhanced flicker */}
        <div
          className="crt-flicker"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at center, rgba(120, 220, 232, 0.05), transparent 80%)",
            pointerEvents: "none",
            zIndex: 3,
            opacity: 0.8,
          }}
        ></div>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight:
              "100vh" /* Use full viewport height now that header is removed */,
            position: "relative",
          }}
        >
          {apiKeyMissing ? (
            <div
              className="api-key-warning pixel-box"
              style={{
                margin: "1rem",
                padding: "1rem",
                backgroundColor: "var(--retro-red)",
                color: "white",
                textAlign: "center",
                fontFamily: "var(--pixel-font)",
                letterSpacing: "1px",
              }}
            >
              <h2
                style={{ textTransform: "uppercase", marginBottom: "0.5rem" }}
              >
                API Key Missing
              </h2>
              <p>
                Please configure your OpenAI API key in the server environment
                variables to use Chat Buddy.
              </p>
            </div>
          ) : (
            <Chat />
          )}
        </main>
      </div>
    </>
  );
}
