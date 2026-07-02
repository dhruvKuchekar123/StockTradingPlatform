import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

/**
 * Click-through confirmation modal for admin write actions. Nothing destructive
 * happens until the admin explicitly confirms here; a reason is required by
 * default (it is written to the audit log server-side).
 *
 * onConfirm(reason) may return a promise; the modal shows a spinner until it
 * settles, surfaces server errors inline, and only closes on success.
 */
const ConfirmModal = ({ open, title, message, confirmLabel = "Confirm", danger = true, requireReason = true, onConfirm, onCancel }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (open) { setReason(""); setError(""); setLoading(false); } }, [open]);

  if (!open) return null;

  const submit = async () => {
    if (requireReason && !reason.trim()) { setError("A reason is required (it is recorded in the audit log)."); return; }
    setLoading(true); setError("");
    try {
      await onConfirm(reason.trim());
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Action failed.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000 }}>
      <div className="glass-card p-6" style={{ width: "100%", maxWidth: 440, border: `1px solid ${danger ? "#EF4444" : "var(--accent-gold)"}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, color: danger ? "#EF4444" : "var(--accent-gold)" }}>
            <AlertTriangle size={18} /> {title}
          </h3>
          <button onClick={onCancel} disabled={loading} style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <p style={{ color: "var(--text-main)", fontSize: 14, lineHeight: 1.5 }}>{message}</p>

        {requireReason && (
          <div style={{ margin: "14px 0" }}>
            <label style={{ fontSize: 12, color: "var(--text-dim)", fontWeight: 600, display: "block", marginBottom: 6 }}>Reason (required — logged to audit trail)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Why are you doing this?"
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: "#fff", outline: "none", resize: "vertical" }}
            />
          </div>
        )}

        {error && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 12px" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={loading} className="btn" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-main)", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ background: danger ? "#EF4444" : "var(--accent-gold)", color: danger ? "#fff" : "#0F1117", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
            {loading && <Loader2 className="animate-spin" size={15} />} {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
