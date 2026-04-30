import React from "react";
import FuturisticChart from "./FuturisticChart";
import { Activity, Target, PieChart, TrendingUp, Zap } from "lucide-react";

const Analytics = () => {
  return (
    <div className="analytics-page p-6 animate-up">
      <div className="flex items-center gap-3 mb-8">
        <Activity className="text-cyan-400" size={32} />
        <h1 className="text-3xl font-extrabold tracking-tight">Advanced <span className="text-cyan-400">Analytics</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-blue-400" size={20} />
            <h3 className="text-lg font-bold">Performance Breakdown</h3>
          </div>
          <p className="text-sm text-dim leading-relaxed">
            Your portfolio has grown by 12% this quarter. The highest contributor was 
            <span className="text-white font-bold"> RELIANCE </span> with a 24% return. 
            Maintain your current allocation for optimal results.
          </p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="text-purple-400" size={20} />
            <h3 className="text-lg font-bold">Asset Allocation</h3>
          </div>
          <div className="flex gap-4 items-center">
             <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin-slow"></div>
             <div>
                <p className="text-xs text-dim">Equity: <span className="text-white">75%</span></p>
                <p className="text-xs text-dim">Cash: <span className="text-white">25%</span></p>
             </div>
          </div>
        </div>
      </div>

      <div className="stat-card mb-6">
         <FuturisticChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
            <Zap className="text-yellow-400" size={24} />
            <div>
                <p className="text-[10px] text-dim uppercase">Volatility Index</p>
                <p className="text-lg font-bold">12.45 Low</p>
            </div>
         </div>
         <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
            <TrendingUp className="text-emerald-400" size={24} />
            <div>
                <p className="text-[10px] text-dim uppercase">Sharpe Ratio</p>
                <p className="text-lg font-bold">2.14 High</p>
            </div>
         </div>
         <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center gap-4">
            <Activity className="text-cyan-400" size={24} />
            <div>
                <p className="text-[10px] text-dim uppercase">Beta (1Y)</p>
                <p className="text-lg font-bold">0.85 Stable</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
