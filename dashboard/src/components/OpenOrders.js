import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableRow, Chip, Button } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import usePriceFeed from "../hooks/usePriceFeed";

const statusColors = {
  OPEN: "primary",
  TRIGGERED: "warning",
  EXECUTED: "success",
  CANCELLED: "default",
  REJECTED: "error"
};

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const OpenOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lastOrderEvent } = usePriceFeed([]);

  const fetchOpenOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/open`, { withCredentials: true });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch open orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenOrders();
  }, []);

  // Listen to websocket events
  useEffect(() => {
    if (lastOrderEvent && lastOrderEvent._id) {
      setOrders(prev => prev.map(o => o._id === lastOrderEvent._id ? lastOrderEvent : o));
      
      // Optionally remove it after a delay since it's EXECUTED and no longer OPEN
      setTimeout(() => {
        setOrders(prev => prev.filter(o => o._id !== lastOrderEvent._id));
      }, 5000);
    }
  }, [lastOrderEvent]);

  const handleCancel = async (orderId) => {
    try {
      await axios.delete(`${API_URL}/api/orders/${orderId}`, { withCredentials: true });
      setOrders(prev => prev.filter(o => o._id !== orderId));
    } catch (err) {
      alert("Failed to cancel order: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-white p-4">Loading Open Orders...</div>;

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4">
      <h3 className="text-white mb-4">Open Orders</h3>
      <Table sx={{ minWidth: 650 }} aria-label="open orders table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#ccc' }}>Symbol</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Type</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Side</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Qty</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Price Target</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Status</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <AnimatePresence>
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ color: '#888', borderBottom: 'none' }}>
                  No open orders
                </TableCell>
              </TableRow>
            )}
            {orders.map((order) => {
              const priceTarget = order.orderType === 'LIMIT' ? `₹${order.limitPrice}` : 
                                  order.orderType === 'SL' ? `Trigger ₹${order.triggerPrice}` : 
                                  order.orderType === 'GTT' ? `Trigger ₹${order.triggerPrice} → Limit ₹${order.limitPrice}` : '-';
              
              const isNewlyExecuted = lastOrderEvent && lastOrderEvent._id === order._id;

              return (
                <motion.tr 
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    backgroundColor: isNewlyExecuted ? "rgba(76, 175, 80, 0.2)" : "transparent"
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <TableCell sx={{ color: '#fff' }}>{order.symbol}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{order.orderType}</TableCell>
                  <TableCell sx={{ color: order.side === 'BUY' ? '#0052fe' : '#ff4d4d', fontWeight: 'bold' }}>
                    {order.side}
                  </TableCell>
                  <TableCell sx={{ color: '#fff' }}>{order.qty}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{priceTarget}</TableCell>
                  <TableCell>
                    <Chip 
                      label={order.status} 
                      color={statusColors[order.status]} 
                      size="small" 
                      variant="outlined" 
                    />
                  </TableCell>
                  <TableCell>
                    {order.status === 'OPEN' || order.status === 'PENDING' ? (
                      <Button size="small" color="error" variant="text" onClick={() => handleCancel(order._id)}>
                        Cancel
                      </Button>
                    ) : (
                      <Button size="small" color="inherit" variant="text">
                        View
                      </Button>
                    )}
                  </TableCell>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
};

export default OpenOrders;
