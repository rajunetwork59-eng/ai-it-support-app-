"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PURPLE = "#4C2A8C";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // If email confirmation is off in Supabase, a session is returned immediately
    if (data.session) {
      router.push("/");
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ color: PURPLE, marginBottom: 4 }}>Create Account</h1>
      <p style={{ color: "#666", marginTop: 0, marginBottom: 24 }}>Sign up for AI IT Support Assistant</p>

      {success ? (
        <div style={{ background: "#E8F5E9", color: "#2E7D32", padding: 14, borderRadius: 8 }}>
          Account created! Check your email to confirm, then{" "}
          <Link href="/login" style={{ color: "#2E7D32", fontWeight: 600 }}>log in</Link>.
        </div>
      ) : (
        <form onSubmit={handleSignup}>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {error && <p style={{ color: "#B23B3B", fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      )}

      <p style={{ marginTop: 20, fontSize: 14, color: "#666" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: PURPLE, fontWeight: 600 }}>Log in</Link>
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
