import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const STORAGE_KEY = "sf_onboarding_done";

const steps = [
  {
    id: "watchlist",
    targetId: "watchlist-search",
    title: "📋 Your Watchlist",
    description:
      "This is your live watchlist. All tracked stocks update in real-time via WebSocket. Hover any stock to reveal Buy/Sell/Chart action buttons.",
    placement: "right",
  },
  {
    id: "buy-button",
    targetId: "watchlist-search",
    title: "💰 Buy & Sell Stocks",
    description:
      'Hover over any stock in the watchlist and click the green ▲ to Buy or red ▼ to Sell. A modal will open with Market, Limit, Stop-Loss and GTT order types.',
    placement: "right",
  },
  {
    id: "holdings-nav",
    targetId: "menu-holdings",
    title: "💼 View Your Holdings",
    description:
      "Click Holdings in the top nav to see all stocks you own, your average cost, live P&L, and portfolio allocation donut chart.",
    placement: "bottom",
  },
  {
    id: "funds-nav",
    targetId: "menu-funds",
    title: "💳 Manage Funds",
    description:
      "Click Funds to add money to your wallet via Razorpay. Your wallet balance is used for buying stocks.",
    placement: "bottom",
  },
  {
    id: "notification-bell",
    targetId: "notification-bell",
    title: "🔔 Live Notifications",
    description:
      "This bell shows real-time order execution alerts. When your buy or sell order is executed, you'll get an instant notification here.",
    placement: "bottom-left",
  },
  {
    id: "chart-icon",
    targetId: "watchlist-search",
    title: "📊 Stock Charts",
    description:
      'Hover any watchlist stock and click the chart icon (📊) to open a full candlestick chart with 1min, 5min, 15min and 1D intervals.',
    placement: "right",
  },
];

const getTargetRect = (targetId) => {
  const el = document.getElementById(targetId);
  if (!el) return null;
  return el.getBoundingClientRect();
};

const OnboardingTour = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay to let the dashboard render
      const t = setTimeout(() => setActive(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const rect = getTargetRect(steps[step].targetId);
    setTargetRect(rect);
  }, [active, step]);

  const finish = () => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  if (!active) return null;

  const currentStep = steps[step];
  const padding = 8;
  const tooltipWidth = 300;

  // Calculate tooltip position
  let tooltipStyle = {};
  if (targetRect) {
    const placement = currentStep.placement;
    if (placement === "right") {
      tooltipStyle = {
        top: Math.max(targetRect.top, 16),
        left: targetRect.right + 16,
      };
    } else if (placement === "bottom") {
      tooltipStyle = {
        top: targetRect.bottom + 14,
        left: Math.max(
          16,
          Math.min(
            targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
            window.innerWidth - tooltipWidth - 16
          )
        ),
      };
    } else if (placement === "bottom-left") {
      tooltipStyle = {
        top: targetRect.bottom + 14,
        left: Math.max(
          16,
          targetRect.right - tooltipWidth
        ),
      };
    }
  } else {
    // Fallback: center of screen
    tooltipStyle = {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  return (
    <AnimatePresence>
      {active && (
        <>
          {/* Dark overlay with spotlight cutout */}
          <motion.div
            key="onboarding-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              pointerEvents: "none",
            }}
          >
            {/* Overlay mask */}
            {targetRect && (
              <svg
                style={{
                  position: "fixed",
                  inset: 0,
                  width: "100vw",
                  height: "100vh",
                  pointerEvents: "none",
                }}
              >
                <defs>
                  <mask id="spotlight-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <rect
                      x={targetRect.left - padding}
                      y={targetRect.top - padding}
                      width={targetRect.width + padding * 2}
                      height={targetRect.height + padding * 2}
                      rx="8"
                      fill="black"
                    />
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0,0,0,0.7)"
                  mask="url(#spotlight-mask)"
                />
                {/* Gold glow ring around target */}
                <rect
                  x={targetRect.left - padding}
                  y={targetRect.top - padding}
                  width={targetRect.width + padding * 2}
                  height={targetRect.height + padding * 2}
                  rx="8"
                  fill="none"
                  stroke="rgba(212,175,55,0.8)"
                  strokeWidth="2"
                />
              </svg>
            )}
          </motion.div>

          {/* Clickable backdrop (to skip) */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3001,
              cursor: "default",
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Tooltip */}
          <motion.div
            key={`tour-step-${step}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              zIndex: 3100,
              width: `${tooltipWidth}px`,
              ...tooltipStyle,
            }}
          >
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-gold)",
                borderRadius: "16px",
                boxShadow:
                  "0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(212,175,55,0.1)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))",
                  borderBottom: "1px solid var(--border-gold)",
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={12} style={{ color: "var(--accent-gold)" }} />
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "var(--accent-gold)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Getting Started — Step {step + 1}/{steps.length}
                  </span>
                </div>
                <button
                  onClick={finish}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-dim)",
                    display: "flex",
                    padding: "2px",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "16px 16px 14px" }}>
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    lineHeight: 1.3,
                  }}
                >
                  {currentStep.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "12px",
                    color: "var(--text-dim)",
                    lineHeight: 1.55,
                  }}
                >
                  {currentStep.description}
                </p>
              </div>

              {/* Progress dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "5px",
                  padding: "0 16px 4px",
                }}
              >
                {steps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === step ? "18px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background:
                        i <= step
                          ? "var(--accent-gold)"
                          : "rgba(255,255,255,0.12)",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>

              {/* Footer Buttons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px 14px",
                }}
              >
                <button
                  onClick={finish}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-body)",
                    padding: "4px",
                  }}
                >
                  Skip Tour
                </button>

                <div style={{ display: "flex", gap: "8px" }}>
                  {step > 0 && (
                    <button
                      onClick={prev}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        border: "1px solid var(--border)",
                        background: "transparent",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--text-dim)",
                        fontFamily: "var(--font-body)",
                        transition: "all 0.2s",
                      }}
                    >
                      <ChevronLeft size={13} />
                      Back
                    </button>
                  )}
                  <button
                    onClick={next}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "7px 14px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        "linear-gradient(135deg, #D4AF37, #E8C547)",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#0F1117",
                      fontFamily: "var(--font-body)",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 12px rgba(212,175,55,0.3)",
                    }}
                  >
                    {step === steps.length - 1 ? "🎉 Let's Trade!" : "Next"}
                    {step < steps.length - 1 && <ChevronRight size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Export a function to reset the tour for testing
export const resetOnboardingTour = () =>
  localStorage.removeItem(STORAGE_KEY);

export default OnboardingTour;
