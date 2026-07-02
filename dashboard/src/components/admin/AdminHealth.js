import React, { useEffect, useState } from "react";
import { adminGet, fmtDate } from "./adminApi";
import { Database, Radio, Mail, Clock } from "lucide-react";

const tone = (ok) => (ok ? "#10B981" : "#EF4444");
const priceColor = (m) => (m === "LIVE" ? "#10B981" : m === "DEGRADED" ? "#F59E0B" : m === "MOCK" ? "#EF4444" : "var(--text-dim)");

const Card = ({ icon: Icon, title, children, color }) => (
  <div className="glass-card p-5" style={{ flex: 1, minWidth: 240 }}>
    <p style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
      <Icon size={14} /> {title}
    </p>
    <div style={{ fontSize: 20, fontWeight: 800, color: color || "#fff" }}>{children}</div>
  </div>
);

const AdminHealth = () => {
  const [h, setH] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = () => adminGet("/health").then((r) => setH(r.health)).catch((e) => setError(e.response?.data?.message || "Failed to load system health"));
    load();
    const id = setInterval(load, 15000); // refresh every 15s
    return () => clearInterval(id);
  }, []);

  if (error) return <div className="glass-card p-5" style={{ color: "#EF4444" }}>{error}</div>;
  if (!h) return <div className="glass-card p-5" style={{ color: "var(--text-dim)" }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Card icon={Database} title="Database" color={tone(h.database.status === "CONNECTED")}>
          {h.database.status}
        </Card>
        <Card icon={Radio} title="Price feed (Yahoo)" color={priceColor(h.priceFeed.mode)}>
          {h.priceFeed.mode}
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)", marginTop: 4 }}>
            {h.priceFeed.note || `${h.priceFeed.mockSymbols}/${h.priceFeed.symbols} symbols on mock data`}
          </div>
        </Card>
        <Card icon={Mail} title="Failed / queued emails" color={h.emails.queued > 0 ? "#F59E0B" : "#10B981"}>
          {h.emails.queued} queued
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)", marginTop: 4 }}>{h.emails.sentAfterRetry} sent after retry</div>
        </Card>
        <Card icon={Clock} title="GTT expiry job" color="#fff">
          <div style={{ fontSize: 15 }}>{fmtDate(h.gttExpiryJob.lastRun)}</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-dim)", marginTop: 4 }}>
            {h.gttExpiryJob.lastRun ? `last expired ${h.gttExpiryJob.lastExpiredCount} orders` : "has not run yet"}
          </div>
        </Card>
      </div>
      <p style={{ color: "var(--text-dim)", fontSize: 12 }}>Server time: {fmtDate(h.serverTime)} · auto-refresh 15s</p>
    </div>
  );
};

export default AdminHealth;
