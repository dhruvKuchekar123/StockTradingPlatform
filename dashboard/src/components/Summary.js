import React, { useState, useEffect } from "react";
import axios from "axios";
import FuturisticChart from "./FuturisticChart";
import { TrendingUp, Wallet, ArrowUpRight, Zap } from "lucide-react";

const Summary = () => {
  const [balance, setBalance] = useState(0);

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
    // Poll for dynamic updates
    const interval = setInterval(fetchProfile, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="summary-container p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h2 style={{ color: "#3a86ff", marginBottom: "30px", fontWeight: "700" }}>Account Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Total Portfolio</p>
              <p className="stat-value text-3xl">${(balance * 1.5).toFixed(2)}</p>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Wallet className="text-cyan-400" size={20} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-emerald-400 text-sm font-bold">+2.4%</span> <span className="text-gray-500 text-xs">vs last month</span>
          </div>
        </div>

        <div className="stat-card bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Daily P&L</p>
              <p className="stat-value text-3xl text-emerald-400">+$4,230.50</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-gray-500 text-xs">Top gainer: NVDA</span>
          </div>
        </div>

        <div className="stat-card bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Buying Power</p>
              <p className="stat-value text-3xl">${balance.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Zap className="text-blue-400" size={20} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <span className="text-gray-500 text-xs">Available for trading</span>
          </div>
        </div>
      </div>

      <FuturisticChart />
    </div>
  );
};

export default Summary;

