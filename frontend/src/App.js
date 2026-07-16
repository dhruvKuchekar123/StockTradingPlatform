import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "./App.css";
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";
const DASHBOARD_URL = process.env.REACT_APP_DASHBOARD_URL || "http://localhost:3005";

const marketItems = [
  ["NIFTY", "24,782.10", "+0.82%"],
  ["BANKNIFTY", "53,216.45", "-0.18%"],
  ["SENSEX", "81,431.20", "+0.64%"],
  ["RELIANCE", "2,918.75", "+1.42%"],
  ["TCS", "4,126.40", "-0.36%"],
  ["HDFC", "1,719.85", "+0.58%"],
  ["BTC", "$68,420", "+2.14%"],
  ["GOLD", "72,816", "-0.22%"],
];

const products = [
  ["Stocks", "Live quotes, smart baskets, GTT orders, and fast execution.", "ST"],
  ["Options", "Option chain, payoff curves, Greeks, IV rank, and scalper tools.", "OP"],
  ["Futures", "Margin-aware futures workflows with contract insights.", "FU"],
  ["ETFs", "Track low-cost themes and sector rotation in real time.", "ET"],
  ["Mutual Funds", "Goal-based SIPs with risk analytics and fund comparison.", "MF"],
  ["IPOs", "Premium IPO discovery, alerts, subscription data, and apply flow.", "IP"],
  ["Research Signals", "AI-backed trade setups with confidence and risk markers.", "AI"],
  ["Portfolio Analytics", "Allocation, drift, drawdown, and performance intelligence.", "PA"],
];

const optionsCards = [
  ["Option Chain", "Live OI, IV, volume heatmaps, and strike-by-strike depth."],
  ["Strategy Builder", "Create spreads, straddles, and hedges with margin checks."],
  ["Payoff Chart", "Animated payoff curves with breakeven and risk zones."],
  ["Scalper Mode", "Compressed ladder view for quick entries and exits."],
];

const pricingPlans = [
  ["Starter", "Free", "For investors building their first serious portfolio.", ["Equity delivery", "Basic charts", "Portfolio tracker"]],
  ["Pro", "₹499/mo", "For active traders who need signals and speed.", ["Advanced charts", "AI trade signals", "Options analytics", "Priority alerts"]],
  ["Elite", "₹1,499/mo", "For high-volume traders and research-led teams.", ["API trading", "Market depth", "Dedicated support", "Custom risk desk"]],
];

