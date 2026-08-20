"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary caught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ backgroundColor: "#FAF3F0", color: "#19171A", fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: "20px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#E8503A", marginBottom: "1rem" }}>Application Error</h1>
          <p style={{ color: "#64748b", maxWidth: "400px", marginBottom: "1.5rem" }}>
            A critical system error occurred. Please try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "#E8503A",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              padding: "10px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
