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

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleOrderClick = async () => {
    if (isBuy) {
      try {
        const res = await loadRazorpay();
        if (!res) {
          alert("Razorpay SDK failed to load.");
          return;
        }

        const { data } = await axios.post("http://localhost:3002/api/payments/create-order", {
          symbol: uid,
          qty: stockQuantity,
          price: stockPrice,
        }, { withCredentials: true });
        
        const { order, livePrice, razorpay_key } = data;

        const options = {
          key: "rzp_test_Sk37mMhAQgZ7kY", // Hardcoded test key to prevent env/trim issues
          amount: Number(order.amount),
          currency: "INR", // Test mode strictly expects INR in most Indian test accounts
          name: "StockFlow",
          description: `Buying ${stockQuantity} shares of ${uid}`,
          order_id: order.id,
          prefill: {
            name: "Test User",
            email: "testuser@example.com",
            contact: "9999999999"
          },
          handler: async function (response) {
              try {
                  const verifyRes = await axios.post("http://localhost:3002/api/payments/verify-and-buy", {
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                      symbol: uid,
                      qty: stockQuantity,
                      price: livePrice
                  }, { withCredentials: true });

                  if(verifyRes.data.success) {
                      alert(verifyRes.data.message + " An email receipt has been sent.");
                      closeOrderWindow();
                  }
              } catch(e) {
                  alert(e.response?.data?.message || "Payment verification failed!");
              }
          },
          theme: { color: "#0052fe" }
        };

        const paymentObject = new window.Razorpay(options);

        paymentObject.on('payment.failed', function (response) {
            console.error("Razorpay Payment Failed:", response.error);
            alert(`Payment Failed!\nReason: ${response.error.description}\nStep: ${response.error.step}`);
        });

        paymentObject.open();

      } catch (error) {
        console.error("Buy Order failed", error);
        alert(error.response?.data?.message || "Failed to initiate payment.");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:3002/newOrder", {
          name: uid,
          qty: stockQuantity,
          price: stockPrice,
          mode: "SELL",
        }, { withCredentials: true });
        alert((response.data.message || "Sold successfully!") + " An email receipt has been sent.");
        closeOrderWindow();
      } catch (error) {
        console.error("Sell Order failed", error);
        alert(error.response?.data?.message || "Failed to sell stock.");
      }
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
            <p className="text-xl font-bold m-0">${stockPrice.toFixed(2)}</p>
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
          {isBuy ? 'Required' : 'Estimated Value'}: <span>${(stockQuantity * stockPrice).toFixed(2)}</span>
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
