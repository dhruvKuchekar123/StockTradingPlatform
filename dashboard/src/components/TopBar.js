import React from "react";
import Menu from "./Menu";
import { TrendingUp, TrendingDown } from "lucide-react";

const TopBar = ({ username }) => {
  return (
    <div className="topbar-container">
      <div className="indices-container">
        <div className="index-item">
          <p className="index-name">NIFTY 50</p>
          <div className="flex items-center gap-1">
            <span className="index-value text-emerald-400">22,419.55</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1 rounded flex items-center">
              <TrendingUp size={10} /> 0.45%
            </span>
          </div>
        </div>
        <div className="index-item">
          <p className="index-name">SENSEX</p>
          <div className="flex items-center gap-1">
            <span className="index-value text-red-400">73,876.82</span>
            <span className="text-[10px] bg-red-500/10 text-red-400 px-1 rounded flex items-center">
              <TrendingDown size={10} /> 0.12%
            </span>
          </div>
        </div>
      </div>

      <Menu username={username} />
    </div>
  );
};

export default TopBar;
