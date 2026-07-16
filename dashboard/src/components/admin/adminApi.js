import axios from "axios";

// Central base URL for admin calls (matches the rest of the dashboard).
export const API_BASE = (process.env.REACT_APP_API_URL || process.env.REACT_APP_API_HOST || "http://localhost:3002") + "/api/admin";

export const adminGet = (path, params) =>
  axios.get(`${API_BASE}${path}`, { params, withCredentials: true }).then((r) => r.data);

export const adminPost = (path, body) =>
  axios.post(`${API_BASE}${path}`, body, { withCredentials: true }).then((r) => r.data);

export const formatINR = (v) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(v || 0));

export const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");
