"use client";

import { useState, useEffect } from "react";
import { BOOT_SEQUENCE_STEPS } from "@/utils/constants";

interface BootSequenceProps {
  onComplete: () => void;
  speed?: number;
}

export default function BootSequence({
  onComplete,
  speed = 700,
}: BootSequenceProps) {
  const [bootStep, setBootStep] = useState(0);

  // Boot sequence animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bootStep < BOOT_SEQUENCE_STEPS.length - 1) {
        setBootStep((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [bootStep, onComplete, speed]);

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
          {BOOT_SEQUENCE_STEPS.slice(0, bootStep + 1).map((step, i) => (
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
                width: `${
                  (bootStep / (BOOT_SEQUENCE_STEPS.length - 1)) * 100
                }%`,
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
