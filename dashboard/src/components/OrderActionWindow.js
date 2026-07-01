import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import { X, TrendingUp, TrendingDown, Info, AlertTriangle } from "lucide-react";
import { 
  Tabs, Tab, ToggleButton, ToggleButtonGroup, 
  TextField, Slider, CircularProgress, Select, MenuItem, InputLabel, FormControl 
} from "@mui/material";
import { motion } from "framer-motion";
import "./BuyActionWindow.css"; 
import usePriceFeed from "../hooks/usePriceFeed";

const OrderActionWindow = ({ uid, mode: initialMode }) => {
  const { closeOrderWindow } = useContext(GeneralContext);
  const navigate = useNavigate();
  
  const { prices: livePrices } = usePriceFeed([uid]);
  const livePriceData = livePrices[uid] || { price: 100.0, changePercent: "+0.00" };
  const ltp = Number(livePriceData.price) || 100.0;

  const [side, setSide] = useState(initialMode || "BUY");
  const [tabIndex, setTabIndex] = useState(0);
  const [orderType, setOrderType] = useState("MARKET");

  const [qty, setQty] = useState(1);
  const [limitPrice, setLimitPrice] = useState(ltp);
  const [triggerPrice, setTriggerPrice] = useState(ltp);
  const [gttCondition, setGttCondition] = useState("ABOVE");
  
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const [gttExpiry, setGttExpiry] = useState(nextYear.toISOString().split('T')[0]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isBuy = side === "BUY";
  
  const [walletBalance, setWalletBalance] = useState(0); 
  const [availableQty, setAvailableQty] = useState(10); 
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await axios.get("http://localhost:3002/api/wallet/balance", { withCredentials: true });
        if (data.success) {
          setWalletBalance(data.balance || 0);
        }
      } catch (err) {
        console.error("Failed to fetch wallet balance in OrderActionWindow:", err);
      }
    };
    fetchBalance();
    
    // Generate unique idempotency key for this order session
    setIdempotencyKey(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
  }, [uid, side, qty, orderType]); // Regenerate if configuration changes, but will be stable on double-click submitting

  useEffect(() => {
    if (orderType === 'MARKET') {
        setLimitPrice(ltp);
    }
  }, [ltp, orderType]);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    if (newValue === 0) setOrderType("MARKET");
    if (newValue === 1) setOrderType("SL");
    if (newValue === 2) setOrderType("GTT");
  };

  const handleRegularTypeChange = (event, newValue) => {
    if (newValue) setOrderType(newValue);
  };

  const submitOrder = async () => {
    setErrorMsg("");
    setIsLoading(true);

    try {
        // --- Place order using internal wallet balance ---
        const payload = {
            symbol: uid,
            qty,
            orderType,
            side,
            limitPrice: ['LIMIT', 'GTT'].includes(orderType) ? limitPrice : undefined,
            triggerPrice: ['SL', 'GTT'].includes(orderType) ? triggerPrice : undefined,
            gttCondition: orderType === 'GTT' ? gttCondition : undefined,
            gttExpiry: orderType === 'GTT' ? new Date(gttExpiry).toISOString() : undefined,
            idempotencyKey
        };

        const { data } = await axios.post("http://localhost:3002/api/orders/place", payload, { withCredentials: true });
        
        if (data.success) {
            showSuccess();
        } else {
            setErrorMsg(data.message || "Order placement failed.");
            setIsLoading(false);
        }
    } catch (error) {
        setErrorMsg(error.response?.data?.message || error.message || "Order placement failed");
        setIsLoading(false);
    }
  };

  const showSuccess = () => {
    setIsSuccess(true);
    setIsLoading(false);
    setTimeout(() => {
        closeOrderWindow();
    }, 1500);
  };

  const estTotal = orderType === 'MARKET' ? (qty * ltp) : (qty * limitPrice);
  const fee = 20.00; // Flat ₹20 transaction fee
  const totalCost = estTotal + fee;
  const isInsufficient = isBuy && (walletBalance < totalCost);

  const accentColor = isBuy ? "#D4AF37" : "#EF4444";
  const accentBg = isBuy ? "linear-gradient(135deg, #D4AF37, #E8C547)" : "linear-gradient(135deg, #EF4444, #F87171)";

  return (
    <div className="buy-window-container" id="buy-window" style={{ 
      borderColor: accentColor,
      boxShadow: `0 24px 64px rgba(0, 0, 0, 0.5), 0 0 40px ${isBuy ? 'rgba(212,175,55,0.1)' : 'rgba(239,68,68,0.1)'}`,
      width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto'
    }}>
      <div className="buy-window-header" style={{ 
        background: accentBg,
        color: isBuy ? "#0F1117" : "white",
      }}>
        <div className="flex items-center gap-2">
          {isBuy ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
          <h3 className="m-0">{uid}</h3>
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "4px",
            background: isBuy ? "rgba(15,17,23,0.2)" : "rgba(255,255,255,0.2)",
            textTransform: "uppercase",
          }}>
            {side}
          </span>
        </div>
        <X className="cursor-pointer" size={20} onClick={closeOrderWindow} style={{ opacity: 0.8 }} />
      </div>

      <div className="buy-window-content p-4" style={{ color: "var(--text-main)" }}>
        
        {/* BUY / SELL Toggle */}
        <div className="flex justify-center mb-4">
            <ToggleButtonGroup
                value={side}
                exclusive
                onChange={(e, val) => val && setSide(val)}
                aria-label="side"
                fullWidth
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: "10px" }}
            >
                <ToggleButton value="BUY" style={{ 
                  color: side === 'BUY' ? '#0F1117' : 'var(--text-dim)', 
                  backgroundColor: side === 'BUY' ? '#D4AF37' : 'transparent',
                  fontWeight: 700,
                  borderColor: "var(--border)",
                }}>
                    BUY
                </ToggleButton>
                <ToggleButton value="SELL" style={{ 
                  color: side === 'SELL' ? '#fff' : 'var(--text-dim)', 
                  backgroundColor: side === 'SELL' ? '#EF4444' : 'transparent',
                  fontWeight: 700,
                  borderColor: "var(--border)",
                }}>
                    SELL
                </ToggleButton>
            </ToggleButtonGroup>
        </div>

        {/* ORDER TYPE TABS */}
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          textColor="inherit" 
          variant="fullWidth" 
          className="mb-4"
          sx={{
            '& .MuiTab-root': { color: 'var(--text-dim)', fontWeight: 600, fontSize: '12px' },
            '& .Mui-selected': { color: 'var(--accent-gold) !important' },
            '& .MuiTabs-indicator': { backgroundColor: 'var(--accent-gold)' },
          }}
        >
            <Tab label="Regular" />
            <Tab label="Stop-Loss" />
            <Tab label="GTT" />
        </Tabs>

        {/* REGULAR TAB */}
        {tabIndex === 0 && (
            <div>
                <ToggleButtonGroup
                    value={orderType}
                    exclusive
                    onChange={handleRegularTypeChange}
                    aria-label="order type"
                    size="small"
                    className="mb-4"
                >
                    <ToggleButton value="MARKET" style={{ color: '#fff', borderColor: 'var(--border)' }}>Market</ToggleButton>
                    <ToggleButton value="LIMIT" style={{ color: '#fff', borderColor: 'var(--border)' }}>Limit</ToggleButton>
                </ToggleButtonGroup>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <TextField 
                        label="Qty" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} 
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                    <TextField 
                        label="Price" type="number" 
                        value={orderType === 'MARKET' ? ltp : limitPrice} 
                        onChange={e => setLimitPrice(Number(e.target.value))}
                        disabled={orderType === 'MARKET'}
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                </div>

                <div className="mb-4 px-2">
                    <p style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "4px" }}>Quantity Slider</p>
                    <Slider 
                        value={qty} 
                        onChange={(e, val) => setQty(val)} 
                        min={1} 
                        max={side === 'SELL' ? Math.max(availableQty, 1) : Math.max(Math.floor(walletBalance/ltp), 1)}
                        valueLabelDisplay="auto"
                        sx={{ color: isBuy ? '#D4AF37' : '#EF4444' }}
                    />
                </div>
            </div>
        )}

        {/* STOP-LOSS TAB */}
        {tabIndex === 1 && (
            <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <TextField 
                        label="Qty" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} 
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                    <TextField 
                        label="Trigger Price" type="number" value={triggerPrice} onChange={e => setTriggerPrice(Number(e.target.value))}
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Info size={13} />
                    {isBuy 
                        ? `Order triggers and executes at market when price rises ABOVE ₹${triggerPrice}` 
                        : `Order triggers and executes at market when price falls BELOW ₹${triggerPrice}`}
                </div>
            </div>
        )}

        {/* GTT TAB */}
        {tabIndex === 2 && (
            <div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <TextField 
                        label="Qty" type="number" value={qty} onChange={e => setQty(Number(e.target.value))} 
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                    <TextField 
                        label="Trigger Price" type="number" value={triggerPrice} onChange={e => setTriggerPrice(Number(e.target.value))}
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                    <TextField 
                        label="Limit Price" type="number" value={limitPrice} onChange={e => setLimitPrice(Number(e.target.value))}
                        InputLabelProps={{ style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                    <TextField 
                        label="Expiry Date" type="date" value={gttExpiry} onChange={e => setGttExpiry(e.target.value)}
                        InputLabelProps={{ shrink: true, style: { color: 'var(--text-dim)' } }} InputProps={{ style: { color: '#fff' } }}
                    />
                </div>
                <FormControl fullWidth className="mb-4">
                    <InputLabel style={{color: 'var(--text-dim)'}}>Trigger Condition</InputLabel>
                    <Select
                        value={gttCondition}
                        label="Trigger Condition"
                        onChange={e => setGttCondition(e.target.value)}
                        style={{ color: '#fff', border: '1px solid var(--border)' }}
                    >
                        <MenuItem value="ABOVE">Price goes ABOVE trigger</MenuItem>
                        <MenuItem value="BELOW">Price goes BELOW trigger</MenuItem>
                    </Select>
                </FormControl>
                <div style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Info size={13} />
                    If {uid} crosses ₹{triggerPrice} → {isBuy ? 'Buy' : 'Sell'} {qty} shares at ₹{limitPrice}. Valid until: {new Date(gttExpiry).toLocaleDateString()}
                </div>
            </div>
        )}

        {/* Summary & Submit */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border-light)",
          borderRadius: "10px",
          padding: "14px",
          marginBottom: "16px",
        }}>
            <div className="flex justify-between mb-2" style={{ fontSize: "13px" }}>
                <span style={{ color: "var(--text-dim)" }}>Available Wallet Balance</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--accent-gold)" }}>
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            <div className="flex justify-between mb-2" style={{ fontSize: "13px" }}>
                <span style={{ color: "var(--text-dim)" }}>Market Price (LTP)</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                  ₹{ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
            <div className="flex justify-between" style={{ fontSize: "13px" }}>
                <span style={{ color: "var(--text-dim)" }}>Est. Total (inc. ₹{fee} fee)</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: side === 'BUY' ? 'var(--accent-gold)' : '#EF4444' }}>
                  ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            </div>
        </div>

        {errorMsg && <div style={{ color: "var(--danger)", fontSize: "12px", marginBottom: "12px" }}>{errorMsg}</div>}

        {isInsufficient && (
          <div style={{ 
            padding: "12px", 
            backgroundColor: "rgba(239,68,68,0.1)", 
            border: "1px solid rgba(239,68,68,0.2)", 
            borderRadius: "10px", 
            marginBottom: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "8px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#EF4444", fontSize: "13px", fontWeight: 700 }}>
              <AlertTriangle size={16} />
              <span>Insufficient balance</span>
            </div>
            <p style={{ color: "var(--text-dim)", fontSize: "12px", margin: 0 }}>
              You need an additional ₹{(totalCost - walletBalance).toFixed(2)} to place this order.
            </p>
            <button 
              onClick={() => { navigate("/funds"); closeOrderWindow(); }}
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "#0F1117",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "12px",
                width: "fit-content",
                marginTop: "4px"
              }}
            >
              Go to Funds page to Add Capital
            </button>
          </div>
        )}

        {isSuccess ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--success)", padding: "12px", fontWeight: 700 }}>
                <span>✓ Order Executed Successfully!</span>
                <span style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "4px", fontWeight: 500 }}>Receipt has been sent to your email.</span>
            </motion.div>
        ) : (
            <button 
                onClick={submitOrder}
                disabled={isLoading || isInsufficient}
                style={{ 
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  border: "none",
                  cursor: (isLoading || isInsufficient) ? "default" : "pointer",
                  background: accentBg,
                  color: isBuy ? "#0F1117" : "white",
                  opacity: (isLoading || isInsufficient) ? 0.5 : 1,
                  transition: "all 0.3s ease",
                  fontFamily: "var(--font-body)",
                }}
            >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : `Place ${side} Order`}
            </button>
        )}
      </div>
    </div>
  );
};

export default OrderActionWindow;
