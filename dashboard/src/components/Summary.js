import React from "react";
import FuturisticChart from "./FuturisticChart";
import { TrendingUp, Wallet, ArrowUpRight, Zap } from "lucide-react";

const Summary = () => {
  return (
    <div className="summary-page p-6">
      {/* ... existing summary content ... */}
      <div className="flex items-center gap-3 mb-8 animate-up">
        <div className="p-2 bg-cyan-500/20 rounded-xl">
          <Zap className="text-cyan-400" size={32} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Market <span className="text-cyan-400">Intelligence</span></h1>
      </div>

      <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card animate-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Total Portfolio</p>
              <p className="stat-value text-3xl">₹2,45,670.00</p>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <Wallet className="text-cyan-400" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-emerald-400 text-sm font-bold">
              <ArrowUpRight size={16} /> +12.4%
            </span>
            <span className="text-gray-500 text-xs">Monthly Growth</span>
          </div>
        </div>

        <div className="stat-card animate-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Daily P&L</p>
              <p className="stat-value text-3xl text-emerald-400">+₹4,230.50</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-gray-500 text-xs font-medium">Outperforming market by 2.1%</span>
          </div>
        </div>

        <div className="stat-card animate-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label uppercase tracking-wider text-xs font-bold">Buying Power</p>
              <p className="stat-value text-3xl">₹1,12,000.00</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Zap className="text-blue-400" size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-500 h-full shadow-[0_0_8px_rgba(0,242,255,0.5)]" style={{ width: "65%" }}></div>
            </div>
          </div>
        </div>
      </div>

      <FuturisticChart />
    </div>
  );
};

export default Summary;

