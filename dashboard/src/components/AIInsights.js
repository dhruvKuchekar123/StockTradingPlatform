import React from "react";
import { aiInsights } from "../data/data";
import {
  Brain, Sparkles, TrendingUp, TrendingDown, Minus,
  Shield, Target, Activity, AlertTriangle, Gauge
} from "lucide-react";
import { motion } from "framer-motion";

const sentimentConfig = {
  bullish: { icon: TrendingUp, color: "var(--success)", badge: "badge-green", label: "Bullish" },
  bearish: { icon: TrendingDown, color: "var(--danger)", badge: "badge-red", label: "Bearish" },
  neutral: { icon: Minus, color: "var(--text-dim)", badge: "badge-neutral", label: "Neutral" },
};

const AIInsights = () => {
  // Mock data for the insights page
  const fearGreedValue = 62;
  const fearGreedLabel = fearGreedValue > 75 ? "Extreme Greed" : fearGreedValue > 55 ? "Greed" : fearGreedValue > 45 ? "Neutral" : fearGreedValue > 25 ? "Fear" : "Extreme Fear";
  const fearGreedColor = fearGreedValue > 55 ? "var(--success)" : fearGreedValue > 45 ? "var(--warning)" : "var(--danger)";

  const portfolioSuggestions = [
    { title: "Reduce IT Sector Exposure", description: "Your IT allocation is 40% above benchmark. Consider rebalancing to reduce concentration risk.", risk: "medium" },
    { title: "Increase Banking Weight", description: "Banking sector shows strong momentum with FII inflows. Current allocation is underweight.", risk: "low" },
    { title: "Set Stop-Loss on TATAMOTORS", description: "Stock showing bearish pattern below 200-DMA. Recommended SL at ₹920.", risk: "high" },
  ];

  const technicalSummary = [
    { indicator: "RSI (14)", value: "58.3", signal: "Neutral", color: "var(--warning)" },
    { indicator: "MACD", value: "Bullish Crossover", signal: "Buy", color: "var(--success)" },
    { indicator: "Bollinger Bands", value: "Near Upper", signal: "Overbought", color: "var(--danger)" },
    { indicator: "200 DMA", value: "Above", signal: "Bullish", color: "var(--success)" },
    { indicator: "ADX", value: "32.5", signal: "Trending", color: "var(--accent-gold)" },
    { indicator: "Stochastic", value: "72.1", signal: "Neutral", color: "var(--warning)" },
  ];

  return (
    <div className="p-6 animate-up">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Brain size={28} style={{ color: "var(--accent-gold)" }} />
            AI <span className="gold">Insights</span>
          </h1>
          <p className="section-subtitle">AI-powered market analysis and portfolio recommendations</p>
        </div>
        <span className="badge badge-gold">
          <Sparkles size={10} />
          POWERED BY AI
        </span>
      </div>

      {/* Top Row: Fear & Greed + Risk Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Fear & Greed Gauge */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Gauge size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Market Sentiment</h3>
          </div>
          <div className="text-center">
            <div style={{
              fontSize: "52px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: fearGreedColor,
              lineHeight: 1,
              marginBottom: "8px",
            }}>
              {fearGreedValue}
            </div>
            <div style={{
              fontSize: "13px",
              fontWeight: 700,
              color: fearGreedColor,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>
              {fearGreedLabel}
            </div>
            <div style={{
              width: "100%",
              height: "6px",
              background: "var(--border)",
              borderRadius: "3px",
              marginTop: "16px",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${fearGreedValue}%`,
                height: "100%",
                background: `linear-gradient(90deg, var(--danger), var(--warning), var(--success))`,
                borderRadius: "3px",
                transition: "width 1s ease",
              }} />
            </div>
            <div className="flex justify-between" style={{ fontSize: "9px", color: "var(--text-dim)", marginTop: "4px", fontWeight: 600, textTransform: "uppercase" }}>
              <span>Fear</span>
              <span>Greed</span>
            </div>
          </div>
        </motion.div>

        {/* Technical Indicators Summary */}
        <motion.div
          className="glass-card p-6 lg:grid-cols-2"
          style={{ gridColumn: "span 2" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Technical Indicators (NIFTY 50)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {technicalSummary.map((tech, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "10px",
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: "10px", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  {tech.indicator}
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px", fontFamily: "var(--font-mono)" }}>
                  {tech.value}
                </div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: tech.color, textTransform: "uppercase" }}>
                  {tech.signal}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stock-Specific AI Analysis */}
      <div className="mb-6">
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Target size={18} style={{ color: "var(--accent-gold)" }} />
          Stock Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.map((insight, index) => {
            const sentiment = sentimentConfig[insight.sentiment];
            const SentimentIcon = sentiment.icon;

            return (
              <motion.div
                key={insight.id}
                className="insight-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06 }}
              >
                <div className="insight-icon" style={{ background: "var(--accent-gold-dim)", border: "1px solid var(--border-gold)", color: "var(--accent-gold)" }}>
                  <Sparkles size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-main)" }}>{insight.symbol}</span>
                    <span className={`badge ${sentiment.badge}`}>
                      <SentimentIcon size={9} />
                      {sentiment.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 10px 0" }}>
                    {insight.insight}
                  </p>
                  <div className="flex items-center gap-3" style={{ fontSize: "10px", color: "var(--text-dim)" }}>
                    <span style={{ fontWeight: 600 }}>Confidence: <span style={{ color: "var(--accent-gold)", fontFamily: "var(--font-mono)" }}>{insight.confidence}%</span></span>
                    <span>{insight.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Portfolio Optimization Suggestions */}
      <div>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={18} style={{ color: "var(--accent-gold)" }} />
          Portfolio Optimization
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {portfolioSuggestions.map((suggestion, index) => {
            const riskColors = { low: "var(--success)", medium: "var(--warning)", high: "var(--danger)" };
            const riskBadge = { low: "badge-green", medium: "badge-gold", high: "badge-red" };

            return (
              <motion.div
                key={index}
                className="glass-card p-4"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.08 }}
              >
                <div className="flex justify-between items-start">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} style={{ color: riskColors[suggestion.risk] }} />
                      <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", margin: 0 }}>
                        {suggestion.title}
                      </h4>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-dim)", margin: 0, lineHeight: 1.5 }}>
                      {suggestion.description}
                    </p>
                  </div>
                  <span className={`badge ${riskBadge[suggestion.risk]}`} style={{ marginLeft: "12px", flexShrink: 0 }}>
                    {suggestion.risk} risk
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
