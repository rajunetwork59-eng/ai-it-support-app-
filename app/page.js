"use client";

import { useState } from "react";
import Link from "next/link";

const PURPLE = "#4C2A8C";

const priorityColor = {
  Critical: "#B23B3B",
  High: "#C9762D",
  Medium: "#4C2A8C",
  Low: "#2E7D32",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const classifyRes = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const classified = await classifyRes.json();

      if (classified.error) {
        setError(classified.error);
        setLoading(false);
        return;
      }

      const status = classified.auto_resolve ? "auto-resolved" : "open";

      await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_query: query,
          category: classified.category,
          priority: classified.priority,
          ai_response: classified.ai_response,
          status,
        }),
      });

      setResult({ ...classified, status });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: PURPLE, marginBottom: 4 }}>AI IT Support Assistant</h1>
          <p style={{ color: "#666", margin: 0 }}>TechNova Solutions — demo helpdesk chatbot</p>
        </div>
        <Link href="/dashboard" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
          Dashboard →
        </Link>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your issue... e.g. 'I forgot my password and can't log in'"
          rows={4}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 15,
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            background: PURPLE,
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Analyzing..." : "Submit Ticket"}
        </button>
      </form>

      {error && (
        <div style={{ background: "#FDECEA", color: "#B23B3B", padding: 14, borderRadius: 8, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <span style={{ background: "#F2EEFA", color: PURPLE, padding: "4px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
              {result.category}
            </span>
            <span
              style={{
                background: (priorityColor[result.priority] || PURPLE) + "20",
                color: priorityColor[result.priority] || PURPLE,
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {result.priority} priority
            </span>
            <span style={{ background: "#eee", color: "#555", padding: "4px 10px", borderRadius: 20, fontSize: 13 }}>
              {result.status === "auto-resolved" ? "Auto-resolved" : "Escalated to human agent"}
            </span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{result.ai_response}</p>
          <p style={{ fontSize: 12, color: "#999", marginTop: 12 }}>
            Classified by: {result.source === "gemini" ? "Gemini AI" : "Rule-based fallback"}
          </p>
        </div>
      )}
    </main>
  );
}
