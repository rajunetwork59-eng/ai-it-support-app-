"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PURPLE = "#4C2A8C";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ color: PURPLE, marginBottom: 4 }}>Log In</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 24 }}>AI IT Support Assistant</p>

      <form onSubmit={handleLogin}>
        <label style={{ fontSize: 13, color: "#444" }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <label style={{ fontSize: 13, color: "#444" }}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: "#B23B3B", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p style={{ marginTop: 20, fontSize: 14, color: "#666" }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: PURPLE, fontWeight: 600 }}>Sign up</Link>
      </p>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginTop: 4,
  marginBottom: 16,
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  background: PURPLE,
  color: "white",
  border: "none",
  padding: 12,
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
