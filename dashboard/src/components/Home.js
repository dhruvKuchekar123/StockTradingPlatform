import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import TopBar from "./TopBar";
import axios from "axios";
import { useNotifications } from "./NotificationContext";
import usePriceFeed from "../hooks/usePriceFeed";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3005";

// Global auto-logout on any 401/403 response
const setupAxiosInterceptors = (frontendUrl) => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Only auto-redirect if it's a real 401, not a handled JSON { status: false }
        const data = error.response?.data;
        if (data?.status === false && data?.code) {
          // Handled auth failures — redirect with the error code message
          localStorage.removeItem("token");
          const msg = encodeURIComponent(data.message || "Session expired. Please log in again.");
          window.location.href = `${frontendUrl}/login?message=${msg}`;
        }
      }
      return Promise.reject(error);
    }
  );
};

const OrderNotificationHandler = () => {
  const { addNotification } = useNotifications();
  // Subscribe to all watchlist symbols for order events
  const { lastOrderEvent } = usePriceFeed([]);

  useEffect(() => {
    if (!lastOrderEvent) return;
    const order = lastOrderEvent;
    const isBuy = order.side === "BUY";
    const isRejected = order.status === "REJECTED";
    const isGTT = order.orderType === "GTT";

    let type = isBuy ? "ORDER_BUY" : "ORDER_SELL";
    if (isRejected) type = "ORDER_REJECTED";
    if (isGTT && order.status === "TRIGGERED") type = "GTT_TRIGGERED";

    addNotification({
      type,
      title: isRejected
        ? `Order Rejected — ${order.symbol}`
        : `${isBuy ? "Buy" : "Sell"} Order Executed — ${order.symbol}`,
      message: isRejected
        ? `Your ${order.orderType} order for ${order.qty} share(s) of ${order.symbol} was rejected: ${order.notes || "Insufficient funds"}`
        : `${order.qty} share(s) of ${order.symbol} ${isBuy ? "purchased" : "sold"} at ₹${Number(order.executedPrice || 0).toFixed(2)}`,
    });
  }, [lastOrderEvent, addNotification]);

  return null;
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // 1. Extract token from URL parameters or fallback to localStorage
    const urlParams = new URLSearchParams(window.location.search);
    let token = urlParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Clean up URL parameters so the token is not visible in the address bar
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      token = localStorage.getItem("token");
    }

    // 2. Set up Axios global request interceptor to include the token in Authorization header
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          config.headers["Authorization"] = `Bearer ${storedToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 3. Set up global response interceptor for auto-logout on 401
    setupAxiosInterceptors(FRONTEND_URL);

    const verifyUser = async () => {
      try {
        const { data } = await axios.post(
          `${API_URL}/`,
          {},
          { 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            withCredentials: true 
          }
        );
        if (!data.status) {
          const redirectUrl = data.code 
            ? `${FRONTEND_URL}/login?error=${data.code}&message=${encodeURIComponent(data.message)}`
            : `${FRONTEND_URL}/login`;
          window.location.href = redirectUrl;
        } else {
          setUsername(data.user);
          setLoading(false);
        }

      } catch (error) {
        window.location.href = `${FRONTEND_URL}/login`;
      }
    };
    verifyUser();

    // Clean up request interceptor on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">StockFlow Pro</div>
        <div className="loading-bar" />
        <div className="loading-text">Initializing Trading Terminal...</div>
      </div>
    );
  }

  return (
    <>
      <TopBar username={username} />
      {/* Listen for order events and push notifications */}
      <OrderNotificationHandler />
      <Dashboard />
    </>
  );
};

export default Home;
