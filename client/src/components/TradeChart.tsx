import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Trade {
  amount: number;
  type: 'profit' | 'loss';
  date: Date;
}

interface TradeChartProps {
  trades: Trade[];
}

const TradeChart: React.FC<TradeChartProps> = ({ trades }) => {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [variant, setVariant] = useState<string>('today');
  const now = new Date();

  // Variant options
  const getVariantOptions = () => {
    switch (timeframe) {
      case 'day':
        return [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' }
        ];
      case 'week':
        return [
          { value: 'thisWeek', label: 'This Week' },
          { value: 'lastWeek', label: 'Last Week' }
        ];
      case 'month':
        return [
          { value: 'thisMonth', label: 'This Month' },
          { value: 'lastMonth', label: 'Last Month' },
          { value: 'last3Months', label: 'Last 3 Months' }
        ];
      case 'year':
        return [
          { value: 'thisYear', label: 'This Year' },
          { value: 'lastYear', label: 'Last Year' },
          { value: 'last2Years', label: 'Last 2 Years' }
        ];
      default:
        return [];
    }
  };

  // Filter trades based on timeframe and variant
  const getFilteredTrades = () => {
    const start = new Date();
    const end = new Date();
    switch (timeframe) {
      case 'day':
        if (variant === 'today') {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'yesterday') {
          start.setDate(now.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end.setDate(now.getDate() - 1);
          end.setHours(23, 59, 59, 999);
        }
        break;
      case 'week': {
        const dayOfWeek = now.getDay();
        if (variant === 'thisWeek') {
          start.setDate(now.getDate() - dayOfWeek);
          start.setHours(0, 0, 0, 0);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'lastWeek') {
          start.setDate(now.getDate() - dayOfWeek - 7);
          start.setHours(0, 0, 0, 0);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
        }
        break;
      }
      case 'month': {
        if (variant === 'thisMonth') {
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'lastMonth') {
          start.setMonth(now.getMonth() - 1, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(now.getMonth(), 0);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'last3Months') {
          start.setMonth(now.getMonth() - 2, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(now.getMonth() + 1, 0);
          end.setHours(23, 59, 59, 999);
        }
        break;
      }
      case 'year': {
        if (variant === 'thisYear') {
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(11, 31);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'lastYear') {
          start.setFullYear(now.getFullYear() - 1, 0, 1);
          start.setHours(0, 0, 0, 0);
          end.setFullYear(now.getFullYear() - 1, 11, 31);
          end.setHours(23, 59, 59, 999);
        } else if (variant === 'last2Years') {
          start.setFullYear(now.getFullYear() - 2, 0, 1);
          start.setHours(0, 0, 0, 0);
          end.setFullYear(now.getFullYear() - 1, 11, 31);
          end.setHours(23, 59, 59, 999);
        }
        break;
      }
      default:
        break;
    }
    return trades.filter(t => t.date >= start && t.date <= end);
  };

  // Prepare chart data and labels
  const getChartData = () => {
    const filtered = getFilteredTrades();
    let data: { label: string; profit: number; loss: number }[] = [];
    if (timeframe === 'day') {
      // Show hours
      data = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        profit: filtered.filter(t => t.type === 'profit' && t.date.getHours() === i).reduce((sum, t) => sum + t.amount, 0),
        loss: filtered.filter(t => t.type === 'loss' && t.date.getHours() === i).reduce((sum, t) => sum + t.amount, 0),
      }));
    } else if (timeframe === 'week') {
      // Show days of week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      data = days.map((d, i) => ({
        label: d,
        profit: filtered.filter(t => t.type === 'profit' && t.date.getDay() === i).reduce((sum, t) => sum + t.amount, 0),
        loss: filtered.filter(t => t.type === 'loss' && t.date.getDay() === i).reduce((sum, t) => sum + t.amount, 0),
      }));
    } else if (timeframe === 'month') {
      // Show days of month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      data = Array.from({ length: daysInMonth }, (_, i) => ({
        label: `${i + 1}`,
        profit: filtered.filter(t => t.type === 'profit' && t.date.getDate() === i + 1).reduce((sum, t) => sum + t.amount, 0),
        loss: filtered.filter(t => t.type === 'loss' && t.date.getDate() === i + 1).reduce((sum, t) => sum + t.amount, 0),
      }));
    } else if (timeframe === 'year') {
      // Show months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = months.map((m, i) => ({
        label: m,
        profit: filtered.filter(t => t.type === 'profit' && t.date.getMonth() === i).reduce((sum, t) => sum + t.amount, 0),
        loss: filtered.filter(t => t.type === 'loss' && t.date.getMonth() === i).reduce((sum, t) => sum + t.amount, 0),
      }));
    }
    return data;
  };

  const chartData = getChartData();

  return (
    <div className="w-full">
      {/* Chart Filters */}
      <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div>
          <label className="mr-2 font-medium" htmlFor="timeframe-select">Timeframe:</label>
          <select
            id="timeframe-select"
            title="Select timeframe"
            value={timeframe}
            onChange={e => {
              setTimeframe(e.target.value as any);
              setVariant(getVariantOptions()[0].value);
            }}
            className="border rounded px-2 py-1"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium" htmlFor="variant-select">View:</label>
          <select
            id="variant-select"
            title="Select view variant"
            value={variant}
            onChange={e => setVariant(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {getVariantOptions().map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Chart */}
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value: number, name) => [`$${value.toFixed(2)}`, typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : '']} />
            <Legend />
            <Bar dataKey="profit" fill="#22c55e" name="Profit" radius={[4, 4, 0, 0]} />
            <Bar dataKey="loss" fill="#ef4444" name="Loss" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradeChart;
