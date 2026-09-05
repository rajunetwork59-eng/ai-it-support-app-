"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PURPLE = "#4C2A8C";

// Turns any http(s) URLs in a plain-text message into clickable links.
function renderWithLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    part.startsWith("http://") || part.startsWith("https://") ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "inherit", textDecoration: "underline", wordBreak: "break-all" }}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function Chat() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your AI assistant. Ask me anything — IT issues or anything else." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const bottomRef = useRef(null);

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", text: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  if (checkingAuth) {
    return <main style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading...</main>;
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", height: "100vh", boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ color: PURPLE, margin: 0, fontSize: 22 }}>AI Chat Assistant</h1>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>New Ticket</Link>
          <Link href="/dashboard" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>Dashboard</Link>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 12 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
              background: m.role === "user" ? PURPLE : "white",
              color: m.role === "user" ? "white" : "#222",
              padding: "10px 14px",
              borderRadius: 14,
              borderBottomRightRadius: m.role === "user" ? 4 : 14,
              borderBottomLeftRadius: m.role === "assistant" ? 4 : 14,
              boxShadow: m.role === "assistant" ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {renderWithLinks(m.text)}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", color: "#999", fontSize: 13, padding: "0 4px" }}>
            AI is typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8, paddingTop: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            fontSize: 15,
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            background: PURPLE,
            color: "white",
            border: "none",
            padding: "0 20px",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </form>
    </main>
  );
}
