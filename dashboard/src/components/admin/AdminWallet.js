import React, { useEffect, useState } from "react";
import { adminGet, fmtDate, formatINR } from "./adminApi";
import { AlertTriangle } from "lucide-react";

const th = { padding: "12px", color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textAlign: "left" };
const td = { padding: "12px", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.03)" };
const statusColor = (s) => (s === "SUCCESS" ? "#10B981" : s === "PENDING_RECONCILIATION" ? "#F59E0B" : s === "FAILED" ? "#EF4444" : "var(--text-dim)");

const AdminWallet = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminGet("/wallet").then(setData).catch((e) => setError(e.response?.data?.message || "Failed to load wallet overview"));
  }, []);

  if (error) return <div className="glass-card p-5" style={{ color: "#EF4444" }}>{error}</div>;
  if (!data) return <div className="glass-card p-5" style={{ color: "var(--text-dim)" }}>Loading…</div>;

  const Table = ({ rows }) => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
          <th style={th}>USER</th><th style={th}>TYPE</th><th style={th}>AMOUNT</th><th style={th}>STATUS</th><th style={th}>ORDER ID</th><th style={th}>DATE</th>
        </tr></thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td style={td}>{t.user}</td>
              <td style={td}>{t.type}</td>
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatINR(t.amount)}</td>
              <td style={{ ...td, color: statusColor(t.status), fontWeight: 700, fontSize: 12 }}>{t.status}</td>
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>{t.razorpayOrderId}</td>
              <td style={td}>{fmtDate(t.date)}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td style={{ ...td, textAlign: "center", padding: 24 }} colSpan={6}>None.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div className="glass-card p-5" style={{ flex: 1, minWidth: 220 }}>
          <p style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Total platform wallet balance</p>
          <p style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--accent-gold)", margin: 0 }}>{formatINR(data.totalPlatformBalance)}</p>
        </div>
        <div className="glass-card p-5" style={{ flex: 1, minWidth: 220, borderColor: data.pendingReconciliationCount > 0 ? "#F59E0B" : "var(--border)" }}>
          <p style={{ fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px", display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={13} /> Pending reconciliation
          </p>
          <p style={{ fontSize: 28, fontFamily: "var(--font-mono)", fontWeight: 800, color: data.pendingReconciliationCount > 0 ? "#F59E0B" : "#10B981", margin: 0 }}>{data.pendingReconciliationCount}</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 style={{ marginTop: 0, color: "#F59E0B" }}>⚠ Pending reconciliation — check daily</h3>
        <p style={{ color: "var(--text-dim)", fontSize: 13, marginTop: -6 }}>Payments confirmed but not yet credited to a wallet.</p>
        <Table rows={data.pendingReconciliation} />
      </div>

      <div className="glass-card p-5">
        <h3 style={{ marginTop: 0 }}>Recent transactions (add-funds)</h3>
        {!data.withdrawalsSupported && <p style={{ color: "var(--text-dim)", fontSize: 12, marginTop: -6 }}>Note: withdrawals are not implemented; only deposits are recorded.</p>}
        <Table rows={data.recentTransactions} />
      </div>
    </div>
  );
};

export default AdminWallet;
