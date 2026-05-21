export const watchlist = [
  { name: "AAPL", price: 170.00, percent: "-1.60%", isDown: true },
  { name: "MSFT", price: 410.00, percent: "-0.09%", isDown: true },
  { name: "TSLA", price: 180.00, percent: "3.54%", isDown: false },
  { name: "AMZN", price: 175.00, percent: "0.32%", isDown: false },
  { name: "GOOGL", price: 155.00, percent: "-0.15%", isDown: true },
  { name: "NVDA", price: 850.00, percent: "1.44%", isDown: false },
  { name: "META", price: 480.00, percent: "1.04%", isDown: false },
  { name: "NFLX", price: 610.00, percent: "-0.01%", isDown: true },
  { name: "DIS", price: 110.00, percent: "-0.25%", isDown: true },
];

export const holdings = [
  { name: "AAPL", qty: 2, avg: 150.00, price: 170.00, net: "+13.33%", day: "+2.99%", isLoss: false },
  { name: "TSLA", qty: 1, avg: 200.00, price: 180.00, net: "-10.00%", day: "-1.60%", isLoss: true },
  { name: "MSFT", qty: 5, avg: 380.00, price: 410.00, net: "+7.89%", day: "+0.80%", isLoss: false },
  { name: "AMZN", qty: 2, avg: 185.00, price: 175.00, net: "-5.40%", day: "-0.01%", isLoss: true },
];

export const positions = [
  { product: "CNC", name: "NVDA", qty: 1, avg: 860.00, price: 850.00, net: "-1.16%", day: "-1.24%", isLoss: true },
  { product: "CNC", name: "GOOGL", qty: 2, avg: 140.00, price: 155.00, net: "+10.71%", day: "+1.35%", isLoss: false },
];
