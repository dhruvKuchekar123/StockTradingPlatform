import React, { useState, useContext } from "react";
import GeneralContext from "./GeneralContext";
import { watchlist } from "../data/data";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  BarChart3, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Info
} from "lucide-react";
import { Tooltip } from "@mui/material";

const WatchList = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredList = watchlist.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="watchlist-container">
      <div className="search-container">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" size={16} />
          <input
            type="text"
            placeholder="Search symbols..."
            className="search-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <ul className="stock-list">
        {filteredList.map((stock, index) => (
          <WatchListItem stock={stock} key={index} />
        ))}
      </ul>
    </div>
  );
};

const WatchListItem = ({ stock }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <li 
      className="stock-item" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${stock.isDown ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
          {stock.isDown ? (
            <TrendingDown size={18} className="text-danger" />
          ) : (
            <TrendingUp size={18} className="text-success" />
          )}
        </div>
        <div>
          <p className="stock-symbol">{stock.name}</p>
          <p className="stock-company">{stock.name} Ltd.</p>
        </div>
      </div>

      <div className="text-right">
        {isHovered ? (
          <WatchListActions symbol={stock.name} />
        ) : (
          <>
            <p className="stock-price">₹{stock.price}</p>
            <p className={`text-xs ${stock.isDown ? 'text-danger' : 'text-success'}`}>
              {stock.percent}
            </p>
          </>
        )}
      </div>
    </li>
  );
};

const WatchListActions = ({ symbol }) => {
  const generalContext = useContext(GeneralContext);

  return (
    <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
      <Tooltip title="Buy">
        <button 
          className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white border-none cursor-pointer"
          onClick={() => generalContext.openOrderWindow(symbol, "BUY")}
        >
          <ChevronUp size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Sell">
        <button 
          className="p-1.5 bg-red-600 hover:bg-red-500 rounded text-white border-none cursor-pointer"
          onClick={() => generalContext.openOrderWindow(symbol, "SELL")}
        >
          <ChevronDown size={16} />
        </button>
      </Tooltip>

      <Tooltip title="Chart">
        <button className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300">
          <BarChart3 size={16} />
        </button>
      </Tooltip>
      <Tooltip title="Details">
        <button className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300">
          <MoreHorizontal size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

export default WatchList;
