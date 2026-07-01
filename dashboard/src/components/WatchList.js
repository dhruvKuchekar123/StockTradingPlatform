import React, { useState, useEffect, useContext, useRef } from "react";
import GeneralContext from "./GeneralContext";
import { watchlist as initialWatchlist } from "../data/data";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  BarChart3, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Tooltip } from "@mui/material";
import { motion } from "framer-motion";
import usePriceFeed from "../hooks/usePriceFeed";

// Simple sparkline SVG generator
const MiniSparkline = ({ data, color, width = 48, height = 18 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => 
    `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`
  ).join(" ");

  return (
    <svg className="sparkline" width={width} height={height}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Generate random sparkline data for visual flair
const generateSparkData = () => Array.from({ length: 12 }, () => Math.random() * 40 + 30);

const WatchList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sparkData] = useState(() => {
    const map = {};
    initialWatchlist.forEach(s => { map[s.name] = generateSparkData(); });
    return map;
  });
  
  const watchlistSymbols = initialWatchlist.map(s => s.name);
  const { prices, connected } = usePriceFeed(watchlistSymbols);

  const filteredList = initialWatchlist.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="watchlist-container">
      <div className="search-container flex items-center justify-between">
        <div className="relative flex-grow">
          <Search 
            size={15} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)" 
            }} 
          />
          <input
            type="text"
            placeholder="Search stocks..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            id="watchlist-search"
          />
        </div>
        <Tooltip title={connected ? "Live Data Active" : "Disconnected"}>
          <div style={{ marginLeft: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: connected ? "var(--success)" : "var(--text-muted)",
              animation: connected ? "pulse-dot 2s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontSize: "9px", color: "var(--text-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {connected ? "LIVE" : "OFF"}
            </span>
          </div>
        </Tooltip>
      </div>

      <ul className="stock-list">
        {filteredList.map((stock, index) => {
          const liveData = prices[stock.name];
          const livePrice = liveData ? liveData.price : stock.price;
          const isDown = liveData ? liveData.change < 0 : stock.isDown;
          const percent = liveData ? liveData.changePercent.toFixed(2) : stock.percent.replace('%', '');
          
          return (
            <WatchListItem 
              key={index} 
              stock={{ 
                ...stock, 
                price: livePrice, 
                isDown, 
                percent: `${isDown ? '' : '+'}${percent}%` 
              }} 
              sparkData={sparkData[stock.name]}
            />
          );
        })}
      </ul>
    </div>
  );
};

const WatchListItem = ({ stock, sparkData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const prevPriceRef = useRef(stock.price);
  const [flashColor, setFlashColor] = useState("transparent");
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    if (stock.price > prevPriceRef.current) {
      setFlashColor("rgba(34, 197, 94, 0.12)");
      setTimeout(() => setFlashColor("transparent"), 500);
    } else if (stock.price < prevPriceRef.current) {
      setFlashColor("rgba(239, 68, 68, 0.12)");
      setTimeout(() => setFlashColor("transparent"), 500);
    }
    prevPriceRef.current = stock.price;
  }, [stock.price]);

  return (
    <motion.li 
      className="stock-item" 
      animate={{ backgroundColor: flashColor }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => generalContext.selectStock(stock.name)}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-center gap-3">
        <MiniSparkline 
          data={sparkData} 
          color={stock.isDown ? "var(--danger)" : "var(--success)"} 
        />
        <div>
          <p className="stock-symbol">{stock.name}</p>
          <p className="stock-company">{stock.fullName || `${stock.name} Ltd.`}</p>
          {stock.sector && <span className="stock-sector">{stock.sector}</span>}
        </div>
      </div>

      <div className="text-right">
        {isHovered ? (
          <WatchListActions symbol={stock.name} />
        ) : (
          <>
            <p className="stock-price">
              ₹{Number(stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`stock-change ${stock.isDown ? 'text-danger' : 'text-success'}`}>
              {stock.percent}
            </p>
          </>
        )}
      </div>
    </motion.li>
  );
};

const WatchListActions = ({ symbol }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <div className="flex gap-2" style={{ animation: "fadeIn 0.15s ease" }}>
      <Tooltip title="Buy">
        <button 
          style={{
            padding: "6px 10px",
            background: "var(--accent-blue)",
            borderRadius: "6px",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => generalContext.openOrderWindow(symbol, "BUY")}
        >
          <ChevronUp size={14} />
        </button>
      </Tooltip>
      <Tooltip title="Sell">
        <button 
          style={{
            padding: "6px 10px",
            background: "var(--danger)",
            borderRadius: "6px",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => generalContext.openOrderWindow(symbol, "SELL")}
        >
          <ChevronDown size={14} />
        </button>
      </Tooltip>
      <Tooltip title="Open Chart">
        <button
          style={{
            padding: "6px 10px",
            background: "rgba(212,175,55,0.12)",
            borderRadius: "6px",
            color: "var(--accent-gold)",
            border: "1px solid rgba(212,175,55,0.3)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => generalContext.openChartModal(symbol)}
        >
          <BarChart3 size={14} />
        </button>
      </Tooltip>
      <Tooltip title="Details">
        <button style={{
          padding: "6px 10px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "6px",
          color: "var(--text-dim)",
          border: "1px solid var(--border)",
          cursor: "pointer",
          transition: "all 0.2s",
        }}>
          <MoreHorizontal size={14} />
        </button>
      </Tooltip>
    </div>
  );
};

export default WatchList;

