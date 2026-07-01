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
        backgroundColor: 'rgba(22, 27, 34, 0.95)',
        titleColor: '#D4AF37',
        bodyColor: '#F0F4F8',
        borderColor: '#2A3040',
        borderWidth: 1,
        padding: 14,
        displayColors: false,
        titleFont: { family: "'Inter', sans-serif", size: 11, weight: '700' },
        bodyFont: { family: "'JetBrains Mono', monospace", size: 13 },
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y.toLocaleString('en-IN');
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#5A6478',
          font: { size: 10, family: "'Inter', sans-serif", weight: '500' },
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
        ticks: {
          color: '#5A6478',
          font: { size: 10, family: "'JetBrains Mono', monospace" },
          callback: (value) => '₹' + value.toLocaleString('en-IN'),
        },
        border: {
          display: false,
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
        hoverBorderColor: '#D4AF37',
        hoverBackgroundColor: '#D4AF37',
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
        borderColor: '#D4AF37',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(212, 175, 55, 0.15)');
          gradient.addColorStop(0.5, 'rgba(212, 175, 55, 0.05)');
          gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
          return gradient;
        },
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-wrapper p-6" style={{ marginTop: "24px" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-main)", margin: 0, fontFamily: "var(--font-display)" }}>
            Portfolio <span style={{ color: "var(--accent-gold)" }}>Growth</span>
          </h3>
          <p style={{ fontSize: "11px", color: "var(--text-dim)", margin: "4px 0 0 0" }}>
            Monthly performance metrics
          </p>
        </div>
        <span className="badge badge-gold">
          PRO ANALYTICS
        </span>
      </div>
      <div style={{ height: "300px" }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default FuturisticChart;
