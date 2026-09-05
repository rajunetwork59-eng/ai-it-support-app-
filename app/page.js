"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const PURPLE = "#4C2A8C";

const DEPARTMENTS = ["IT", "Sales", "HR", "Finance", "Operations", "Marketing", "Support", "Other"];

const priorityColor = {
  Critical: "#B23B3B",
  High: "#C9762D",
  Medium: "#4C2A8C",
  Low: "#2E7D32",
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("IT");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setCheckingAuth(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || !name.trim()) return;
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

      const { error: insertError } = await supabase.from("tickets").insert([
        {
          user_query: query,
          category: classified.category,
          priority: classified.priority,
          ai_response: classified.ai_response,
          status,
          user_id: user.id,
          user_email: user.email,
          raised_by_name: name,
          department,
        },
      ]);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }

      setResult({ ...classified, status });
      setQuery("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (checkingAuth) {
    return <main style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading...</main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: PURPLE, marginBottom: 4 }}>AI IT Support Assistant</h1>
          <p style={{ color: "#666", margin: 0 }}>{user?.email}</p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/chat" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
            Chat
          </Link>
          <Link href="/dashboard" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
            Dashboard
          </Link>
          <button
            onClick={handleLogout}
            style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: "#666" }}
          >
            Log out
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raju"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Department</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <label style={labelStyle}>Describe your issue</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'I forgot my password and can't log in'"
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

const labelStyle = { fontSize: 12, color: "#666", display: "block", marginBottom: 4 };
const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  boxSizing: "border-box",
  fontFamily: "inherit",
};
