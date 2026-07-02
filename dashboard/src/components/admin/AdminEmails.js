import React, { useEffect, useState, useCallback } from "react";
import { adminGet, adminPost, fmtDate } from "./adminApi";
import ConfirmModal from "./ConfirmModal";

const th = { padding: "12px", color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textAlign: "left" };
const td = { padding: "12px", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.03)" };

const AdminEmails = () => {
  const [data, setData] = useState({ emails: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(() => {
    adminGet("/emails", { status: "PENDING", limit: 50 }).then(setData).catch((e) => setError(e.response?.data?.message || "Failed to load failed-email queue"));
  }, []);
  useEffect(() => { load(); }, [load]);

  const askResend = (e) => setModal({
    title: "Resend queued email",
    message: `Resend the ${e.type} email to ${e.to}? Last error: ${e.lastError || "n/a"}. This is logged to the audit trail.`,
    confirmLabel: "Resend now",
    danger: false,
    onConfirm: async (reason) => { await adminPost(`/emails/${e.id}/resend`, { reason }); setModal(null); load(); },
  });

  return (
    <div className="glass-card p-5">
      {error && <p style={{ color: "#EF4444" }}>{error}</p>}
      <h3 style={{ marginTop: 0 }}>Failed / queued emails <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>({data.pagination.total} pending)</span></h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={th}>TO</th><th style={th}>TYPE</th><th style={th}>ATTEMPTS</th><th style={th}>LAST ERROR</th><th style={th}>QUEUED</th><th style={th}>ACTION</th>
          </tr></thead>
          <tbody>
            {data.emails.map((e) => (
              <tr key={e.id}>
                <td style={td}>{e.to}</td>
                <td style={td}>{e.type}</td>
                <td style={td}>{e.attempts}</td>
                <td style={{ ...td, color: "#EF4444", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.lastError}>{e.lastError || "—"}</td>
                <td style={td}>{fmtDate(e.createdAt)}</td>
                <td style={td}>
                  <button onClick={() => askResend(e)} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "var(--accent-gold)" }}>Resend</button>
                </td>
              </tr>
            ))}
            {data.emails.length === 0 && <tr><td style={{ ...td, textAlign: "center", padding: 30 }} colSpan={6}>Queue is empty — no failed emails.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal open={!!modal} {...(modal || {})} onCancel={() => setModal(null)} />
    </div>
  );
};

export default AdminEmails;
