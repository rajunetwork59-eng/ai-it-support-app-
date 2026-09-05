"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const PURPLE = "#4C2A8C";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((d) => {
        setTickets(d.tickets || []);
        setLoading(false);
      });
  }, []);

  const total = tickets.length;
  const autoResolved = tickets.filter((t) => t.status === "auto-resolved").length;
  const escalated = tickets.filter((t) => t.status === "open").length;
  const automationRate = total ? Math.round((autoResolved / total) * 100) : 0;

  const byCategory = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: PURPLE, margin: 0 }}>Support Dashboard</h1>
        <Link href="/" style={{ color: PURPLE, fontWeight: 600, textDecoration: "none" }}>
          ← New Ticket
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        <Kpi label="Total Tickets" value={total} />
        <Kpi label="Auto-Resolved" value={autoResolved} />
        <Kpi label="Escalated" value={escalated} />
        <Kpi label="Automation Rate" value={`${automationRate}%`} />
      </div>

      <h2 style={{ color: PURPLE, fontSize: 18 }}>Tickets by Category</h2>
      <div style={{ marginBottom: 32 }}>
        {Object.entries(byCategory).map(([cat, count]) => (
          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 220, fontSize: 13, color: "#444" }}>{cat}</div>
            <div style={{ flex: 1, background: "#eee", borderRadius: 6, height: 14 }}>
              <div
                style={{
                  width: `${(count / total) * 100}%`,
                  background: PURPLE,
                  height: 14,
                  borderRadius: 6,
                }}
              />
            </div>
            <div style={{ width: 24, fontSize: 13, color: "#444" }}>{count}</div>
          </div>
        ))}
      </div>

      <h2 style={{ color: PURPLE, fontSize: 18 }}>Recent Tickets</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 10, overflow: "hidden" }}>
          <thead>
            <tr style={{ background: PURPLE, color: "white", textAlign: "left" }}>
              <th style={{ padding: 10 }}>Query</th>
              <th style={{ padding: 10 }}>Category</th>
              <th style={{ padding: 10 }}>Priority</th>
              <th style={{ padding: 10 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 10, maxWidth: 260 }}>{t.user_query}</td>
                <td style={{ padding: 10 }}>{t.category}</td>
                <td style={{ padding: 10 }}>{t.priority}</td>
                <td style={{ padding: 10 }}>{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

function Kpi({ label, value }) {
  return (
    <div style={{ background: "white", borderRadius: 10, padding: 16, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: PURPLE }}>{value}</div>
      <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{label}</div>
    </div>
  );
}
