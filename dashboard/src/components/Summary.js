import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AdvancedChart from "./CandleChart";
import FuturisticChart from "./FuturisticChart";
import GeneralContext from "./GeneralContext";
import { aiInsights, marketNews } from "../data/data";
import { 
  Wallet, TrendingUp, Zap, BarChart3, Brain, Sparkles,
  Newspaper, Clock, TrendingDown, Minus, ArrowUpRight
} from "lucide-react";
import { motion } from "framer-motion";

const sentimentConfig = {
  bullish: { icon: TrendingUp, badge: "badge-green", label: "Bullish" },
  bearish: { icon: TrendingDown, badge: "badge-red", label: "Bearish" },
  neutral: { icon: Minus, badge: "badge-neutral", label: "Neutral" },
};

const Summary = () => {
  const [balance, setBalance] = useState(0);
  const { selectedStock } = useContext(GeneralContext);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("http://localhost:3002/api/user/profile", { withCredentials: true });
      if (data.success) {
        setBalance(data.walletBalance || 0);
      }
    } catch(err) {
      console.error("Failed to fetch profile data");
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 5000);
    return () => clearInterval(interval);
  }, []);

  const portfolioValue = balance * 1.5;
  const dailyPnl = 4230.50;
  const todayReturn = 1.82;

  return (
    <div className="animate-up">
      {/* Page Header */}
      <div className="section-header" style={{ marginBottom: "24px" }}>
        <div>
          <h1 className="section-title" style={{ fontFamily: "var(--font-display)" }}>
            Account <span className="gold">Overview</span>
          </h1>
          <p className="section-subtitle">Real-time portfolio analytics and market intelligence</p>
        </div>
        <span className="badge badge-gold">
          <Sparkles size={10} />
          PRO ANALYTICS
        </span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Total Portfolio</p>
              <p className="stat-value" style={{ fontFamily: "var(--font-display)" }}>
                ₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="stat-icon gold">
              <Wallet size={20} />
            </div>
          </div>
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
            <span className="flex items-center gap-1" style={{ color: "var(--success)", fontSize: "12px", fontWeight: 700 }}>
              <ArrowUpRight size={14} /> +2.4%
            </span>
            <span style={{ color: "var(--text-dim)", fontSize: "11px", marginLeft: "8px" }}>vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Daily P&L</p>
              <p className="stat-value" style={{ color: "var(--success)", fontFamily: "var(--font-mono)" }}>
                +₹{dailyPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="stat-icon green">
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
            <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>Top gainer: <span style={{ color: "var(--accent-gold)", fontWeight: 700 }}>RELIANCE</span></span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Buying Power</p>
              <p className="stat-value" style={{ fontFamily: "var(--font-mono)" }}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="stat-icon blue">
              <Zap size={20} />
            </div>
          </div>
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
            <span style={{ color: "var(--text-dim)", fontSize: "11px" }}>Available for trading</span>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Today's Return</p>
              <p className="stat-value" style={{ color: "var(--success)", fontFamily: "var(--font-display)" }}>
                +{todayReturn}%
              </p>
            </div>
            <div className="stat-icon green">
              <BarChart3 size={20} />
            </div>
          </div>
          <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-light)" }}>
            {/* Mini progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ flex: 1, height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(todayReturn * 20, 100)}%`, height: "100%", background: "var(--success)", borderRadius: "2px" }} />
              </div>
              <span style={{ color: "var(--text-dim)", fontSize: "10px", fontWeight: 600 }}>Target: 5%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <AdvancedChart symbol={selectedStock || "RELIANCE"} />

      {/* Two Column: AI Insights + Market News */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "24px" }}>
        
        {/* AI Insights Panel */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              <Brain size={18} style={{ color: "var(--accent-gold)" }} />
              AI Insights
            </h3>
            <span className="badge badge-gold">
              <Sparkles size={9} />
              LIVE
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {aiInsights.slice(0, 3).map((insight, i) => {
              const sentiment = sentimentConfig[insight.sentiment];
              const SentimentIcon = sentiment.icon;
              return (
                <div key={insight.id} className="insight-card" style={{ padding: "14px" }}>
                  <div className="insight-icon" style={{ 
                    background: "var(--accent-gold-dim)", 
                    border: "1px solid var(--border-gold)", 
                    color: "var(--accent-gold)",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                  }}>
                    <Sparkles size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontWeight: 800, fontSize: "12px" }}>{insight.symbol}</span>
                      <span className={`badge ${sentiment.badge}`} style={{ fontSize: "9px", padding: "2px 5px" }}>
                        <SentimentIcon size={8} />
                        {sentiment.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: 0, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {insight.insight}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Market News Panel */}
        <motion.div 
          className="glass-card p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
              <Newspaper size={18} style={{ color: "var(--accent-gold)" }} />
              Market News
            </h3>
            <span className="badge badge-neutral">
              <Clock size={9} />
              LATEST
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {marketNews.slice(0, 4).map((news, i) => {
              const sentiment = sentimentConfig[news.sentiment];
              return (
                <div key={news.id} style={{
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`badge ${sentiment.badge}`} style={{ fontSize: "9px", padding: "2px 5px", flexShrink: 0 }}>
                      {sentiment.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-main)", margin: "0 0 6px 0", lineHeight: 1.4 }}>
                    {news.headline}
                  </p>
                  <div className="flex items-center gap-2" style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                    <span style={{ fontWeight: 600, color: "var(--accent-gold)" }}>{news.source}</span>
                    <span>•</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Portfolio Growth Chart */}
      <div style={{ marginTop: "24px" }}>
        <FuturisticChart />
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "24px" }}>
        {[
          { label: "India VIX", value: "12.45", status: "Low", color: "var(--success)" },
          { label: "NIFTY PE", value: "22.3x", status: "Fair", color: "var(--warning)" },
          { label: "Advance/Decline", value: "1,245 / 780", status: "Bullish", color: "var(--success)" },
          { label: "FII Net Flow", value: "+₹4,200 Cr", status: "Inflow", color: "var(--success)" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="glass-card p-4 flex items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.05 }}
          >
            <div>
              <p style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "16px", fontWeight: 700, fontFamily: "var(--font-mono)", margin: "0 0 2px 0", color: "var(--text-main)" }}>
                {stat.value}
              </p>
              <span style={{ fontSize: "10px", fontWeight: 700, color: stat.color, textTransform: "uppercase" }}>
                {stat.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
