import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, AreaSeries } from 'lightweight-charts';
import axios from 'axios';
import usePriceFeed from '../hooks/usePriceFeed';
import { BarChart3 } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const AdvancedChart = ({ symbol = "RELIANCE" }) => {
    const chartContainerRef = useRef();
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    
    const [interval, setInterval] = useState("5min");
    const [chartType, setChartType] = useState("Candle");
    
    const { prices } = usePriceFeed([symbol]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#5A6478',
                fontFamily: "'JetBrains Mono', monospace",
            },
            grid: {
                vertLines: { color: 'rgba(42, 48, 64, 0.3)' },
                horzLines: { color: 'rgba(42, 48, 64, 0.3)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            crosshair: {
                vertLine: { color: 'rgba(212, 175, 55, 0.3)', width: 1, style: 2 },
                horzLine: { color: 'rgba(212, 175, 55, 0.3)', width: 1, style: 2 },
            },
            rightPriceScale: {
                borderColor: '#2A3040',
            },
            timeScale: {
                borderColor: '#2A3040',
            },
        });
        
        chartRef.current = chart;
        let series;

        if (chartType === "Candle") {
            series = chart.addSeries(CandlestickSeries, {
                upColor: '#22C55E',
                downColor: '#EF4444',
                borderVisible: false,
                wickUpColor: '#22C55E',
                wickDownColor: '#EF4444'
            });
        } else if (chartType === "Line") {
            series = chart.addSeries(LineSeries, {
                color: '#D4AF37',
                lineWidth: 2,
            });
        } else if (chartType === "Area") {
            series = chart.addSeries(AreaSeries, {
                lineColor: '#D4AF37',
                topColor: 'rgba(212, 175, 55, 0.2)',
                bottomColor: 'rgba(212, 175, 55, 0)',
                lineWidth: 2,
            });
        }
        
        seriesRef.current = series;

        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/market/candles/${symbol}?interval=${interval}`);
                if (res.data.success && res.data.data.length > 0) {
                    const sortedData = res.data.data.sort((a, b) => a.time - b.time);
                    
                    if (chartType === "Line" || chartType === "Area") {
                        const lineData = sortedData.map(d => ({ time: d.time, value: d.close }));
                        series.setData(lineData);
                    } else {
                        series.setData(sortedData);
                    }
                }
            } catch(err) {
                console.error("Failed to fetch historical data", err);
            }
        };

        fetchData();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [symbol, interval, chartType]);

    // Update real-time latest tick
    useEffect(() => {
        const liveData = prices[symbol];
        if (liveData && liveData.price && seriesRef.current) {
            const ts = Math.floor(Date.now() / 1000);
            if (chartType === "Candle") {
                seriesRef.current.update({
                    time: ts, 
                    open: liveData.price, 
                    high: liveData.price, 
                    low: liveData.price, 
                    close: liveData.price
                });
            } else {
                seriesRef.current.update({
                    time: ts,
                    value: liveData.price
                });
            }
        }
    }, [prices, symbol, chartType]);

    const intervals = ["1min", "5min", "15min", "1D"];
    const types = ["Candle", "Line", "Area"];

    return (
        <div className="chart-wrapper p-4" style={{ marginTop: "20px" }}>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 className="flex items-center gap-2" style={{ fontSize: "16px", fontWeight: 700, margin: 0, fontFamily: "var(--font-display)" }}>
                    <BarChart3 size={18} style={{ color: "var(--accent-gold)" }} />
                    {symbol} <span style={{ color: "var(--accent-gold)" }}>Performance</span>
                </h3>
                
                <div className="flex items-center gap-3">
                    {/* Chart Type Toggle */}
                    <div className="flex gap-1" style={{ background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "8px" }}>
                        {types.map(t => (
                            <button 
                                key={t}
                                onClick={() => setChartType(t)}
                                style={{
                                    padding: "5px 12px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    fontFamily: "var(--font-body)",
                                    background: chartType === t ? "var(--accent-gold)" : "transparent",
                                    color: chartType === t ? "#0F1117" : "var(--text-dim)",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Interval Toggle */}
                    <div className="flex gap-1">
                        {intervals.map(int => (
                            <button 
                                key={int}
                                onClick={() => setInterval(int)}
                                style={{
                                    padding: "5px 10px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    fontFamily: "var(--font-body)",
                                    background: interval === int ? "var(--accent-gold-dim)" : "transparent",
                                    color: interval === int ? "var(--accent-gold)" : "var(--text-dim)",
                                    border: interval === int ? "1px solid var(--border-gold)" : "1px solid var(--border)",
                                }}
                            >
                                {int}
                            </button>
                        ))}
                    </div>
                    
                    <span className="badge badge-green" style={{ animation: "pulse-dot 2s ease-in-out infinite" }}>
                      LIVE
                    </span>
                </div>
            </div>
            <div ref={chartContainerRef} />
        </div>
    );
};

export default AdvancedChart;
