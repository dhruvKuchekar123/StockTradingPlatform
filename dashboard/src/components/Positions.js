import React, { useState, useEffect } from "react";
import axios from "axios";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await axios.get("http://localhost:3002/allPositions", { withCredentials: true });
        setPositions(res.data || []);
      } catch (err) {
        console.error("Error fetching positions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton" style={{ height: "32px", width: "200px", marginBottom: "20px" }} />
        <div className="skeleton" style={{ height: "300px", width: "100%" }} />
      </div>
    );
  }

  return (
    <div className="animate-up">
      <div className="section-header">
        <h1 className="title" style={{ marginBottom: 0 }}>
          <Briefcase size={24} style={{ color: "var(--accent-gold)" }} />
          Positions <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: "16px" }}>({positions.length})</span>
        </h1>
      </div>

      <div className="order-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Instrument</th>
              <th>Qty.</th>
              <th>Avg.</th>
              <th>LTP</th>
              <th>P&L</th>
              <th>Chg.</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((stock, index) => {
              const curValue = stock.price * stock.qty;
              const pnl = curValue - stock.avg * stock.qty;
              const isProfit = pnl >= 0.0;
              const profClass = isProfit ? "profit" : "loss";
              const dayClass = stock.day.startsWith('-') ? "loss" : "profit";

              return (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + index * 0.04 }}
                >
                  <td>
                    <span className={`badge ${stock.product === "CNC" ? "badge-blue" : "badge-gold"}`}>
                      {stock.product}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--text-main)" }}>
                    {stock.name}
                  </td>
                  <td>{stock.qty}</td>
                  <td>{formatCurrency(stock.avg)}</td>
                  <td>{formatCurrency(stock.price)}</td>
                  <td className={profClass}>
                    <span className="flex items-center justify-end gap-1">
                      {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {formatCurrency(pnl)}
                    </span>
                  </td>
                  <td className={dayClass}>{stock.day}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Positions;
