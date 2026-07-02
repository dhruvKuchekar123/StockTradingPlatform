import React, { useEffect, useState, useCallback } from "react";
import { adminGet, fmtDate } from "./adminApi";

const th = { padding: "12px", color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textAlign: "left" };
const td = { padding: "12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.03)", verticalAlign: "top" };

// Read-only view of the adminActions audit collection — proves every write is logged.
const AdminAudit = () => {
  const [data, setData] = useState({ actions: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    adminGet("/actions", { page, limit: 25 }).then(setData).catch((e) => setError(e.response?.data?.message || "Failed to load audit log"));
  }, [page]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="glass-card p-5">
      {error && <p style={{ color: "#EF4444" }}>{error}</p>}
      <h3 style={{ marginTop: 0 }}>Admin action audit log <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>({data.pagination.total})</span></h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={th}>WHEN</th><th style={th}>ADMIN</th><th style={th}>ACTION</th><th style={th}>TARGET</th><th style={th}>REASON</th><th style={th}>BEFORE → AFTER</th>
          </tr></thead>
          <tbody>
            {data.actions.map((a) => (
              <tr key={a.id}>
                <td style={td}>{fmtDate(a.timestamp)}</td>
                <td style={td}>{a.admin}</td>
                <td style={{ ...td, fontWeight: 700, color: "var(--accent-gold)" }}>{a.action}</td>
                <td style={td}>{a.targetUser || "—"}</td>
                <td style={{ ...td, maxWidth: 220 }}>{a.reason}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-dim)" }}>
                  {JSON.stringify(a.before)} → {JSON.stringify(a.after)}
                </td>
              </tr>
            ))}
            {data.actions.length === 0 && <tr><td style={{ ...td, textAlign: "center", padding: 30 }} colSpan={6}>No admin actions logged yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 16 }}>
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn">Prev</button>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Page {data.pagination.page} / {data.pagination.totalPages}</span>
        <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="btn">Next</button>
      </div>
    </div>
  );
};

export default AdminAudit;
