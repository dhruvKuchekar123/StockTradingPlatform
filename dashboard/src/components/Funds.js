import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, Wallet, 
  X, CheckCircle, AlertCircle, Loader2, ArrowRightLeft, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatINR = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const Funds = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success", "error", "info"
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [showGatewaySimulator, setShowGatewaySimulator] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      const balanceRes = await axios.get(`${API_URL}/api/wallet/balance`, { withCredentials: true });
      if (balanceRes.data.success) {
        setBalance(balanceRes.data.balance || 0);
      }
      
      const txRes = await axios.get(`${API_URL}/api/wallet/transactions`, { withCredentials: true });
      if (txRes.data.success) {
        setTransactions(txRes.data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleAmountChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*$/.test(val)) {
      setAmount(val);
      setValidationError("");
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setValidationError("");
    setStatusMessage("");

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount)) {
      setValidationError("Please enter a valid amount.");
      return;
    }
    if (numericAmount < 100 || numericAmount > 200000) {
      setValidationError("Amount must be between ₹100 and ₹2,00,000.");
      return;
    }

    setLoading(true);
    setStatusType("info");
    setStatusMessage("Initializing payment...");

    try {
      // 1. Create order on backend
      const { data } = await axios.post(`${API_URL}/api/wallet/create-order`, {
        amount: numericAmount
      }, { withCredentials: true });

      if (!data.success) {
        throw new Error(data.message || "Failed to create order on server.");
      }

      setCreatedOrderId(data.order_id);
      setDepositAmount(numericAmount);
      setShowGatewaySimulator(true);
      setLoading(false);
      setStatusMessage("");
    } catch (err) {
      console.error("Top-up initialization error:", err);
      setStatusType("error");
      setStatusMessage(err.response?.data?.message || err.message || "Failed to initialize payment.");
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    setLoading(true);
    setStatusType("info");
    setStatusMessage("Simulating payment verification...");
    try {
      const verifyRes = await axios.post(`${API_URL}/api/wallet/verify-payment`, {
        razorpay_order_id: createdOrderId,
        razorpay_payment_id: "pay_demo_" + Math.random().toString(36).substr(2, 9),
        razorpay_signature: "mock_signature"
      }, { withCredentials: true });

      if (verifyRes.data.success) {
        setStatusType("success");
        setStatusMessage(`Success! Added ${formatINR(depositAmount)} to your wallet.`);
        setAmount("");
        fetchWalletDetails();
        setTimeout(() => {
          setIsModalOpen(false);
          setShowGatewaySimulator(false);
          setCreatedOrderId("");
          setStatusMessage("");
        }, 2000);
      } else {
        setStatusType("error");
        setStatusMessage(verifyRes.data.message || "Verification failed.");
      }
    } catch (err) {
      setStatusType("error");
      setStatusMessage(err.response?.data?.message || "Simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-up">
      <div className="section-header">
        <div>
          <h1 className="title" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard size={24} style={{ color: "var(--accent-gold)" }} />
            Funds
          </h1>
          <p className="section-subtitle">Manage your trading capital and margin</p>
        </div>
      </div>

      {/* Top Action Bar */}
      <motion.div
        className="glass-card p-5 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="stat-icon gold">
              <Wallet size={20} />
            </div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", margin: "0 0 2px 0", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Available Balance
              </p>
              <p style={{ fontSize: "28px", fontFamily: "var(--font-mono)", fontWeight: 800, color: "var(--accent-gold)", margin: 0 }}>
                {formatINR(balance)}
              </p>
            </div>
          </div>
          <button 
            className="btn btn-gold flex items-center gap-2"
            onClick={() => {
              setIsModalOpen(true);
              setShowGatewaySimulator(false);
              setValidationError("");
              setStatusMessage("");
            }}
          >
            <ArrowDownRight size={16} /> Add Funds
          </button>
        </div>
      </motion.div>

      {/* Transactions Table */}
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2" style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
            <ArrowRightLeft size={18} style={{ color: "var(--accent-gold)" }} />
            Transaction Ledger
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-dim)", fontSize: "12px", fontWeight: 600 }}>
                <th style={{ padding: "12px" }}>TYPE</th>
                <th style={{ padding: "12px" }}>DETAILS</th>
                <th style={{ padding: "12px" }}>AMOUNT</th>
                <th style={{ padding: "12px" }}>STATUS</th>
                <th style={{ padding: "12px" }}>DATE</th>
                <th style={{ padding: "12px" }}>TRANSACTION ID</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const isBuy = tx.type === "BUY";
                const isSell = tx.type === "SELL";
                const isDeposit = tx.type === "DEPOSIT";

                const typeColor = isBuy ? "#EF4444" : isSell ? "#10B981" : "#3B82F6";
                const typeBg = isBuy ? "rgba(239,68,68,0.1)" : isSell ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)";

                let statusColor = "var(--text-dim)";
                if (tx.status === "SUCCESS" || tx.status === "EXECUTED") statusColor = "#10B981";
                else if (tx.status === "FAILED" || tx.status === "REJECTED" || tx.status === "CANCELLED") statusColor = "#EF4444";
                else if (tx.status === "PENDING" || tx.status === "OPEN") statusColor = "#F59E0B";

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: "14px" }}>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{ 
                        color: typeColor, 
                        backgroundColor: typeBg, 
                        padding: "4px 10px", 
                        borderRadius: "6px", 
                        fontWeight: 700,
                        fontSize: "11px",
                        letterSpacing: "0.05em"
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px", fontWeight: 600 }}>
                      {tx.symbol ? `${tx.symbol} (${tx.qty} shares)` : tx.details}
                    </td>
                    <td style={{ padding: "14px 12px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                      {isBuy ? "-" : isSell ? "+" : ""}{formatINR(tx.amount)}
                    </td>
                    <td style={{ padding: "14px 12px", fontWeight: 700, color: statusColor, fontSize: "12px" }}>
                      {tx.status}
                    </td>
                    <td style={{ padding: "14px 12px", color: "var(--text-dim)", fontSize: "13px" }}>
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 12px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-dim)" }}>
                      {tx.id}
                    </td>
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "30px 12px", textAlign: "center", color: "var(--text-dim)" }}>
                    No wallet transactions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999
          }}>
            <motion.div
              className="glass-card p-6"
              style={{ width: "100%", maxWidth: "400px", border: "1px solid var(--accent-gold)" }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-gold)" }}>
                  <ArrowDownRight size={18} />
                  {showGatewaySimulator ? "Demo Gateway Simulator" : "Add Trading Capital"}
                </h3>
                <button 
                  onClick={() => { setIsModalOpen(false); setValidationError(""); setStatusMessage(""); setShowGatewaySimulator(false); }}
                  style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {showGatewaySimulator ? (
                <div>
                  <div style={{ 
                    padding: "16px", 
                    borderRadius: "10px", 
                    backgroundColor: "rgba(212,175,55,0.05)", 
                    border: "1px solid rgba(212,175,55,0.2)",
                    marginBottom: "20px"
                  }}>
                    <div className="flex justify-between items-center mb-3">
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--accent-gold)", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Sparkles size={10} /> STOCKFLOW SECURE MOCK
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-dim)" }}>OFFLINE TESTWAY</span>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Deposit Amount</span>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
                        {formatINR(depositAmount)}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>Mock Order ID</span>
                      <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-dim)", marginTop: "4px" }}>
                        {createdOrderId}
                      </div>
                    </div>
                  </div>

                  {statusMessage && (
                    <div style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      fontSize: "13px", 
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: statusType === "success" ? "rgba(16,185,129,0.1)" : statusType === "error" ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                      color: statusType === "success" ? "#10B981" : statusType === "error" ? "#EF4444" : "#3B82F6",
                      border: `1px solid ${statusType === "success" ? "rgba(16,185,129,0.2)" : statusType === "error" ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`
                    }}>
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : statusType === "success" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleSimulatePayment}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#10B981",
                        color: "#0F1117",
                        fontWeight: 700,
                        cursor: loading ? "default" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? "Verifying..." : "Approve Payment"}
                    </button>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setShowGatewaySimulator(false);
                        setStatusMessage("");
                      }}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        backgroundColor: "transparent",
                        color: "var(--text-main)",
                        fontWeight: 700,
                        cursor: loading ? "default" : "pointer",
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.3s ease",
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddFunds}>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-dim)", display: "block", marginBottom: "8px", fontWeight: 600 }}>
                      Enter Amount (INR)
                    </label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--text-dim)" }}>
                        ₹
                      </span>
                      <input
                        type="text"
                        placeholder="Min ₹100 - Max ₹2,00,000"
                        value={amount}
                        onChange={handleAmountChange}
                        disabled={loading}
                        style={{
                          width: "100%",
                          padding: "12px 12px 12px 30px",
                          borderRadius: "10px",
                          border: "1px solid var(--border)",
                          backgroundColor: "rgba(255,255,255,0.03)",
                          color: "#fff",
                          fontFamily: "var(--font-mono)",
                          fontSize: "16px",
                          fontWeight: 700,
                          outline: "none"
                        }}
                      />
                    </div>
                    {validationError && (
                      <p style={{ color: "var(--danger)", fontSize: "12px", margin: "6px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                        <AlertCircle size={12} /> {validationError}
                      </p>
                    )}
                  </div>

                  {statusMessage && (
                    <div style={{ 
                      padding: "12px", 
                      borderRadius: "8px", 
                      fontSize: "13px", 
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: statusType === "success" ? "rgba(16,185,129,0.1)" : statusType === "error" ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                      color: statusType === "success" ? "#10B981" : statusType === "error" ? "#EF4444" : "#3B82F6",
                      border: `1px solid ${statusType === "success" ? "rgba(16,185,129,0.2)" : statusType === "error" ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`
                    }}>
                      {loading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : statusType === "success" ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>{statusMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "10px",
                      border: "none",
                      fontWeight: 700,
                      cursor: loading ? "default" : "pointer",
                      backgroundColor: "var(--accent-gold)",
                      color: "#0F1117",
                      opacity: loading ? 0.7 : 1,
                      transition: "all 0.3s ease",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    {loading ? "Processing..." : "Add Funds (Demo Gateway)"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Funds;
