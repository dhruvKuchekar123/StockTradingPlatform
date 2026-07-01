import { useState, useEffect, useRef } from "react";

const WS_HOST = process.env.REACT_APP_WS_HOST || "localhost:3002";

const usePriceFeed = (symbols = []) => {
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  // Convert array to string for dependency array to avoid infinite loops
  const symbolsString = symbols.join(",");

  const [lastOrderEvent, setLastOrderEvent] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`ws://${WS_HOST}/ws/prices?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      if (symbols.length > 0) {
        ws.send(JSON.stringify({ type: "SUBSCRIBE", symbols }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "INITIAL_PRICES" || msg.type === "PRICE_UPDATE") {
          setPrices((prev) => ({ ...prev, ...msg.data }));
        } else if (msg.type === "ORDER_EXECUTED") {
          setLastOrderEvent(msg.data);
        }
      } catch (err) {
        console.error("[WS] Error parsing message:", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("[WS] Error:", err);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        // Optionally unsubscribe before closing
        ws.send(JSON.stringify({ type: "UNSUBSCRIBE", symbols }));
      }
      ws.close();
    };
  }, [symbolsString]);

  const subscribe = (newSymbols) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "SUBSCRIBE", symbols: newSymbols }));
    }
  };

  const unsubscribe = (oldSymbols) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "UNSUBSCRIBE", symbols: oldSymbols }));
    }
  };

  return { prices, connected, subscribe, unsubscribe, lastOrderEvent };
};

export default usePriceFeed;