function AnimatedHeadline({ text }) {
  const words = text.split(" ");

  return (
    <h1 className="hero-title" aria-label={text}>
      {words.map((word, index) => (
        <span className="headline-word" key={`${word}-${index}`}>
          <span className="headline-char" style={{ animationDelay: `${index * 0.07}s` }}>
            {word}
          </span>
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
}

function MarketTicker({ compact = false }) {
  const loop = [...marketItems, ...marketItems];

  return (
    <div className={`market-ticker ${compact ? "market-ticker--compact" : ""}`}>
      <div className="ticker-track">
        {loop.map(([name, price, move], index) => {
          const isPositive = move.startsWith("+");
          return (
            <div className="ticker-card" key={`${name}-${index}`}>
              <span>{name}</span>
              <strong>{price}</strong>
              <em className={isPositive ? "positive" : "negative"}>{move}</em>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniCandles() {
  const candles = [38, 56, 34, 72, 48, 84, 62, 91, 58, 76, 43, 68, 88, 52, 74, 96, 66, 81];

  return (
    <div className="candle-chart" aria-label="Candlestick chart preview">
      <svg viewBox="0 0 620 260" role="img">
        <defs>
          <linearGradient id="lineGlow" x1="0" x2="1">
            <stop offset="0%" stopColor="#5891FF" />
            <stop offset="100%" stopColor="#18B27A" />
          </linearGradient>
        </defs>
        {[40, 90, 140, 190, 240].map((y) => (
          <line className="chart-grid" x1="0" x2="620" y1={y} y2={y} key={y} />
        ))}
        <path
          className="chart-line"
          d="M0 184 C55 166, 76 123, 118 137 S195 186, 242 126 S324 62, 374 93 S459 169, 512 96 S578 51, 620 72"
        />
        {candles.map((height, index) => {
          const x = 24 + index * 32;
          const up = index % 3 !== 1;
          const y = 128 - height / 2 + (index % 4) * 12;
          return (
            <g key={x}>
              <line className={up ? "wick up" : "wick down"} x1={x + 7} x2={x + 7} y1={y - 18} y2={y + height + 16} />
              <rect className={up ? "candle up" : "candle down"} x={x} y={y} width="14" height={height} rx="4" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TradingTerminal({ elevated = false, onOpenDashboard }) {
  const [activeTimeframe, setActiveTimeframe] = useState("5D");
  const [orderMode, setOrderMode] = useState("Buy");
  const watchlist = [
    ["RELIANCE", "2,918.75", "+1.42%"],
    ["INFY", "1,576.30", "-0.34%"],
    ["TATASTEEL", "168.85", "+2.08%"],
    ["ICICIBANK", "1,137.20", "+0.66%"],
  ];

  return (
    <section className={`terminal-shell ${elevated ? "terminal-shell--hero" : ""}`}>
      <div className="terminal-header">
        <div>
          <span className="eyebrow">Live Terminal</span>
          <h2>Stock Flow Pro X</h2>
        </div>
        <div className="terminal-tabs">
          <span className="active">NSE</span>
          <span>BSE</span>
          <span>F&O</span>
        </div>
      </div>
      <div className="terminal-grid">
        <aside className="watchlist-panel">
          <div className="panel-title">Watchlist</div>
          {watchlist.map(([name, price, move]) => (
            <div className="watch-row" key={name}>
              <span>{name}</span>
              <strong>{price}</strong>
              <em className={move.startsWith("+") ? "positive" : "negative"}>{move}</em>
            </div>
          ))}
        </aside>
        <main className="chart-panel">
          <div className="chart-toolbar">
            <div>
              <span>NIFTY 50</span>
              <strong>24,782.10</strong>
            </div>
            <div className="timeframes">
              {["1D", "5D", "1M", "1Y"].map((timeframe) => (
                <button
                  className={activeTimeframe === timeframe ? "active" : ""}
                  onClick={() => setActiveTimeframe(timeframe)}
                  key={timeframe}
                >
                  {timeframe}
                </button>
              ))}
            </div>
          </div>
          <MiniCandles />
        </main>
        <aside className="order-panel">
          <div className="order-switch">
            {["Buy", "Sell"].map((mode) => (
              <button
                className={orderMode === mode ? mode.toLowerCase() : ""}
                onClick={() => setOrderMode(mode)}
                key={mode}
              >
                {mode}
              </button>
            ))}
          </div>
          <label>
            Quantity
            <input value="25" readOnly />
          </label>
          <label>
            Limit Price
            <input value="24,780.50" readOnly />
          </label>
          <div className="depth-list">
            <span>Market Depth</span>
            <div><em className="positive">24,780.35</em><strong>1,240</strong></div>
            <div><em className="negative">24,781.10</em><strong>890</strong></div>
          </div>
          <button className="execute-btn" onClick={onOpenDashboard}>{orderMode} in Dashboard</button>
        </aside>
      </div>
      <div className="portfolio-strip">
        <div><span>Portfolio</span><strong>₹18.42L</strong></div>
        <div><span>Day P&L</span><strong className="positive">+₹42,860</strong></div>
        <div><span>Margin Used</span><strong>38%</strong></div>
        <div><span>Risk</span><strong>Balanced</strong></div>
      </div>
    </section>
  );
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchStatus, setSearchStatus] = useState("idle");
  const [liveSearchResults, setLiveSearchResults] = useState([]);
  const [activeOption, setActiveOption] = useState(0);
  const [session, setSession] = useState({ token: "", profile: null });
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const searchableSymbols = useMemo(
    () => ["RELIANCE", "NIFTY", "BANKNIFTY", "SENSEX", "TCS", "HDFC", "INFY", "ICICIBANK", "BTC", "GOLD"],
    []
  );

  const token = session.token;
  const isLoggedIn = Boolean(token);

  const goToDashboard = () => {
    if (token) {
      window.location.href = `${DASHBOARD_URL}/?token=${token}`;
      return;
    }
    window.location.href = "/login";
  };

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToSignup = () => {
    window.location.href = "/signup";
  };

  const openDashboardSection = (path = "") => {
    if (token) {
      window.location.href = `${DASHBOARD_URL}${path}?token=${token}`;
      return;
    }
    window.location.href = "/login";
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openSearch = (value = "") => {
    setSearchValue(value);
    setSearchOpen(true);
  };

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();
    openSearch(searchValue);
  };

  const handleLogout = () => {
    Cookies.remove("token", { path: "/" });
    localStorage.removeItem("token");
    setSession({ token: "", profile: null });
    setLogoutConfirmOpen(false);
  };

  useEffect(() => {
    const revealItems = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem("token") || Cookies.get("token") || "";
    if (!savedToken) return;

    setSession((current) => ({ ...current, token: savedToken }));

    axios
      .get(`${API_BASE_URL}/api/user/profile`, { withCredentials: true })
      .then(({ data }) => {
        if (data?.success) {
          setSession({ token: savedToken, profile: data });
        }
      })
      .catch(() => {
        setSession((current) => ({ ...current, token: savedToken }));
      });
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const query = searchValue.trim().toUpperCase();
    if (!query) {
      setLiveSearchResults([]);
      setSearchStatus("idle");
      return;
    }

    const matchedSymbols = searchableSymbols.filter((symbol) => symbol.includes(query)).slice(0, 6);
    if (!matchedSymbols.length) {
      setLiveSearchResults([]);
      setSearchStatus("empty");
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchStatus("loading");
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/market/live-prices`,
          { symbols: matchedSymbols },
          { withCredentials: true }
        );
        const prices = data?.prices || data?.data || {};
        setLiveSearchResults(
          matchedSymbols.map((symbol) => ({
            symbol,
            price: prices[symbol]?.price || prices[symbol] || "Live",
            change: prices[symbol]?.change || prices[symbol]?.changePercent || "Open",
          }))
        );
        setSearchStatus("ready");
      } catch (error) {
        setLiveSearchResults(matchedSymbols.map((symbol) => ({ symbol, price: "Quote", change: "Open" })));
        setSearchStatus("ready");
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchOpen, searchValue, searchableSymbols]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveOption((current) => (current + 1) % optionsCards.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Stock Flow Pro home">
          <span className="brand-mark">SF</span>
          <span>Stock Flow Pro</span>
        </a>
        <nav>
          <button onClick={() => scrollToSection("markets")}>Markets</button>
          <button onClick={() => scrollToSection("terminal")}>Trading</button>
          <button onClick={() => scrollToSection("research")}>Research</button>
          <button onClick={() => scrollToSection("pricing")}>Pricing</button>
          <button onClick={() => scrollToSection("learn")}>Learn</button>
        </nav>
        <form className="search-pill" onSubmit={handleHeaderSearchSubmit}>
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onFocus={() => openSearch(searchValue)}
            placeholder="Search stocks, ETFs, options..."
            aria-label="Search stocks, ETFs, options"
          />
          <button type="submit">Search</button>
        </form>
        <div className="header-actions">
          {isLoggedIn ? (
            <>
              <button className="ghost-btn" onClick={() => setLogoutConfirmOpen(true)}>Logout</button>
              <button className="primary-btn" onClick={goToDashboard}>Dashboard</button>
            </>
          ) : (
            <>
              <button className="ghost-btn" onClick={goToLogin}>Login</button>
              <button className="primary-btn" onClick={goToSignup}>Open Account</button>
            </>
          )}
        </div>
      </header>

      {logoutConfirmOpen && (
        <div className="confirm-overlay" onClick={() => setLogoutConfirmOpen(false)}>
          <div className="confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="confirm-header">
              <h3><span>↘</span> Confirm Logout</h3>
              <button onClick={() => setLogoutConfirmOpen(false)} aria-label="Close logout confirmation">×</button>
            </div>
            <p>You are about to end your Stock Flow Pro session. Any open dashboard actions may need login again.</p>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setLogoutConfirmOpen(false)}>Stay Logged In</button>
              <button className="confirm-danger" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(event) => event.stopPropagation()}>
            <input
              autoFocus
              placeholder="Search stocks, ETFs, options..."
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <div className="search-results">
              {searchStatus === "idle" &&
                searchableSymbols.slice(0, 6).map((item) => (
                  <button key={item} onClick={() => openDashboardSection(`/?symbol=${encodeURIComponent(item)}`)}>{item}<span>Open dashboard</span></button>
                ))}
              {searchStatus === "loading" && <div className="search-empty">Fetching live quotes...</div>}
              {searchStatus === "empty" && <div className="search-empty">No matching symbol found</div>}
              {searchStatus === "ready" &&
                liveSearchResults.map((item) => (
                  <button key={item.symbol} onClick={() => openDashboardSection(`/?symbol=${encodeURIComponent(item.symbol)}`)}>
                    {item.symbol}
                    <span>{item.price} · {item.change}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <span className="hero-kicker">Real-time intelligence for Indian markets</span>
            <AnimatedHeadline text="Trade Smarter with Real-Time Market Intelligence" />
            <p>
              Advanced charts, AI trade signals, options insights, and portfolio tracking
              inside one fast premium terminal built for decisive traders.
            </p>
            <div className="hero-actions">
              <button className="primary-btn primary-btn--large" onClick={goToDashboard}>Start Trading</button>
              <button className="secondary-btn" onClick={() => scrollToSection("terminal")}>Explore Platform</button>
            </div>
            <div className="hero-stats">
              <div><strong>12ms</strong><span>quote refresh</span></div>
              <div><strong>₹0</strong><span>equity delivery</span></div>
              <div><strong>4.8/5</strong><span>trader rating</span></div>
            </div>
          </div>
          <div className="hero-dashboard">
            <TradingTerminal elevated onOpenDashboard={goToDashboard} />
          </div>
        </section>

        <MarketTicker />

        <section className="section terminal-section reveal" id="terminal">
          <div className="section-heading">
            <span className="eyebrow">Trading Dashboard</span>
            <h2>A dense terminal that still feels effortless.</h2>
            <p>Watchlists, market depth, orders, positions, and P&L stay visible without fighting for attention.</p>
          </div>
          <TradingTerminal onOpenDashboard={goToDashboard} />
        </section>

        <section className="section products-section" id="markets">
          <div className="section-heading reveal">
            <span className="eyebrow">Products</span>
            <h2>Everything a serious market participant expects.</h2>
          </div>
          <div className="product-grid">
            {products.map(([title, body, icon], index) => (
              <article className="product-card reveal" style={{ transitionDelay: `${index * 0.04}s` }} key={title}>
                <div className="product-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{body}</p>
                <button className="card-link" onClick={() => openDashboardSection("/")}>Open in dashboard</button>
              </article>
            ))}
          </div>
        </section>

        <section className="section research-section" id="research">
          <div className="section-heading section-heading--dark reveal">
            <span className="eyebrow">AI Research</span>
            <h2>Signals with context, not noise.</h2>
            <p>Every setup includes momentum, risk score, entry zone, target, and stop loss.</p>
          </div>
          <div className="insight-grid">
            {[
              ["AI Trade Signals", "87%", "Long bias detected on RELIANCE above 2,900."],
              ["Risk Score", "Low", "Volatility compression with rising delivery volume."],
              ["Entry Zone", "2,902-2,918", "Breakout area confirmed by price action."],
              ["Target", "3,040", "Projected upside based on recent swing range."],
              ["Stop Loss", "2,842", "Invalidation below demand cluster."],
            ].map(([label, value, body], index) => (
              <article className="insight-card reveal" style={{ transitionDelay: `${index * 0.06}s` }} key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <p>{body}</p>
                <div className="sparkline" />
              </article>
            ))}
          </div>
        </section>

        <section className="options-section">
          <div className="options-copy reveal">
            <span className="eyebrow">Options Desk</span>
            <h2>Professional options workflows, simplified.</h2>
            <p>Move from chain to strategy to execution with the clarity of a focused product console.</p>
            <div className="option-feature-list">
              {optionsCards.map(([title, body], index) => (
                <button
                  className={activeOption === index ? "active" : ""}
                  onClick={() => setActiveOption(index)}
                  onDoubleClick={() => openDashboardSection("/")}
                  key={title}
                >
                  <strong>{title}</strong>
                  <span>{body}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="options-visual reveal">
            <div className="chain-table">
              {["52600", "52700", "52800", "52900", "53000"].map((strike, index) => (
                <div className={index === activeOption + 1 ? "active" : ""} key={strike}>
                  <span className="positive">{(18.4 + index * 4.2).toFixed(1)}</span>
                  <strong>{strike}</strong>
                  <span className="negative">{(22.9 - index * 2.8).toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="payoff-graph">
              <svg viewBox="0 0 480 180" role="img" aria-label="Options payoff graph">
                <line x1="0" x2="480" y1="116" y2="116" />
                <path d="M10 145 C90 145, 110 134, 166 118 S250 62, 302 72 S380 128, 468 40" />
              </svg>
            </div>
          </div>
        </section>

        <section className="section portfolio-section">
          <div className="section-heading reveal">
            <span className="eyebrow">Portfolio</span>
            <h2>Allocation, performance, and risk in one calm workspace.</h2>
          </div>
          <div className="portfolio-grid">
            <article className="allocation-card reveal">
              <h3>Portfolio Allocation</h3>
              {[
                ["Large Cap", "54%"],
                ["Mid Cap", "22%"],
                ["ETFs", "14%"],
                ["Cash", "10%"],
              ].map(([label, value]) => (
                <div className="progress-row" key={label}>
                  <span>{label}</span>
                  <em>{value}</em>
                  <div><i style={{ width: value }} /></div>
                </div>
              ))}
            </article>
            <article className="pnl-card reveal">
              <span>Daily P&L</span>
              <strong className="positive">+₹42,860</strong>
              <p>2.38% intraday performance led by banks and metals.</p>
            </article>
            <article className="performance-card reveal">
              <h3>Performance</h3>
              <div className="performance-graph" />
            </article>
            <article className="risk-card reveal">
              <span>Risk Level</span>
              <strong>Balanced</strong>
              <p>Exposure is within your preferred volatility range.</p>
            </article>
          </div>
        </section>

        <section className="section pricing-section" id="pricing">
          <div className="section-heading reveal">
            <span className="eyebrow">Pricing</span>
            <h2>Choose the market edge that fits your trading style.</h2>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map(([name, price, body, features]) => (
              <article className={`pricing-card reveal ${name === "Pro" ? "featured" : ""}`} key={name}>
                <span>{name}</span>
                <strong>{price}</strong>
                <p>{body}</p>
                {features.map((feature) => (
                  <div className="plan-feature" key={feature}>{feature}</div>
                ))}
                <button className={name === "Pro" ? "primary-btn" : "outline-btn"} onClick={name === "Starter" ? goToSignup : goToDashboard}>{name === "Starter" ? "Start Free" : "Choose Plan"}</button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer" id="learn">
        <div className="footer-top">
          <div>
            <a className="brand brand--footer" href="#top">
              <span className="brand-mark">SF</span>
              <span>Stock Flow Pro</span>
            </a>
            <p>Premium market infrastructure for traders, investors, and research-led teams across Indian equities, derivatives, mutual funds, ETFs, and IPOs.</p>
          </div>
          <div className="footer-cta">
            <span>Ready for market open?</span>
            <strong>Launch your trading workspace in seconds.</strong>
            <div className="footer-actions">
              <button className="primary-btn" onClick={goToDashboard}>Open Dashboard</button>
              <button className="footer-outline-btn" onClick={goToSignup}>Create Account</button>
            </div>
          </div>
          <div className="footer-contact">
            <span>Support desk</span>
            <strong>support@stockflow.com</strong>
            <small>Mon-Sat, 8:00 AM - 7:00 PM IST</small>
          </div>
        </div>
        <div className="footer-grid">
          <div className="footer-column">
            <h3>Platform</h3>
            <button onClick={() => scrollToSection("markets")}>Markets</button>
            <button onClick={() => scrollToSection("terminal")}>Trading Terminal</button>
            <button onClick={() => scrollToSection("research")}>AI Research</button>
            <button onClick={() => scrollToSection("pricing")}>Pricing</button>
          </div>
          <div className="footer-column">
            <h3>Products</h3>
            <button onClick={() => openDashboardSection("/")}>Equity Delivery</button>
            <button onClick={() => openDashboardSection("/")}>Options Analytics</button>
            <button onClick={() => openDashboardSection("/")}>Mutual Funds</button>
            <button onClick={() => openDashboardSection("/")}>IPO Console</button>
          </div>
          <div className="footer-column">
            <h3>Resources</h3>
            <button onClick={() => scrollToSection("learn")}>Learning Center</button>
            <button onClick={() => scrollToSection("research")}>Market Signals</button>
            <button onClick={() => scrollToSection("markets")}>Calculators</button>
            <button onClick={() => scrollToSection("terminal")}>API Trading</button>
          </div>
          <div className="footer-column">
            <h3>Company</h3>
            <button onClick={goToSignup}>Open Account</button>
            <button onClick={goToLogin}>Login</button>
            <button onClick={goToDashboard}>Web Dashboard</button>
            <button onClick={() => scrollToSection("pricing")}>Brokerage</button>
          </div>
        </div>
        <MarketTicker compact />
        <div className="footer-bottom">
          <p>
            Stock Flow Pro Broking Ltd. is a technology-led trading platform for education, analytics, and execution workflows.
            Exchange data shown in this demo is illustrative.
          </p>
          <p>
            Investments in securities markets are subject to market risks. Read all related documents carefully before investing.
            Brokerage, taxes, and statutory charges may apply.
          </p>
          <div className="footer-meta">
            <span>© 2026 Stock Flow Pro</span>
            <button onClick={() => scrollToSection("top")}>Back to top</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
