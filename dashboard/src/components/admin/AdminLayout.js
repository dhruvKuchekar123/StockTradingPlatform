import React, { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import axios from "axios";
import { Users, ClipboardList, Wallet, Activity, Mail, ScrollText, ShieldAlert, Loader2 } from "lucide-react";

const AUTH_HOST = process.env.REACT_APP_API_HOST || "http://localhost:3002";

// Read-only admin console shell: verifies the caller is an admin (server is the
// source of truth — this is just so non-admins see a clean message instead of
// broken pages), then renders the sub-navigation + the active page.
const AdminLayout = () => {
  const [state, setState] = useState("loading"); // loading | admin | denied

  useEffect(() => {
    axios
      .post(`${AUTH_HOST}/`, {}, { withCredentials: true })
      .then((r) => setState(r.data && r.data.role === "admin" ? "admin" : "denied"))
      .catch(() => setState("denied"));
  }, []);

  if (state === "loading") {
    return (
      <div className="animate-up" style={{ display: "flex", alignItems: "center", gap: 10, padding: 40, color: "var(--text-dim)" }}>
        <Loader2 className="animate-spin" size={18} /> Checking admin access…
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="glass-card p-6 animate-up" style={{ margin: 20, borderColor: "#EF4444" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8, color: "#EF4444", margin: 0 }}>
          <ShieldAlert size={20} /> Access denied
        </h2>
        <p style={{ color: "var(--text-dim)" }}>This area is restricted to administrators.</p>
      </div>
    );
  }

  const tabs = [
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/orders", label: "Orders", icon: ClipboardList },
    { to: "/admin/wallet", label: "Wallet", icon: Wallet },
    { to: "/admin/emails", label: "Emails", icon: Mail },
    { to: "/admin/health", label: "System Health", icon: Activity },
    { to: "/admin/audit", label: "Audit Log", icon: ScrollText },
  ];

  return (
    <div className="animate-up" style={{ padding: 4 }}>
      <div className="section-header">
        <div>
          <h1 className="title" style={{ marginBottom: 0 }}>Admin Console</h1>
          <p className="section-subtitle">Read-only platform overview</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "12px 0 20px", flexWrap: "wrap" }}>
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              color: isActive ? "#0F1117" : "var(--text-main)",
              background: isActive ? "var(--accent-gold)" : "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
            })}
          >
            <Icon size={15} /> {label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
};

export default AdminLayout;
