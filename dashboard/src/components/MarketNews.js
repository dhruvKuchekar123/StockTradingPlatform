import React, { useState } from "react";
import { marketNews } from "../data/data";
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { motion } from "framer-motion";

const categories = ["All", "Stocks", "Economy", "Global", "IPO"];

const sentimentConfig = {
  bullish: { icon: TrendingUp, color: "var(--success)", badge: "badge-green", label: "Bullish" },
  bearish: { icon: TrendingDown, color: "var(--danger)", badge: "badge-red", label: "Bearish" },
  neutral: { icon: Minus, color: "var(--text-dim)", badge: "badge-neutral", label: "Neutral" },
};

const MarketNews = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredNews = activeCategory === "All"
    ? marketNews
    : marketNews.filter(n => n.category === activeCategory);

  return (
    <div className="p-6 animate-up">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <Newspaper size={28} style={{ color: "var(--accent-gold)" }} />
            Market <span className="gold">News</span>
          </h1>
          <p className="section-subtitle">Latest financial headlines from trusted Indian sources</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            className={activeCategory === cat ? "btn-gold" : "btn-glass"}
            onClick={() => setActiveCategory(cat)}
            style={{ fontSize: "12px", padding: "7px 16px" }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((news, index) => {
          const sentiment = sentimentConfig[news.sentiment];
          const SentimentIcon = sentiment.icon;

          return (
            <motion.div
              key={news.id}
              className="news-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`badge ${sentiment.badge}`}>
                  <SentimentIcon size={10} />
                  {sentiment.label}
                </span>
                <span className="badge badge-neutral">{news.category}</span>
              </div>

              <h3 style={{
                fontSize: "15px",
                fontWeight: 600,
                lineHeight: 1.45,
                color: "var(--text-main)",
                margin: "0 0 12px 0",
              }}>
                {news.headline}
              </h3>

              <div className="flex items-center gap-3" style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                <span style={{ fontWeight: 600, color: "var(--accent-gold)" }}>{news.source}</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {news.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center p-6" style={{ color: "var(--text-dim)" }}>
          No news found for this category.
        </div>
      )}
    </div>
  );
};

export default MarketNews;
