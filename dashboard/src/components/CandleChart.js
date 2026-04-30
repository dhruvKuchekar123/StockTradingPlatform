import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

const CandleChart = () => {
    const chartContainerRef = useRef();

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.1)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.1)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        // Use addLineSeries as a robust fallback to ensure the dashboard works!
        // We will try to make it look futuristic with a gradient.
        const series = chart.addAreaSeries({
            topColor: 'rgba(0, 242, 255, 0.4)',
            bottomColor: 'rgba(0, 242, 255, 0.0)',
            lineColor: 'rgba(0, 242, 255, 1)',
            lineWidth: 2,
        });

        const data = [
            { time: '2024-01-01', value: 1555.00 },
            { time: '2024-01-02', value: 1565.00 },
            { time: '2024-01-03', value: 1545.00 },
            { time: '2024-01-04', value: 1540.00 },
            { time: '2024-01-05', value: 1548.00 },
            { time: '2024-01-06', value: 1560.00 },
            { time: '2024-01-07', value: 1555.00 },
        ];

        series.setData(data);

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    return (
        <div className="chart-wrapper p-4 bg-[#0f111a] rounded-xl border border-[#1e2235] mt-4 animate-up">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-cyan-400">Market Performance</h3>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded border border-cyan-500/20">LIVE</span>
                </div>
            </div>
            <div ref={chartContainerRef} />
        </div>
    );
};

export default CandleChart;
