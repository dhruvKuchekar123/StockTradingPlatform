import React from "react";
import { watchlist as initialWatchlist, marketIndices } from "../data/data";
import usePriceFeed from "../hooks/usePriceFeed";

const LiveTicker = () => {
  const watchlistSymbols = initialWatchlist.map(s => s.name);
  const { prices } = usePriceFeed(watchlistSymbols);

  const tickerItems = [
    ...marketIndices.map(idx => ({
      symbol: idx.name,
      price: idx.value,
      change: idx.change,
      isUp: idx.isUp,
      isIndex: true,
    })),
    ...initialWatchlist.map(stock => {
      const live = prices[stock.name];
      const price = live ? live.price : stock.price;
      const changePercent = live ? live.changePercent : parseFloat(stock.percent);
      const isUp = live ? live.change >= 0 : !stock.isDown;
      return {
        symbol: stock.name,
        price,
        change: changePercent,
        isUp,
        isIndex: false,
      };
    }),
  ];

  // Duplicate for seamless infinite scroll
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker-strip">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <div className="ticker-item" key={i}>
            <span className="ticker-symbol">{item.symbol}</span>
            <span className="ticker-price">
              {item.isIndex
                ? item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : `₹${item.price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className={`ticker-change ${item.isUp ? "up" : "down"}`}>
              {item.isUp ? "▲" : "▼"} {Math.abs(Number(item.change)).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveTicker;
