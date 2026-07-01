import React, { useState, useEffect } from "react";
import Menu from "./Menu";
import LiveTicker from "./LiveTicker";
import NotificationBell from "./NotificationBell";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { marketIndices } from "../data/data";

const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3005";

const TopBar = ({ username }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });

  // NSE market hours: 9:15 AM - 3:30 PM IST (Mon-Fri)
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const day = currentTime.getDay();
  const totalMinutes = hours * 60 + minutes;
  const isMarketOpen = day >= 1 && day <= 5 && totalMinutes >= 555 && totalMinutes <= 930;

  return (
    <>
      <div className="topbar-container">
        {/* Left: Brand + Indices */}
        <div className="flex items-center gap-8">
          {/* Logo — clicking redirects to frontend marketing site */}
          <a
            href={FRONTEND_URL}
            id="brand-logo"
            className="brand-logo"
            style={{ textDecoration: "none", cursor: "pointer" }}
            title="Go to StockFlow Pro Homepage"
          >
            <div className="logo-icon">SF</div>
            StockFlow <span style={{ color: "var(--text-dim)", fontWeight: 400, fontSize: "14px", fontFamily: "var(--font-body)" }}>Pro</span>
          </a>

          <div className="indices-container">
            {marketIndices.slice(0, 3).map((idx, i) => (
              <div className="index-item" key={i}>
                <p className="index-name">{idx.name}</p>
                <div className="flex items-center gap-2">
                  <span className="index-value" style={{ color: idx.isUp ? "var(--success)" : "var(--danger)" }}>
                    {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`index-change ${idx.isUp ? "up" : "down"}`}>
                    {idx.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(idx.change).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Market status + Clock + Notification + Menu */}
        <div className="topbar-right">
          <div className={`market-status ${isMarketOpen ? "open" : "closed"}`}>
            <span className="status-dot" />
            {isMarketOpen ? "Market Open" : "Market Closed"}
          </div>

          <div className="market-clock flex items-center gap-1">
            <Clock size={12} />
            {timeString} IST
          </div>

          {/* Dynamic Notification Bell */}
          <NotificationBell />

          <Menu username={username} />
        </div>
      </div>

      <LiveTicker />
    </>
  );
};

export default TopBar;
