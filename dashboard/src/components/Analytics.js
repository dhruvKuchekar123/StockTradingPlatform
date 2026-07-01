import React from "react";
import FuturisticChart from "./FuturisticChart";
import { Activity, Target, PieChart, TrendingUp, Zap, BarChart3, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Analytics = () => {
  const sectorExposure = [
    { name: "Banking", weight: "35%", change: "+2.1%", isUp: true },
    { name: "IT", weight: "28%", change: "-0.8%", isUp: false },
    { name: "Energy", weight: "20%", change: "+1.5%", isUp: true },
    { name: "Auto", weight: "12%", change: "-1.2%", isUp: false },
    { name: "FMCG", weight: "5%", change: "+0.3%", isUp: true },
  ];

  const monthlyReturns = [
    { month: "Jan", return: 3.2 }, { month: "Feb", return: -1.5 },
    { month: "Mar", return: 4.8 }, { month: "Apr", return: 2.1 },
    { month: "May", return: -0.7 }, { month: "Jun", return: 5.3 },
    { month: "Jul", return: 1.9 }, { month: "Aug", return: -2.4 },
    { month: "Sep", return: 3.6 }, { month: "Oct", return: 4.1 },
    { month: "Nov", return: -0.9 }, { month: "Dec", return: 6.2 },
  ];

  return (
    <div className="animate-up">
      <div className="section-header">
        <div>
          <h1 className="section-title" style={{ fontFamily: "var(--font-display)" }}>
            <Activity size={28} style={{ color: "var(--accent-gold)" }} />
            Advanced <span className="gold">Analytics</span>
          </h1>
          <p className="section-subtitle">Deep portfolio analysis and risk metrics</p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Zap, color: "var(--warning)", iconColor: "#FBBF24", label: "Volatility Index", value: "12.45", status: "Low Risk", statusColor: "var(--success)" },
          { icon: TrendingUp, color: "var(--success)", iconColor: "#22C55E", label: "Sharpe Ratio", value: "2.14", status: "Excellent", statusColor: "var(--success)" },
          { icon: Activity, color: "var(--accent-gold)", iconColor: "#D4AF37", label: "Beta (1Y)", value: "0.85", status: "Stable", statusColor: "var(--accent-gold)" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card p-5 flex items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div className="stat-icon" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30`, color: stat.iconColor }}>
              <stat.icon size={20} />
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "22px", fontWeight: 700, fontFamily: "var(--font-mono)", margin: "0 0 2px 0", color: "var(--text-main)" }}>
                {stat.value}
              </p>
              <span style={{ fontSize: "10px", fontWeight: 700, color: stat.statusColor, textTransform: "uppercase" }}>
                {stat.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance + Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Performance Breakdown</h3>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: 1.7, margin: 0 }}>
            Your portfolio has grown by <span style={{ color: "var(--success)", fontWeight: 700 }}>12%</span> this quarter. The highest contributor was 
            <span style={{ color: "var(--accent-gold)", fontWeight: 700 }}> RELIANCE</span> with a 24% return. 
            Maintain your current allocation for optimal risk-adjusted returns.
          </p>
        </motion.div>

        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Asset Allocation</h3>
          </div>
          <div className="flex gap-6 items-center">
            <div style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "4px solid var(--border)",
              borderTopColor: "var(--accent-gold)",
              borderRightColor: "var(--success)",
              animation: "spin-slow 8s linear infinite",
            }} />
            <div>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", margin: "0 0 4px 0" }}>
                Equity: <span style={{ color: "var(--text-main)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>75%</span>
              </p>
              <p style={{ fontSize: "13px", color: "var(--text-dim)", margin: 0 }}>
                Cash: <span style={{ color: "var(--text-main)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>25%</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sector Exposure */}
      <motion.div
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={18} style={{ color: "var(--accent-gold)" }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Sector-Wise Exposure</h3>
        </div>
        <div className="flex flex-col gap-3">
          {sectorExposure.map((sector, i) => (
            <div key={i} className="flex items-center gap-4">
              <span style={{ width: "80px", fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
                {sector.name}
              </span>
              <div style={{ flex: 1, height: "8px", background: "var(--border)", borderRadius: "4px", overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", background: "var(--accent-gold)", borderRadius: "4px" }}
                  initial={{ width: 0 }}
                  animate={{ width: sector.weight }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
                />
              </div>
              <span style={{ width: "45px", fontSize: "13px", fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-main)", textAlign: "right" }}>
                {sector.weight}
              </span>
              <span style={{ width: "55px", fontSize: "11px", fontWeight: 600, color: sector.isUp ? "var(--success)" : "var(--danger)", textAlign: "right" }}>
                {sector.change}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Monthly Returns Heatmap */}
      <motion.div
        className="glass-card p-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} style={{ color: "var(--accent-gold)" }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>Monthly Returns</h3>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(12, 1fr)", gap: "6px" }}>
          {monthlyReturns.map((m, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "10px 4px",
              borderRadius: "8px",
              background: m.return >= 0
                ? `rgba(34, 197, 94, ${Math.min(m.return / 10, 0.4)})`
                : `rgba(239, 68, 68, ${Math.min(Math.abs(m.return) / 10, 0.4)})`,
              border: "1px solid var(--border-light)",
            }}>
              <div style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: 600, marginBottom: "4px" }}>
                {m.month}
              </div>
              <div style={{
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: m.return >= 0 ? "var(--success)" : "var(--danger)",
              }}>
                {m.return >= 0 ? "+" : ""}{m.return}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Portfolio Growth Chart */}
      <FuturisticChart />
    </div>
  );
};

export default Analytics;
