import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const FuturisticChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f111a',
        titleColor: '#00f2ff',
        bodyColor: '#e0e0e0',
        borderColor: '#1e2235',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#a0a0a0',
          font: { size: 10 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#a0a0a0',
          font: { size: 10 },
          callback: (value) => '₹' + value,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 5,
      },
    },
  };

  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: 'Portfolio Value',
        data: [1200, 1900, 1500, 2100, 2400, 2200, 2456],
        borderColor: '#00f2ff',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(0, 242, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 242, 255, 0)');
          return gradient;
        },
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-wrapper p-6 bg-[#0f111a] rounded-2xl border border-[#1e2235] mt-6 animate-up h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white m-0">Portfolio Growth</h3>
          <p className="text-xs text-dim mt-1">Real-time performance metrics</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-full border border-cyan-500/20">PRO ANALYTICS</span>
        </div>
      </div>
      <div className="h-[300px]">
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default FuturisticChart;
