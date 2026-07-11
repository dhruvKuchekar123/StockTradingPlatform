import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import usePriceFeed from "../hooks/usePriceFeed";
import { Tooltip } from "@mui/material";
import { BarChart2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import GeneralContext from "./GeneralContext";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openChartModal } = useContext(GeneralContext);

  // Extract symbols for WebSocket subscription once holdings load
  const holdingSymbols = allHoldings.map(h => h.name);
  const { prices, connected } = usePriceFeed(holdingSymbols);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const res = await axios.get(`${API_URL}/allHoldings`);
        setAllHoldings(res.data || []);
      } catch (err) {
        console.error("Error fetching holdings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "300px", width: "100%" }} />
      </div>
    );
  }

  let totalInvestment = 0;
  let currentTotalValue = 0;

  // Pre-calculate for donut chart
  const holdingValues = allHoldings.map(stock => {
    const liveData = prices[stock.name];
    const price = liveData ? liveData.price : (Number(stock.price) || 0);
    return { name: stock.name, value: price * (Number(stock.qty) || 0) };
  });

  const donutColors = ['#D4AF37', '#22C55E', '#3B82F6', '#A78BFA', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

  const donutData = {
    labels: holdingValues.map(h => h.name),
    datasets: [{
      data: holdingValues.map(h => h.value),
      backgroundColor: donutColors.slice(0, holdingValues.length),
      borderColor: "transparent",
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        titleColor: '#D4AF37',
        bodyColor: '#F0F4F8',
        borderColor: '#2A3040',
        borderWidth: 1,
        padding: 12,
        bodyFont: { family: "'JetBrains Mono', monospace" },
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
        },
      },
    },
  };

  return (
    <div className="animate-up">
      {/* Header */}
      <div className="section-header">
        <h1 className="title" style={{ marginBottom: 0 }}>
          <BarChart2 size={24} style={{ color: "var(--accent-gold)" }} />
          Holdings <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: "16px" }}>({allHoldings.length})</span>
          <Tooltip title={connected ? "Live Pricing Active" : "Disconnected"}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: connected ? "var(--success)" : "var(--text-muted)",
              animation: connected ? "pulse-dot 2s ease-in-out infinite" : "none",
              marginLeft: "8px",
            }} />
          </Tooltip>
        </h1>
      </div>

      {/* Donut Chart + Legend */}
      {allHoldings.length > 0 && (
        <motion.div
          className="glass-card p-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-main)", margin: "0 0 16px 0" }}>
            Portfolio Allocation
          </h3>
          <div className="flex items-center gap-8">
            <div style={{ width: "160px", height: "160px" }}>
              <Doughnut data={donutData} options={donutOptions} />
            </div>
            <div className="flex flex-wrap gap-3" style={{ flex: 1 }}>
              {holdingValues.map((h, i) => (
                <div key={h.name} className="flex items-center gap-2" style={{ minWidth: "120px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: donutColors[i % donutColors.length] }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>{h.name}</span>
                  <span style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-dim)" }}>
                    {formatCurrency(h.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Holdings Table */}
      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg. cost</th>
              <th>LTP</th>
              <th>Cur. val</th>
              <th>P&L</th>
              <th>Net chg.</th>
              <th>Chart</th>
            </tr>
          </thead>
          <tbody>
            {allHoldings.map((stock, index) => {
              const avg = Number(stock.avg) || 0;
              const qty = Number(stock.qty) || 0;
              
              const liveData = prices[stock.name];
              const price = liveData ? liveData.price : (Number(stock.price) || 0);
              
              const curValue = price * qty;
              const invested = avg * qty;
              const pnl = curValue - invested;
              const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
              
              const isProfit = pnl >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              
              totalInvestment += invested;
              currentTotalValue += curValue;

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.03 }}
                >
                  <td style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--text-main)" }}>
                    {stock.name || "-"}
                  </td>
                  <td>{qty}</td>
                  <td>{formatCurrency(avg)}</td>
                  <td>{formatCurrency(price)}</td>
                  <td>{formatCurrency(curValue)}</td>
                  <td className={profClass}>
                    {isProfit ? '+' : ''}{formatCurrency(pnl)}
                  </td>
                  <td className={profClass}>
                    <span className="flex items-center justify-end gap-1">
                      {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </span>
                  </td>
                  <td>
                    <Tooltip title={`View ${stock.name} chart`}>
                      <button
                        onClick={() => openChartModal(stock.name)}
                        style={{
                          background: "rgba(212,175,55,0.1)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          borderRadius: "6px",
                          color: "var(--accent-gold)",
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(212,175,55,0.22)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(212,175,55,0.1)";
                        }}
                      >
                        <BarChart3 size={13} />
                      </button>
                    </Tooltip>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Row */}
      <div className="row">
        <div className="col">
          <h5>{formatCurrency(totalInvestment)}</h5>
          <p>Total investment</p>
        </div>
        <div className="col">
          <h5>{formatCurrency(currentTotalValue)}</h5>
          <p>Current value</p>
        </div>
        <div className="col">
          <h5 className={currentTotalValue - totalInvestment >= 0 ? "profit" : "loss"}>
             {currentTotalValue - totalInvestment >= 0 ? "+" : ""}
             {formatCurrency(currentTotalValue - totalInvestment)}
          </h5>
          <p>Total P&L</p>
        </div>
      </div>
    </div>
  );
};

export default Holdings;
