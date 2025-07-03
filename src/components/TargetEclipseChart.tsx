import React from 'react';
import { Card } from './ui/card';

interface TargetEclipseChartProps {
  totalProfit: number;
  target: number;
  onEditTarget?: () => void;
}

// Simple eclipse/progress chart using SVG
const TargetEclipseChart: React.FC<TargetEclipseChartProps> = ({ totalProfit, target, onEditTarget }) => {
  const percent = target > 0 ? Math.min(100, (totalProfit / target) * 100) : 0;
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="glassy-card mb-4 bg-white/60 backdrop-blur border border-white/40 flex flex-row items-center justify-between p-4">
      <div className="flex flex-col items-start justify-center flex-1 pr-4 min-w-[140px]">
        <span className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
          🎯 Know your target
        </span>
        <span className="text-base text-gray-600 flex items-center gap-2">
          📈 Track your progress
        </span>
        <button
          className="mt-4 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors"
          onClick={onEditTarget}
        >
          Edit Target
        </button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="mb-2">
          <circle
            stroke="#e5e7eb"
            fill="none"
            strokeWidth={stroke}
            cx={radius}
            cy={radius}
            r={normalizedRadius}
          />
          <circle
            stroke="url(#target-gradient)"
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.6s cubic-bezier(.4,1.7,.7,1)' }}
            cx={radius}
            cy={radius}
            r={normalizedRadius}
          />
          <defs>
            <linearGradient id="target-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dy="0.3em"
            fontSize="1.5rem"
            fill="#22223b"
            fontWeight="bold"
          >
            {percent.toFixed(0)}%
          </text>
        </svg>
        <div className="text-gray-700 text-sm font-medium">
          ${totalProfit.toFixed(2)} / ${target.toFixed(2)}
        </div>
      </div>
    </Card>
  );
};

export default TargetEclipseChart;
