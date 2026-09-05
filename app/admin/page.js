"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const PURPLE = "#4C2A8C";
const STATUS_OPTIONS = ["open", "in-progress", "auto-resolved", "resolved"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [deptFilter, setDeptFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUser(userData.user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      const admin = profile?.role === "admin";
      setIsAdmin(admin);

      if (admin) {
        const { data: ticketData } = await supabase
          .from("tickets")
          .select("*")
          .order("created_at", { ascending: false });
        setTickets(ticketData || []);
      }
      setChecking(false);
    }
    load();
  }, [router]);

  async function updateStatus(id, status) {
    await supabase.from("tickets").update({ status }).eq("id", id);
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  if (checking) {
    return <main style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading...</main>;
  }

  if (!isAdmin) {
    return (
      <main style={{ maxWidth: 500, margin: "80px auto", padding: 20, textAlign: "center" }}>
        <h2 style={{ color: PURPLE }}>Admin access only</h2>
        <p style={{ color: "#666" }}>Your account ({user?.email}) doesn&apos;t have admin access.</p>
        <Link href="/" style={{ color: PURPLE, fontWeight: 600 }}>← Back to app</Link>
      </main>
    );
  }

  const departments = ["All", ...new Set(tickets.map((t) => t.department).filter(Boolean))];
  const priorities = ["All", "Critical", "High", "Medium", "Low"];

  const filtered = tickets.filter(
    (t) =>
      (deptFilter === "All" || t.department === deptFilter) &&
      (priorityFilter === "All" || t.priority === priorityFilter)
  );

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 style={{ color: PURPLE, margin: 0 }}>Admin — All Tickets</h1>
        <Link href="/" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>← New Ticket</Link>
      </div>
      <p style={{ color: "#888", marginTop: 0, marginBottom: 20, fontSize: 13 }}>
        Logged in as admin: {user?.email} · {tickets.length} total tickets
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontSize: 12, color: "#666", display: "block" }}>Department</label>
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={selectStyle}>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#666", display: "block" }}>Priority</label>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={selectStyle}>
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#888" }}>No tickets match this filter.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 10, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: PURPLE, color: "white", textAlign: "left" }}>
              <th style={thStyle}>Raised By</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Query</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Priority</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>{t.raised_by_name || "—"}</td>
                <td style={tdStyle}>{t.user_email || "—"}</td>
                <td style={tdStyle}>{t.department || "—"}</td>
                <td style={{ ...tdStyle, maxWidth: 220 }}>{t.user_query}</td>
                <td style={tdStyle}>{t.category}</td>
                <td style={tdStyle}>{t.priority}</td>
                <td style={tdStyle}>
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    style={{ ...selectStyle, padding: 6 }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const selectStyle = {
  padding: 8,
  borderRadius: 6,
  border: "1px solid #ddd",
  fontSize: 13,
  fontFamily: "inherit",
};
const thStyle = { padding: 10, fontSize: 13 };
const tdStyle = { padding: 10, fontSize: 13 };
