import React, { useEffect, useState, useCallback } from "react";
import { adminGet, fmtDate, formatINR } from "./adminApi";

const th = { padding: "12px", color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textAlign: "left" };
const td = { padding: "12px 12px", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.03)" };

const statusColor = (s) => (s === "ACTIVE" ? "#10B981" : s === "PENDING_APPROVAL" ? "#F59E0B" : "#EF4444");

const AdminUsers = () => {
  const [data, setData] = useState({ users: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await adminGet("/users", { page, limit: 20, search: search || undefined });
      setData(res);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load users");
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="glass-card p-5">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 }}>
        <h3 style={{ margin: 0 }}>Users <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>({data.pagination.total})</span></h3>
        <input
          placeholder="Search email…"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "#fff", outline: "none" }}
        />
      </div>

      {error && <p style={{ color: "#EF4444" }}>{error}</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={th}>EMAIL</th><th style={th}>SIGNED UP</th><th style={th}>PLAN</th>
            <th style={th}>STATUS</th><th style={th}>KYC</th><th style={th}>LAST LOGIN</th><th style={th}>WALLET</th>
          </tr></thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td style={td}>{u.email}{u.role === "admin" && <span style={{ marginLeft: 6, fontSize: 10, color: "var(--accent-gold)" }}>ADMIN</span>}</td>
                <td style={td}>{fmtDate(u.signupDate)}</td>
                <td style={td}>{u.plan}</td>
                <td style={{ ...td, color: statusColor(u.accountStatus), fontWeight: 700, fontSize: 12 }}>{u.accountStatus}</td>
                <td style={{ ...td, color: u.kyc === "COMPLETE" ? "#10B981" : "#F59E0B", fontSize: 12 }}>{u.kyc}</td>
                <td style={td}>{fmtDate(u.lastLogin)}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 700 }}>{formatINR(u.walletBalance)}</td>
              </tr>
            ))}
            {!loading && data.users.length === 0 && <tr><td style={{ ...td, textAlign: "center", padding: 30 }} colSpan={7}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 16 }}>
        <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="btn">Prev</button>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Page {data.pagination.page} / {data.pagination.totalPages}</span>
        <button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((p) => p + 1)} className="btn">Next</button>
      </div>
    </div>
  );
};

export default AdminUsers;
