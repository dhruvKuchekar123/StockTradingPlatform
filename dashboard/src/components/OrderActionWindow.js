import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { X, Info, TrendingUp, TrendingDown } from "lucide-react";
import "./BuyActionWindow.css"; // Reuse the same CSS file for both

const OrderActionWindow = ({ uid, mode }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(100.0);
  const { closeOrderWindow } = useContext(GeneralContext);

  const isBuy = mode === "BUY";

  const handleOrderClick = async () => {
    try {
      await axios.post("http://localhost:3002/newOrder", {
        name: uid,
        qty: stockQuantity,
        price: stockPrice,
        mode: mode,
      });
      closeOrderWindow();
    } catch (error) {
      console.error("Order failed", error);
    }
  };

  return (
    <div className="buy-window-container" id="buy-window" style={{ 
      borderColor: isBuy ? "#0052fe" : "#ff4d4d",
      boxShadow: isBuy ? "0 20px 50px rgba(0, 82, 254, 0.2)" : "0 20px 50px rgba(255, 77, 77, 0.2)"
    }}>
      <div className="buy-window-header" style={{ 
        background: isBuy ? "linear-gradient(90deg, #0052fe, #00f2ff)" : "linear-gradient(90deg, #ff4d4d, #ff944d)" 
      }}>
        <div className="flex items-center gap-2">
          {isBuy ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <h3 className="m-0">{mode} {uid}</h3>
        </div>
        <X className="cursor-pointer hover:text-white/70" size={20} onClick={closeOrderWindow} />
      </div>

      <div className="buy-window-content">
        <div className="flex justify-between mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
          <div>
            <p className="text-[10px] text-dim m-0 uppercase tracking-wider">LTP</p>
            <p className="text-xl font-bold m-0">₹{stockPrice.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-dim m-0 uppercase tracking-wider">Change</p>
            <p className={`text-sm font-bold m-0 ${isBuy ? 'text-success' : 'text-danger'}`}>
              {isBuy ? '+1.45%' : '-0.85%'}
            </p>
          </div>
        </div>

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
            <label>Limit Price</label>
            <input
              type="number"
              className="buy-input"
              step="0.05"
              value={stockPrice}
              onChange={(e) => setStockPrice(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="buy-window-footer">
        <div className="margin-info">
          {isBuy ? 'Required' : 'Estimated Value'}: <span>₹{(stockQuantity * stockPrice).toFixed(2)}</span>
        </div>
        <div className="btn-group">
          <button className="btn-cancel" onClick={closeOrderWindow}>Cancel</button>
          <button 
            className="btn-buy-confirm" 
            onClick={handleOrderClick}
            style={{ backgroundColor: isBuy ? "#0052fe" : "#ff4d4d" }}
          >
            Confirm {mode}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderActionWindow;
