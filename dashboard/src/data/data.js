export const watchlist = [
  { name: "RELIANCE", fullName: "Reliance Industries Ltd.", sector: "Energy", price: 2950.00, percent: "1.20%", isDown: false },
  { name: "TCS", fullName: "Tata Consultancy Services", sector: "IT", price: 3850.00, percent: "0.50%", isDown: false },
  { name: "INFY", fullName: "Infosys Limited", sector: "IT", price: 1450.00, percent: "-1.10%", isDown: true },
  { name: "HDFCBANK", fullName: "HDFC Bank Limited", sector: "Banking", price: 1440.00, percent: "-0.25%", isDown: true },
  { name: "ICICIBANK", fullName: "ICICI Bank Limited", sector: "Banking", price: 1080.00, percent: "0.85%", isDown: false },
  { name: "SBIN", fullName: "State Bank of India", sector: "Banking", price: 760.00, percent: "1.50%", isDown: false },
  { name: "TATAMOTORS", fullName: "Tata Motors Limited", sector: "Auto", price: 950.00, percent: "-0.40%", isDown: true },
  { name: "ITC", fullName: "ITC Limited", sector: "FMCG", price: 420.00, percent: "0.10%", isDown: false },
  { name: "BHARTIARTL", fullName: "Bharti Airtel Limited", sector: "Telecom", price: 1200.00, percent: "1.10%", isDown: false },
];

export const holdings = [
  { name: "RELIANCE", sector: "Energy", qty: 5, avg: 2800.00, price: 2950.00, net: "+5.35%", day: "+1.20%", isLoss: false },
  { name: "TCS", sector: "IT", qty: 2, avg: 3900.00, price: 3850.00, net: "-1.28%", day: "+0.50%", isLoss: true },
  { name: "INFY", sector: "IT", qty: 10, avg: 1400.00, price: 1450.00, net: "+3.57%", day: "-1.10%", isLoss: false },
  { name: "TATAMOTORS", sector: "Auto", qty: 15, avg: 980.00, price: 950.00, net: "-3.06%", day: "-0.40%", isLoss: true },
];

export const positions = [
  { product: "CNC", name: "HDFCBANK", sector: "Banking", qty: 10, avg: 1450.00, price: 1440.00, net: "-0.68%", day: "-0.25%", isLoss: true },
  { product: "MIS", name: "SBIN", sector: "Banking", qty: 20, avg: 750.00, price: 760.00, net: "+1.33%", day: "+1.50%", isLoss: false },
];

export const marketIndices = [
  { name: "NIFTY 50", value: 22419.55, change: 0.45, isUp: true },
  { name: "SENSEX", value: 73876.82, change: -0.12, isUp: false },
  { name: "BANKNIFTY", value: 48230.15, change: 0.78, isUp: true },
  { name: "NIFTY IT", value: 34520.60, change: -0.35, isUp: false },
];

export const aiInsights = [
  {
    id: 1,
    symbol: "RELIANCE",
    insight: "Bullish divergence detected on RSI with strong volume accumulation. Price likely to test ₹3,050 resistance.",
    confidence: 87,
    sentiment: "bullish",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    symbol: "TCS",
    insight: "Consolidating near support at ₹3,800 with declining volatility. Breakout expected in next 2-3 sessions.",
    confidence: 72,
    sentiment: "neutral",
    timestamp: "8 min ago",
  },
  {
    id: 3,
    symbol: "HDFCBANK",
    insight: "Death cross forming on daily chart. Short-term bearish outlook with target ₹1,380.",
    confidence: 65,
    sentiment: "bearish",
    timestamp: "15 min ago",
  },
  {
    id: 4,
    symbol: "SBIN",
    insight: "Strong buying pressure from FIIs. Golden cross on weekly chart suggests medium-term uptrend.",
    confidence: 81,
    sentiment: "bullish",
    timestamp: "22 min ago",
  },
];

export const marketNews = [
  {
    id: 1,
    headline: "RBI Keeps Repo Rate Unchanged at 6.5%, Maintains Accommodative Stance",
    source: "Economic Times",
    time: "10 min ago",
    sentiment: "neutral",
    category: "Economy",
  },
  {
    id: 2,
    headline: "Reliance Jio Reports Record 18% YoY Revenue Growth in Q4",
    source: "Moneycontrol",
    time: "25 min ago",
    sentiment: "bullish",
    category: "Stocks",
  },
  {
    id: 3,
    headline: "FIIs Turn Net Buyers With ₹4,200 Cr Inflow in Indian Equities",
    source: "LiveMint",
    time: "45 min ago",
    sentiment: "bullish",
    category: "Global",
  },
  {
    id: 4,
    headline: "TCS Bags $2.5 Billion Deal From UK-Based Financial Services Firm",
    source: "NDTV Profit",
    time: "1 hr ago",
    sentiment: "bullish",
    category: "Stocks",
  },
  {
    id: 5,
    headline: "SEBI Tightens Norms for F&O Trading, Raises Lot Size Requirements",
    source: "Business Standard",
    time: "2 hrs ago",
    sentiment: "bearish",
    category: "Economy",
  },
  {
    id: 6,
    headline: "Tata Motors EV Division Posts First-Ever Quarterly Profit",
    source: "Reuters India",
    time: "3 hrs ago",
    sentiment: "bullish",
    category: "Stocks",
  },
  {
    id: 7,
    headline: "US Fed Signals Potential Rate Cuts; Global Markets Rally",
    source: "Bloomberg Quint",
    time: "4 hrs ago",
    sentiment: "bullish",
    category: "Global",
  },
  {
    id: 8,
    headline: "Upcoming IPOs: Swiggy, Ola Electric Eye Record ₹30,000 Cr+ Listing",
    source: "Zee Business",
    time: "5 hrs ago",
    sentiment: "neutral",
    category: "IPO",
  },
];
