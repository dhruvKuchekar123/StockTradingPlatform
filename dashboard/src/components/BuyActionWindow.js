import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { X, Info } from "lucide-react";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(100.0);
  const { closeBuyWindow } = useContext(GeneralContext);

  const handleBuyClick = async () => {
    try {
      await axios.post("http://localhost:3002/newOrder", {
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: "BUY",
      });
      closeBuyWindow();
    } catch (error) {
      console.error("Order failed", error);
    }
  };

  return (
    <div className="buy-window-container" id="buy-window">
      <div className="buy-window-header">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded">
            <h3 className="m-0">BUY {uid}</h3>
          </div>
        </div>
        <X className="cursor-pointer hover:text-white/70" size={20} onClick={closeBuyWindow} />
      </div>

      <div className="buy-window-content">
        <div className="grid grid-cols-2 gap-4">
          <div className="input-group">
            <label>Quantity</label>
            <input
              type="number"
              className="buy-input"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label>Price (LTP)</label>
            <input
              type="number"
              className="buy-input"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg flex items-start gap-3 mt-2">
          <Info className="text-blue-400 shrink-0" size={16} />
          <p className="text-[11px] text-dim m-0">
            Market orders are executed at the best available price in the market. 
            Ensure you have sufficient margin before placing the order.
          </p>
        </div>
      </div>

      <div className="buy-window-footer">
        <div className="margin-info">
          Margin Required: <span>₹{(stockQuantity * stockPrice * 0.2).toFixed(2)}</span>
        </div>
        <div className="btn-group">
          <button className="btn-cancel" onClick={closeBuyWindow}>Cancel</button>
          <button className="btn-buy-confirm" onClick={handleBuyClick}>Buy Stock</button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;