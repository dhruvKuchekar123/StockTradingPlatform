import React, { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck, TrendingUp, TrendingDown, AlertTriangle, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "./NotificationContext";

const typeConfig = {
  ORDER_BUY: {
    icon: TrendingUp,
    color: "var(--success)",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    label: "Buy Executed",
  },
  ORDER_SELL: {
    icon: TrendingDown,
    color: "var(--danger)",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "Sell Executed",
  },
  ORDER_REJECTED: {
    icon: AlertTriangle,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Order Rejected",
  },
  GTT_TRIGGERED: {
    icon: Info,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    label: "GTT Triggered",
  },
  INFO: {
    icon: Info,
    color: "var(--text-dim)",
    bg: "rgba(255,255,255,0.04)",
    border: "var(--border)",
    label: "Info",
  },
};

const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-IN");
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      // Mark all as read when panel opens
      setTimeout(markAllRead, 1000);
    }
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell Button */}
      <button
        id="notification-bell"
        onClick={handleOpen}
        style={{
          position: "relative",
          background: open ? "rgba(212,175,55,0.1)" : "transparent",
          border: "1px solid",
          borderColor: open ? "var(--border-gold)" : "var(--border)",
          borderRadius: "10px",
          width: "38px",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: open ? "var(--accent-gold)" : "var(--text-dim)",
          transition: "all 0.2s",
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "var(--danger)",
              color: "white",
              borderRadius: "50%",
              minWidth: "18px",
              height: "18px",
              fontSize: "10px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid var(--bg-primary)",
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="notification-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: "340px",
              maxHeight: "480px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px var(--border-light)",
              zIndex: 2000,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderBottom: "1px solid var(--border)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Bell size={14} style={{ color: "var(--accent-gold)" }} />
                <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text-main)" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "var(--danger)",
                      color: "white",
                      borderRadius: "10px",
                      padding: "1px 7px",
                      fontSize: "10px",
                      fontWeight: 800,
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllRead}
                      title="Mark all read"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-dim)",
                        padding: "4px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CheckCheck size={14} />
                    </button>
                    <button
                      onClick={clearAll}
                      title="Clear all"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-dim)",
                        padding: "4px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-dim)",
                    padding: "4px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "40px 20px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <Bell size={28} style={{ opacity: 0.2, marginBottom: "12px" }} />
                  <p style={{ fontSize: "13px", margin: 0 }}>No notifications yet</p>
                  <p style={{ fontSize: "11px", opacity: 0.6, margin: "4px 0 0 0" }}>
                    Order executions will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notif) => {
                    const cfg = typeConfig[notif.type] || typeConfig.INFO;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        style={{
                          display: "flex",
                          gap: "12px",
                          padding: "12px 16px",
                          borderBottom: "1px solid var(--border-light)",
                          background: notif.read ? "transparent" : "rgba(212,175,55,0.03)",
                          transition: "background 0.2s",
                          cursor: "default",
                          position: "relative",
                        }}
                      >
                        {/* Unread indicator */}
                        {!notif.read && (
                          <div
                            style={{
                              position: "absolute",
                              left: "6px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: "4px",
                              height: "4px",
                              borderRadius: "50%",
                              background: "var(--accent-gold)",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            color: cfg.color,
                          }}
                        >
                          <Icon size={14} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: "0 0 2px 0",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--text-main)",
                            }}
                          >
                            {notif.title}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: "11px",
                              color: "var(--text-dim)",
                              lineHeight: 1.4,
                            }}
                          >
                            {notif.message}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0 0",
                              fontSize: "10px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {formatTime(notif.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
