import React, { useContext } from "react";
import GeneralContext from "./GeneralContext";
import AdvancedChart from "./CandleChart";
import usePriceFeed from "../hooks/usePriceFeed";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChartModal = () => {
  const { chartSymbol, closeChartModal } = useContext(GeneralContext);

  const { prices } = usePriceFeed(chartSymbol ? [chartSymbol] : []);
  const liveData = chartSymbol ? prices[chartSymbol] : null;
  const livePrice = liveData?.price;
  const change = liveData?.change ?? 0;
  const changePercent = liveData?.changePercent ?? 0;
  const isUp = change >= 0;

  if (!chartSymbol) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="chart-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeChartModal}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <motion.div
          key="chart-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-gold)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "900px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(212,175,55,0.08)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 16px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* Symbol Badge */}
              <div
                style={{
                  background: "var(--accent-gold-dim)",
                  border: "1px solid var(--border-gold)",
                  borderRadius: "10px",
                  padding: "6px 14px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "18px",
                  color: "var(--accent-gold)",
                  letterSpacing: "0.05em",
                }}
              >
                {chartSymbol}
              </div>

              {/* Live Price */}
              {livePrice && (
                <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "22px",
                      color: "var(--text-main)",
                    }}
                  >
                    ₹{Number(livePrice).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background: isUp
                        ? "rgba(34,197,94,0.12)"
                        : "rgba(239,68,68,0.12)",
                      color: isUp ? "var(--success)" : "var(--danger)",
                      border: `1px solid ${
                        isUp
                          ? "rgba(34,197,94,0.25)"
                          : "rgba(239,68,68,0.25)"
                      }`,
                    }}
                  >
                    {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {isUp ? "+" : ""}
                    {Number(changePercent).toFixed(2)}%
                  </div>
                </div>
              )}
            </div>

            {/* Close */}
            <button
              onClick={closeChartModal}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-dim)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                e.currentTarget.style.color = "var(--danger)";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "var(--text-dim)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Chart */}
          <div style={{ padding: "0 8px 16px" }}>
            <AdvancedChart symbol={chartSymbol} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChartModal;
