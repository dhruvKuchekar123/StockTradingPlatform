import React, { useEffect, useState, useCallback } from "react";
import { adminGet, adminPost, fmtDate } from "./adminApi";
import ConfirmModal from "./ConfirmModal";

const th = { padding: "12px", color: "var(--text-dim)", fontSize: 12, fontWeight: 600, textAlign: "left" };
const td = { padding: "12px", fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.03)" };

const statusColor = (s) =>
  ["EXECUTED"].includes(s) ? "#10B981" : ["CANCELLED", "REJECTED"].includes(s) ? "#EF4444" : "#F59E0B";

const AdminOrders = () => {
  const [data, setData] = useState({ orders: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const askCancel = (o) => setModal({
    title: "Cancel stuck order",
    message: `Force-cancel ${o.side} ${o.qty} ${o.symbol} (${o.orderType}, ${o.status}) for ${o.user}? Use only for genuinely broken orders. This is logged to the audit trail.`,
    confirmLabel: "Cancel order",
    onConfirm: async (reason) => { await adminPost(`/orders/${o.id}/cancel`, { reason }); setModal(null); load(); },
  });

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await adminGet("/orders", { page, limit: 20, status: status || undefined, orderType: orderType || undefined });
      setData(res);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load orders");
    } finally { setLoading(false); }
  }, [page, status, orderType]);

  useEffect(() => { load(); }, [load]);

  const select = { padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "#fff", outline: "none" };
  const optionStyle = { background: "#1b1d24", color: "#ffffff" };

  return (
    <div className="glass-card p-5">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0 }}>Orders — all users <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>({data.pagination.total})</span></h3>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} style={select}>
            <option value="" style={optionStyle}>All statuses</option>
            <option value="open" style={optionStyle}>Open</option>
            <option value="filled" style={optionStyle}>Filled</option>
            <option value="cancelled" style={optionStyle}>Cancelled</option>
          </select>
          <select value={orderType} onChange={(e) => { setPage(1); setOrderType(e.target.value); }} style={select}>
            <option value="" style={optionStyle}>All types</option>
            <option value="MARKET" style={optionStyle}>MARKET</option>
            <option value="LIMIT" style={optionStyle}>LIMIT</option>
            <option value="SL" style={optionStyle}>SL</option>
            <option value="GTT" style={optionStyle}>GTT</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: "#EF4444" }}>{error}</p>}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th style={th}>USER</th><th style={th}>SYMBOL</th><th style={th}>SIDE</th><th style={th}>QTY</th>
            <th style={th}>TYPE</th><th style={th}>STATUS</th><th style={th}>PRICE</th><th style={th}>PLACED</th><th style={th}>ACTIONS</th>
          </tr></thead>
          <tbody>
            {data.orders.map((o) => (
              <tr key={o.id}>
                <td style={td}>{o.user}</td>
                <td style={{ ...td, fontWeight: 700 }}>{o.symbol}</td>
                <td style={{ ...td, color: o.side === "BUY" ? "#EF4444" : "#10B981", fontWeight: 700 }}>{o.side}</td>
                <td style={td}>{o.qty}</td>
                <td style={td}>{o.orderType}</td>
                <td style={{ ...td, color: statusColor(o.status), fontWeight: 700, fontSize: 12 }}>{o.status}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{o.price != null ? `₹${o.price}` : "—"}</td>
                <td style={td}>{fmtDate(o.placedAt)}</td>
                <td style={td}>
                  {["OPEN", "PENDING", "TRIGGERED"].includes(o.status)
                    ? <button onClick={() => askCancel(o)} style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "1px solid var(--border)", background: "rgba(255,255,255,0.04)", color: "#EF4444" }}>Cancel</button>
                    : <span style={{ color: "var(--text-dim)", fontSize: 12 }}>—</span>}
                </td>
              </tr>
            ))}
            {!loading && data.orders.length === 0 && <tr><td style={{ ...td, textAlign: "center", padding: 30 }} colSpan={9}>No orders match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 16 }}>
        <button disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)} className="btn">Prev</button>
        <span style={{ color: "var(--text-dim)", fontSize: 13 }}>Page {data.pagination.page} / {data.pagination.totalPages}</span>
        <button disabled={page >= data.pagination.totalPages || loading} onClick={() => setPage((p) => p + 1)} className="btn">Next</button>
      </div>

      <ConfirmModal open={!!modal} {...(modal || {})} onCancel={() => setModal(null)} />
    </div>
  );
};

export default AdminOrders;
